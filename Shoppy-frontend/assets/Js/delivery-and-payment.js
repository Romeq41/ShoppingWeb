import {handleAddAddress} from "./address.js";

document.addEventListener("DOMContentLoaded", () => {
    function escapeHtml(unsafe) {
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

    async function fetchProduct(productID) {
        const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/products.php/${escapeHtml(productID.toString())}`);
        return await res.json();
    }

    async function displayCart(user) {
        let productList = [];
        let total = 0;
        let deliveryFee = 5;
        let selectedDeliveryMethod = null;
        let selectedPaymentMethod = null;
        let selectedAddress = null;

        await loadCart(user);

        async function loadCart(user) {
            if (user) {
                const cart = await fetchCartItems(user.userID);
                localStorage.setItem('cart', JSON.stringify(cart));
                if (!cart) {
                    console.log('No cart items found');
                } else {
                    productList = await Promise.all(cart.cartItems.map(async (item) => {
                        const productData = await fetchProduct(item.productID);
                        return {...item, ...productData};
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
                        return {...item, ...productData};
                    }));
                    total = productList.reduce((acc, item) => acc + item.price * item.quantity, 0);
                }
            }

            document.getElementById("checkoutView").innerHTML = `
            
            <div class="delivery-payment-container">
                <div class="delivery-container">
                    <h2>Delivery Method</h2>
                    <div class="delivery-method">    
                        <h3>Choose delivery method: </h3>
                        <div class="delivery-options">
                            <button class="delivery-option" data-value="courier">
                                <i class="fa-solid fa-truck"></i>
                                <p>Courier</p>
                                <p>2-3 days</p>
                                <p>$5</p>
                            </button>
                            <button class="delivery-option" data-value="pickup">
                                <i class="fa-solid fa-store"></i>
                                <p>Pickup at Store</p>
                            </button>
                        </div>
                    </div>
                    <div class="delivery-address-container">
                        <h3>Choose delivery address: </h3>
                        <div class="address-options">
                            <div id="address-list"></div> 
                            <button class="address-option" data-value="new">
                                <i class="fa-solid fa-plus"></i>
                                <p>Add new address</p>
                            </button>      
                        </div>
                    </div>
                </div>
                
                <div class="payment-container">
                    <h2>Payment Method</h2>
                    <div class="payment-method">
                        <h3>Choose payment method: </h3>
                        <div class="payment-options">
                            <button class="payment-option" data-value="card">
                                <i class="fa-solid fa-credit-card"></i>
                                <p>Card</p>
                            </button>
                            <button class="payment-option" data-value="cash">
                                <i class="fa-solid fa-money-bill-wave"></i>
                                <p>Cash with Pickup</p>
                            </button>
                        </div>
                    </div>
                    <div class="payment-total">
                        <h3>Total:</h3>
                        <div>
                            <p id="total-amount">\$${escapeHtml(total.toFixed(2))}</p>
                            <p id="delivery-fee-text" style="display: none; color: gray;">+ $${escapeHtml(deliveryFee.toFixed(2))} Delivery Fee</p>
                        </div>
                    </div>
                    <button id="payment-details-button">Proceed to Payment Details</button>
                </div>
            </div>
        `;

            document.querySelectorAll('.delivery-option, .payment-option').forEach(option => {
                option.addEventListener('click', () => {
                    const isDelivery = option.classList.contains('delivery-option');
                    const group = isDelivery ? '.delivery-option' : '.payment-option';

                    document.querySelectorAll(group).forEach(btn => btn.classList.remove('selected'));
                    option.classList.add('selected');
                });
            });

            window.addEventListener('addressesUpdated', async () => {
                console.log('Addresses updated');
                await loadCart(user);
            });

            const addresses = localStorage.getItem('userAddress') ? JSON.parse(localStorage.getItem('userAddress')) : [];

            addresses.forEach(address => {
                document.getElementById('address-list').innerHTML += `
                    <button class="address-option" data-value='${escapeHtml(JSON.stringify(address))}'>
                        <i class="fa-solid fa-home"></i>
                        <p>${escapeHtml(address.street)}, ${escapeHtml(address.city)}, ${escapeHtml(address.zipcode)}</p>
                    </button>
                `;
            });

            const addressOptions = document.querySelectorAll('.address-option');
            addressOptions.forEach(option => {
                option.addEventListener('click', async () => {
                    addressOptions.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                    const selectedValue = option.getAttribute('data-value');
                    if (selectedValue === 'new') {
                        option.classList.remove('selected');
                        selectedAddress = await addOrderAddressForm();
                        console.log(`Address selected: ${selectedAddress}`);
                    } else {
                        selectedAddress = JSON.parse(selectedValue);
                        console.log(`Address selected: ${escapeHtml(selectedAddress.street)}, ${escapeHtml(selectedAddress.city)}, ${escapeHtml(selectedAddress.zipcode)}`);
                    }
                });
            });


            const deliveryOptions = document.querySelectorAll('.delivery-option');
            const paymentOptions = document.querySelectorAll('.payment-option');

            deliveryOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const selectedValue = option.getAttribute('data-value');

                    if (selectedValue !== selectedDeliveryMethod) {
                        deliveryOptions.forEach(opt => opt.classList.remove('selected'));
                        option.classList.add('selected');

                        const addressOptionsContainer = document.querySelectorAll('.address-option');
                        const deliveryFeeText = document.getElementById('delivery-fee-text');

                        if (selectedValue === 'courier') {
                            addressOptionsContainer.forEach(opt => {
                                opt.classList.remove('disabled');
                                opt.style.pointerEvents = 'auto';
                                opt.style.backgroundColor = '';
                            });

                            document.querySelector('.payment-option[data-value="cash"]').classList.add('disabled');
                            deliveryFeeText.style.display = 'block';
                            if (selectedPaymentMethod === 'cash') {
                                document.querySelector('.payment-option[data-value="card"]').classList.add('selected');
                                document.querySelector('.payment-option[data-value="cash"]').classList.remove('selected');
                            }

                        } else {
                            addressOptionsContainer.forEach(opt => {
                                opt.classList.add('disabled');
                                opt.style.pointerEvents = 'none';
                                opt.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
                            });
                            document.querySelector('.payment-option[data-value="cash"]').classList.remove('disabled');
                            if (document.querySelector('.payment-option[data-value="cash"]').classList.contains('selected')) {
                                document.querySelector('.payment-option[data-value="cash"]').classList.remove('selected');
                                document.querySelector('.payment-option[data-value="card"]').classList.add('selected');
                            }
                            deliveryFeeText.style.display = 'none';
                        }

                        selectedDeliveryMethod = selectedValue;
                        document.getElementById('total-amount').textContent = `\$${escapeHtml(total.toFixed(2))}`;
                        console.log(`Delivery option selected: ${escapeHtml(selectedValue)}`);
                    }
                });
            });

            paymentOptions.forEach(option => {
                option.addEventListener('click', () => {
                    paymentOptions.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                    const selectedValue = option.getAttribute('data-value');
                    selectedPaymentMethod = selectedValue;
                    console.log(`Payment option selected: ${escapeHtml(selectedValue)}`);
                });
            });

            document.getElementById("payment-details-button").addEventListener("click", () => {
                handleProceedToPaymentDetails(selectedDeliveryMethod, selectedPaymentMethod, selectedAddress);
                // handleCheckout(selectedDeliveryMethod,selectedPaymentMethod,selectedAddress);
            });
        }

        async function addOrderAddressForm() {
            return new Promise((resolve) => {
                document.body.insertAdjacentHTML('beforeend', `
                    <div id="userpage-overlay" class="overlay">
                        <div id="addAddress-form">
                            <h2>Add Address</h2>
                            <form id="addressForm">
                                <div class="form-group">
                                    <label for="street">Street:</label>
                                    <input type="text" id="street" name="street" required>
                                </div>
                                <div class="form-group">
                                    <label for="city">City:</label>
                                    <input type="text" id="city" name="city" required>
                                </div>
                                <div class="form-group">
                                    <label for="zipcode">Zip Code:</label>
                                    <input type="text" id="zipcode" name="zipcode" required>
                                </div>
                                <button type="submit">Add Address</button>
                            </form>
                        </div>
                    </div>
                `);

                document.getElementById('addressForm').addEventListener('submit', async function (event) {
                    event.preventDefault();

                    const newAddress = {
                        street: escapeHtml(event.target.street.value),
                        city: escapeHtml(event.target.city.value),
                        zipcode: escapeHtml(event.target.zipcode.value)
                    };

                    let addresses = localStorage.getItem('userAddress') ? JSON.parse(localStorage.getItem('userAddress')) : [];
                    addresses.push(newAddress);
                    localStorage.setItem('userAddress', JSON.stringify(addresses));

                    window.dispatchEvent(new Event("addressesUpdated"));

                    console.log(newAddress);

                    if (user) {
                        await handleAddAddress(event).then(() => {
                            document.getElementById('userpage-overlay').remove();
                            window.location.reload();
                        });
                    } else {
                        document.getElementById('userpage-overlay').remove();
                    }

                    resolve(newAddress);
                });

                document.getElementById('userpage-overlay').addEventListener('click', function (event) {
                    if (event.target.id === 'userpage-overlay') {
                        document.getElementById('userpage-overlay').remove();
                        resolve(null);
                    }
                });
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

    async function handleProceedToPaymentDetails(selectedDeliveryMethod, selectedPaymentMethod, selectedAddress) {
        if (!document.querySelector('.delivery-option.selected')) {
            alert('Please select a delivery method');
            return;
        } else if (!document.querySelector('.payment-option.selected')) {
            alert('Please select a payment method');
            return;
        }

        showLoadingScreen();

        if (selectedDeliveryMethod === 'courier') {
            console.log(selectedAddress);
            if (!selectedAddress) {
                alert('Please select a delivery address');
                hideLoadingScreen();
                return;
            }
        }
        localStorage.setItem('selectedDeliveryMethod', escapeHtml(selectedDeliveryMethod));
        localStorage.setItem('selectedPaymentMethod', escapeHtml(selectedPaymentMethod));
        localStorage.setItem('selectedAddress', JSON.stringify(selectedAddress));

        window.location.href = `${window.location.origin}${window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/'))}/personal-info.php`;
    }

    async function checkLoginForUserInfo() {
        const userValidateRes = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php/`, {});
        if (userValidateRes.ok) {
            const user = await userValidateRes.json();
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