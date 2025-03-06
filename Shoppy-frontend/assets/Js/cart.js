async function fetchProduct(productID) {
    const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/products.php/${productID}`);
    if (res.ok) {
        return await res.json();
    } else {
        return false;
    }
}

async function fetchCartItems(userID) {
    const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/cart.php/${userID}/getAll`);
    if (res.ok) {
        return await res.json();
    } else {
        return false;
    }
}

export async function loadCart(user) {
    let productList = [];
    let total = 0;
    if (user) {
        const cart = await fetchCartItems(user.userID);
        localStorage.setItem('cart', JSON.stringify(cart));
        if (!cart) {
            console.log('No cart items found');
        } else {
            productList = await Promise.all(cart.cartItems.map(async (item) => {
                const productData = await fetchProduct(item.productID);
                return {
                    ...item,
                    ...productData
                };
            }));
        }
        total = cart.cart.total;
    } else {
        const cart = JSON.parse(localStorage.getItem('guestCart'));
        if (cart === null) {
            console.log('No cart items found');
        } else {
            const cartItems = cart.cartItems;
            productList = await Promise.all(cartItems.map(async (item) => {
                const productData = await fetchProduct(item.productID);
                return {
                    ...item,
                    ...productData
                };
            }));
            total = productList.reduce((acc, item) => acc + item.price * item.quantity, 0);
        }
    }

    return [productList, total];
}

async function handleRemoveItem(userID, productID) {
    if (userID) {
        let cart = JSON.parse(localStorage.getItem('cart'));
        if (cart.cartItems.length > 0) {
            const normalizedProductID = parseInt(escapeHtml(productID), 10);
            const cartItem = cart.cartItems.find(item => item.productID === normalizedProductID);
            if (!cartItem) {
                console.error('Item not found in cart.');
                return;
            }

            const cartItemID = cartItem.cartItemID;
            const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/cart.php/removeItem`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ cartItemID })
            });
            const result = await res.json();
            if (res.ok && result.message) {
                updateCart();
            } else {
                console.error('Error removing item from cart:', result);
            }
        }
        const normalizedProductID = parseInt(escapeHtml(productID), 10);
        cart.cartItems = cart.cartItems.filter(item => item.productID !== normalizedProductID);
        localStorage.setItem('cart', JSON.stringify(cart));
        await updateCart();
    } else {
        let cart = JSON.parse(localStorage.getItem('guestCart'));
        const normalizedProductID = parseInt(escapeHtml(productID), 10);
        cart.cartItems = cart.cartItems.filter(item => item.productID !== normalizedProductID);

        if (cart.cartItems.length === 0) {
            localStorage.removeItem('guestCart');
        } else {
            cart.total = await calculateTotal(cart.cartItems);
            localStorage.setItem('guestCart', JSON.stringify(cart));
        }
        updateCart();
    }
}

function escapeHtml(unsafe) {
    if (!unsafe) return null;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
async function handleDecreaseQuantity(userID, productID) {
    if (userID) {
        let cart = JSON.parse(localStorage.getItem('cart'));
        const normalizedProductID = parseInt(escapeHtml(productID), 10);
        let existingProduct = cart.cartItems.find(item => item.productID === normalizedProductID);
        if (!existingProduct) {
            console.error('Product not found in cart');
            return;
        }

        const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/cart.php/removeItem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify({ cartItemID: existingProduct.cartItemID })
        });

        if (res.ok) {
            updateCart();
        } else {
            console.error('Failed to decrease quantity:', await res.json());
        }
    } else {
        let guestCart = JSON.parse(localStorage.getItem('guestCart'));
        const normalizedProductID = parseInt(escapeHtml(productID), 10);
        let existingProduct = guestCart.cartItems.find(item => item.productID === normalizedProductID);
        if (!existingProduct) {
            console.error('Product not found in cart');
            return;
        }

        if (existingProduct.quantity > 1) {
            existingProduct.quantity--;
        } else {
            guestCart.cartItems = guestCart.cartItems.filter(item => item.productID !== normalizedProductID);
        }

        guestCart.cart.total = await calculateTotal(guestCart.cartItems);
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        updateCart();
    }
}

async function handleIncreaseQuantity(userID, productID) {
    if (userID) {
        let cart = JSON.parse(localStorage.getItem('cart'));
        const cartID = cart.cart.cartID;
        const normalizedProductID = parseInt(escapeHtml(productID), 10);
        let existingProduct = cart.cartItems.find(item => item.productID === normalizedProductID);
        if (!existingProduct) {
            console.error('Product not found in cart');
            return;
        }

        const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/cart.php/addItem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify({ cartID: escapeHtml(cartID.toString()), productID: existingProduct.productID })
        });

        if (res.ok) {
            updateCart();
        } else {
            console.error('Failed to increase quantity:', await res.json());
        }
    } else {
        let guestCart = JSON.parse(localStorage.getItem('guestCart')) || [];
        const normalizedProductID = parseInt(escapeHtml(productID), 10);
        let existingProduct = guestCart.cartItems.find(item => item.productID === normalizedProductID);
        if (!existingProduct) {
            console.error('Product not found in cart');
            return;
        }

        existingProduct.quantity++;
        guestCart.cart.total = await calculateTotal(guestCart.cartItems);
        console.log(guestCart);
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        updateCart();
    }
}

async function calculateTotal(cartItems) {
    let total = 0.00;
    for (const item of cartItems) {
        const product = await fetchProduct(item.productID);
        total += product.price * item.quantity;
    }

    return parseFloat(total).toFixed(2);
}

function updateCart() {
    window.dispatchEvent(new Event("cartUpdated"));
}

document.addEventListener("DOMContentLoaded", () => {
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    async function displayCartItems(productList, total, user) {
        console.log(productList);
        const userView = document.getElementById("userView");

        userView !== null ? userView.innerHTML = `
            <div class="cart-container">
                ${productList.length > 0 ? `
                <div class="cart-items-container">
                    ${productList.length > 0 ? productList.map((item) => `
                    <div class="cart-item-box">
                        <img src="${escapeHtml(item.imageURL)}" alt="${escapeHtml(item.name)}" />
                        <h2>${escapeHtml(item.name)}</h2>
                        <div class="cart-item-text">
                            <div id="quantity-menu">
                                <button class="decreaseQuantityIcon" data-product-id="${escapeHtml(item.productID.toString())}">
                                    <i class="fa-solid fa-minus"></i>
                                </button>
                                <p>${escapeHtml(item.quantity.toString())}</p>
                                <button class="increaseQuantityIcon" data-product-id="${item.productID}">
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                            </div>
                            <p id="price-tag">${'$' + escapeHtml(item.price.toFixed(2).toString())}</p>
                        </div>
                        <div class="icons">
                            <button class="removeButton" data-product-id="${escapeHtml(item.productID.toString())}">
                                <i class="fa-solid fa-times"></i>
                            </button>
                        </div>
                    </div>
                    `).join('') : ``}
                </div>
            ` : ''}
                ${productList.length > 0 ? `
                <div class="cart-summary">
                    <div class="summary-content">
                        <h2>Summary</h2>
                        <p>Total: $${escapeHtml(total.toFixed(2).toString())}</p>
                        <button id="delivery-button">
                            Delivery & Payment
                            <i class="fa-solid fa-truck-arrow-right"></i>
                        </button>
                    </div>
                    ` : `<p class="empty-message">Your cart is empty!
                            <button id="back-to-shopping-button">Go back to shopping!</button>
                        </p>`}
                </div>
            </div>
        ` : `<p class="empty-message">Your cart is empty! <button id="back-to-shopping-button">Go back to shopping!</button></p>`;


        if(userView !== null) {
            document.querySelectorAll('.decreaseQuantityIcon').forEach(button =>
                button.addEventListener('click', async (event) => {
                    showLoadingScreen();
                    const productID = event.currentTarget.dataset.productId;
                    await handleDecreaseQuantity(user ? user.userID : null, productID);
                    updateCart();
                    setTimeout(() => hideLoadingScreen(), 1000);
                })
            );

            document.querySelectorAll('.increaseQuantityIcon').forEach(button =>
                button.addEventListener('click', async (event) => {
                    showLoadingScreen();
                    const productID = event.currentTarget.dataset.productId;
                    await handleIncreaseQuantity(user ? user.userID : null, productID);
                    updateCart();
                    setTimeout(() => hideLoadingScreen(), 1000);
                })
            );

            document.querySelectorAll('.removeButton').forEach(button =>
                button.addEventListener('click', async (event) => {
                    showLoadingScreen();
                    const productID = event.currentTarget.dataset.productId;
                    await handleRemoveItem(user ? user.userID : null, productID);
                    updateCart();
                    setTimeout(() => hideLoadingScreen(), 1000);
                })
            );
            if (productList.length === 0 || !productList) {
                document.getElementById("back-to-shopping-button").addEventListener("click", () => {
                    window.location.href = window.location.origin + window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/')) + '/index.php';
                });
            } else {
                document.getElementById("delivery-button").addEventListener("click", handleDeliveryButton);
            }
        }
    }

    async function displayCart(user) {
        const [productList, total] = await loadCart(user);
        await displayCartItems(productList, total, user);
    }

    function showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.display = 'flex';
    }

    function hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.display = 'none';
    }



    async function handleDeliveryButton() {
        window.location.href = window.location.origin + window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/')) + '/delivery-and-payment.php';
    }

    async function checkLoginForUserInfo() {
        const userValidateRes = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php/`, {});
        if (userValidateRes.ok) {
            const user = await userValidateRes.json();
            await displayCart(user.data);
        } else {
            await displayCart(null);
        }
    }

    checkLoginForUserInfo();

    window.addEventListener('cartUpdated', async () => {
        console.log('Cart updated');

        await checkLoginForUserInfo();

        window.dispatchEvent(new Event("cartUpdatedEnd"));
    });
});