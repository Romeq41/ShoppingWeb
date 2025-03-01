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

    function getOrderIDFromURL() {
        const params = new URLSearchParams(window.location.search);
        return escapeHtml(params.get('orderID'));
    }

    async function fetchOrder(orderID) {
        const response = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/order.php/${orderID}`);
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Error fetching order details');
            return null;
        }
    }

    async function fetchGuestOrder() {
        const guestOrder = localStorage.getItem('guestOrder');
        if (guestOrder) {
            localStorage.removeItem('guestOrder');
            return JSON.parse(guestOrder);
        }else {
            return null;
        }
    }

    async function displayConfirmationMessage() {
        const orderID = getOrderIDFromURL();
        if (!orderID) {
            document.getElementById("checkoutView").innerHTML = '<p>Invalid order ID</p>';
            return;
        }

        let order;

        let username = 'Guest';
        const userRes = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php`);
        if (userRes.ok) {
            const user = await userRes.json();
            username = escapeHtml(user.data.username);

            order = await fetchOrder(orderID);
            if (!order) {
                document.getElementById("checkoutView").innerHTML = '<p>Order not found</p>';
                return;
            }

            console.log(order);
        }else{
            order = await fetchGuestOrder();
            if(!order){
                document.getElementById("checkoutView").innerHTML = '<p>Order not found</p>';
                return;
            }

            if(order.orderID !== parseInt(orderID)){
                document.getElementById("checkoutView").innerHTML = '<p>Order not found</p>';
                return;
            }

            console.log(order);
        }


        console.log(order);

        const deliveryFee = 5.00;
        const orderTotal = parseFloat(order.total) || 0;
        const totalWithDelivery = order.deliveryMethod === 'courier' ? orderTotal + deliveryFee : orderTotal;

        console.log(order);
        document.getElementById("checkoutView").innerHTML = `
            <div class="order-summary-container">
                <div class="summary-container">
                    <h2>Order Confirmation</h2>
                    <div class="order-summary">
                        <h3>Thank you for your purchase, ${escapeHtml(username)}.</h3>
                        <p> Your order ID is: ${escapeHtml(order.orderID.toString())}</p>
                        ${order.deliveryMethod === 'pickup' ?
            `<p>Your order will be ready for pickup at the store</p>` : ` 
                            <p>Your order has been confirmed and will be shipped to the following address:</p>
                            <div class="order-confirmation-address">
                                <p>Street: ${escapeHtml(order.orderAddress?.street)}</p>
                                <p>City: ${escapeHtml(order.orderAddress?.city)}</p>
                                <p>Zipcode: ${escapeHtml(order.orderAddress?.zipcode)}</p>
                            </div>
                        `}
                        <h3>Order Information:</h3>
                        <p>Order Date: ${escapeHtml(order.orderDate)}</p>
                        <p>Payment Method: ${escapeHtml(order.paymentMethod)}</p>
                        <p>Name: ${escapeHtml(order.orderContactInfo?.contact_first_name)} ${escapeHtml(order.orderContactInfo?.contact_last_name)}</p>
                        <p>Phone: ${escapeHtml(order.orderContactInfo?.contact_phone)}</p>
                        <p>Email: ${escapeHtml(order.orderContactInfo?.contact_email)}</p>
                        <h3>Your total: $${escapeHtml(totalWithDelivery.toFixed(2))}</h3>
                    </div>
                    <button id="back-to-main-button">Back to Shopping</button>
                </div>
            </div>
        `;

        document.getElementById('back-to-main-button').addEventListener('click', () => {
            window.location.href = 'index.php';
        });
    }

    displayConfirmationMessage();

    window.addEventListener('cartUpdated', async () => {
        console.log('Cart updated');
        await displayConfirmationMessage();
        window.dispatchEvent(new Event("cartUpdatedEnd"));
    });

});