document.addEventListener("DOMContentLoaded", () => {
    function escapeHtml(unsafe) {
        if (!unsafe) return null;
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    async function fetchCartItems(userID) {
        const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/cart.php/${escapeHtml(userID.toString())}/getAll`);
        if (res.ok) {
            return await res.json();
        } else {
            return false;
        }
    }

    async function fetchRemoveCartItems(cartID) {
        const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/cart.php/${escapeHtml(cartID.toString())}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });
        if (res.ok) {
            return await res.json();
        } else {
            return false;
        }
    }

    async function fetchProduct(productID) {
        const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/products.php/${escapeHtml(productID.toString())}`);
        return await res.json();
    }

    async function fetchCreateOrder(userID, total, orderItems, deliveryMethod, deliveryAddress, paymentMethod, personalInfo) {
        console.log(userID, total, orderItems, deliveryMethod, deliveryAddress, paymentMethod, personalInfo);
        if (!paymentMethod || total === undefined || !orderItems || (deliveryMethod === 'courier' && !deliveryAddress) || !deliveryMethod || !personalInfo) {
            console.error('Missing parameters: ', userID, total, orderItems, deliveryMethod, deliveryAddress, paymentMethod, personalInfo);
            return;
        }

        let preparedOrderItems = orderItems.map(item => {
            return {
                productID: escapeHtml(item.productID.toString()),
                quantity: item.quantity
            };
        });

        console.log(deliveryAddress);
        console.log(preparedOrderItems);
        console.log('Creating order');

        const body = JSON.stringify({
            userID: escapeHtml(userID),
            paymentMethod: escapeHtml(paymentMethod),
            total: total,
            deliveryMethod: escapeHtml(deliveryMethod),
            orderItems: preparedOrderItems,
            street: escapeHtml(deliveryAddress?.street) || null,
            city: escapeHtml(deliveryAddress?.city) || null,
            zipcode: escapeHtml(deliveryAddress?.zipcode) || null,
            contact_first_name: escapeHtml(personalInfo.firstname),
            contact_last_name: escapeHtml(personalInfo.lastname),
            contact_email: escapeHtml(personalInfo.email),
            contact_phone: escapeHtml(personalInfo.phone)
        });

        console.log(body);

        const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/order.php/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            },
            body: body
        });
        return await res.json();
    }

    async function displayCart(user) {
        let productList = [];
        let total = 0;
        const deliveryFee = 5.00;
        const selectedDeliveryMethod = localStorage.getItem('selectedDeliveryMethod');
        const selectedPaymentMethod = localStorage.getItem('selectedPaymentMethod');
        const selectedAddress = JSON.parse(localStorage.getItem('selectedAddress'));
        const personalInfo = JSON.parse(localStorage.getItem('personalInfo'));

        await loadCart(user);

        async function loadCart(user) {
            console.log(user);
            if (user) {
                const cart = await fetchCartItems(user.userID);
                localStorage.setItem('cart', JSON.stringify(cart));
                if (!cart || cart.cartItems.length === 0) {
                    // window.location.href = `${window.location.origin}${window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/'))}/cart.php`;
                } else {
                    productList = await Promise.all(cart.cartItems.map(async (item) => {
                        const productData = await fetchProduct(item.productID);
                        return {...item, ...productData};
                    }));
                }
                total = cart.cart.total;
            } else {
                const cart = JSON.parse(localStorage.getItem('guestCart'));
                if (cart === null || cart.cartItems.length === 0) {
                    // window.location.href = `${window.location.origin}${window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/'))}/cart.php`;
                } else {
                    const cartItems = cart.cartItems;
                    productList = await Promise.all(cartItems.map(async (item) => {
                        const productData = await fetchProduct(item.productID);
                        return {...item, ...productData};
                    }));
                    total = productList.reduce((acc, item) => acc + item.price * item.quantity, 0);
                }
            }

            if(productList.length > 0) {
                document.getElementById("checkoutView").innerHTML = `
                <div class="order-summary-container">  
                    <div class="summary-container">
                        <h2>Order Summary</h2>
                        <div class="order-summary">
                            <div class="personal-info">
                                <h3>Personal Information:</h3>
                                <p>${escapeHtml(personalInfo.firstname)} ${escapeHtml(personalInfo.lastname)}</p>
                                <p>${escapeHtml(personalInfo.email)}</p>
                                <p>+48 ${escapeHtml(personalInfo.phone)}</p>
                            </div>
                            
                            <div class="delivery-method">
                                <h3>Delivery Method: </h3>
                                ${selectedDeliveryMethod === 'courier' ? '<p>Courier</p>' : '<p>Store Pickup</p>'}
                            </div>
                            <div class="payment-method">
                                <h3>Payment Method: </h3>
                                ${selectedPaymentMethod === 'card' ? '<p>Card</p>' : '<p>Cash</p>'}
                            </div>
                            <div class="delivery-address">
                                <h3>Order Address: </h3>
                                <p>
                                    ${selectedAddress ? `
                                        ${escapeHtml(selectedAddress.street)}, ${escapeHtml(selectedAddress.city)}, ${escapeHtml(selectedAddress.zipcode)}
                                    ` : 'N/A'}
                                </p>
                            </div>
                            <div class="order-items">
                                <h3>Ordered Items:</h3>
                                <ul>
                                    ${productList.map(product => `
                                        <li>
                                            <p>${escapeHtml(product.name)} x${escapeHtml(product.quantity.toString())}</p>
                                            <p>$${escapeHtml((product.price * product.quantity).toFixed(2))}</p>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div> 
                        <div class="delivery-total">
                            <h3>Delivery Fee:</h3>  
                            <div class="delivery-fee">
                                ${selectedDeliveryMethod === 'courier' ? `  
                                        <p>$${escapeHtml(deliveryFee.toFixed(2))}</p>
                                ` : '$0.00'}
                            </div>
                        </div>
                        <div class="payment-total">
                            <h3>Total</h3>
                            <p id="total-amount">
                            $${selectedDeliveryMethod === 'courier' ? parseFloat(total + deliveryFee).toFixed(2) : total.toFixed(2)} 
                            </p>
                            <button id="payment-details-button">Proceed to Payment</button>
                        </div>
                    </div>
                </div>
            `;
            }

            window.addEventListener('addressesUpdated', async () => {
                await loadCart(user);
            });

            document.getElementById("payment-details-button").addEventListener("click", () => {
                handleCheckout(selectedDeliveryMethod, selectedPaymentMethod, selectedAddress, personalInfo);
            });
        }
    }

    function showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.display = 'flex';
    }

    function hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.display = 'none';
    }

    function updateCart() {
        window.dispatchEvent(new Event("cartUpdated"));
    }

    async function handleCheckout(selectedDeliveryMethod, selectedPaymentMethod, selectedAddress, personalInfo) {
        showLoadingScreen();

        console.log(selectedDeliveryMethod, selectedAddress, selectedPaymentMethod, personalInfo);

        const orderRes = await placeOrder(selectedDeliveryMethod, selectedAddress, selectedPaymentMethod, personalInfo);
        hideLoadingScreen();
        console.log(orderRes);

        if (orderRes) {
            console.log('Order placed');
            // console.log(order);
            window.location.href = `${window.location.origin}${window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/'))}/order-confirmation.php?orderID=${escapeHtml(orderRes.order.orderID.toString())}`;
        } else {
            console.error('Error placing order');
        }
    }

    async function placeOrder(deliveryMethod, deliveryAddress, paymentMethod, personalInfo) {
        const userRes = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php`);
        if (userRes.ok) {
            const user = await userRes.json();
            const userID = escapeHtml(user.data.userID.toString());
            const cart = JSON.parse(localStorage.getItem('cart'));
            if (cart === null) {
                console.error('No cart found');
                return;
            }

            if (cart.cartItems.length === 0) {
                console.error('No items in cart');
                return;
            }

            const res = await fetchCreateOrder(userID, cart.cart.total, cart.cartItems, deliveryMethod, deliveryAddress, paymentMethod, personalInfo);
            if (res) {
                console.log(res);
                const removeRes = await fetchRemoveCartItems(cart.cart.cartID.toString());
                if (removeRes) {
                    cart.cart.total = 0;
                    cart.cart.userID = null;
                    cart.cart.cartID = null;
                    cart.cartItems = [];
                    localStorage.setItem("cart", JSON.stringify(cart));
                    updateCart();
                    console.log(res);
                    return res;
                } else {
                    console.error('Error removing cart items');
                }
            } else {
                console.error('Error placing order');
            }
        } else {
            console.log(deliveryMethod, deliveryAddress, paymentMethod);
            const cart = JSON.parse(localStorage.getItem('guestCart'));
            console.log(cart);
            const res = await fetchCreateOrder(null, cart.cart.total, cart.cartItems, deliveryMethod, deliveryAddress, paymentMethod, personalInfo);
            console.log(res);
            if (res) {
                localStorage.removeItem('guestCart');
                localStorage.setItem('guestOrder', JSON.stringify(res.order));
                updateCart();
                console.log(res);
                return res;
            } else {
                console.error('Error placing order');
            }
        }

        return null;
    }

    async function checkLoginForUserInfo() {
        const userRes = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php`);
        if (userRes.ok) {
            const user = await userRes.json();
            displayCart(user.data);
        } else {
            displayCart(null);
        }
    }

    checkLoginForUserInfo();

    window.addEventListener('cartUpdated', async () => {
        console.log('Cart updated');
        const user = JSON.parse(localStorage.getItem('user'));
        await displayCart(user ? user.user : null);

        window.dispatchEvent(new Event("cartUpdatedEnd"));
    });
});