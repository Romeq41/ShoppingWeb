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

    async function fetchProduct(productID) {
        const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/products.php/${escapeHtml(productID.toString())}`);
        return await res.json();
    }

    async function fetchOrderDetails(orderID) {
        try {
            const response = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/order.php/${escapeHtml(orderID.toString())}/items`);
            if (!response.ok) {
                throw new Error('Failed to fetch order details');
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async function displayOrderDetails(order) {
        if (document.getElementById("orderDetailsView") === null) {
            return;
        }
        console.log(order);
        const orderItemsDetails = await Promise.all(order.orderItems.map(async (item) => {
            const product = await fetchProduct(item.productID.toString());
            return {
                ...item,
                product
            };
        }));
        console.log(orderItemsDetails);

        document.getElementById("orderDetailsView").innerHTML = `
        <div class="sectionTag">
            <h1>Order #${escapeHtml(order.orderID.toString())}</h1>
        </div>
        
        <div class="container info-container">
            <div class="info-box order-info-box">
                <h3>Order Details</h3>
                <p>${'Total: $' + escapeHtml(order.total.toString() || '0.00')}</p>
                <p>${'Payment Method: ' + escapeHtml(order.paymentMethod || 'N/A')}</p>
                <p>${'Shipping Method: ' + escapeHtml(order.deliveryMethod || 'N/A')}</p>
                <p>${'Shipping Cost: $' + + escapeHtml(order.deliveryMethod === 'courier' ? '5.00' : '0' || 'N/A')}</p>
                <p>${'Shipping Address: ' + escapeHtml(order.orderAddress.city || 'N/A') +' '+ escapeHtml(order.orderAddress.street || 'N/A') + ' '+ escapeHtml(order.orderAddress.zipcode || 'N/A')}</p>
                <p>${'Date: ' + escapeHtml(order.orderDate.toString() || 'N/A')}</p>
                <h3>Buyer:</h3>
                <p>${'Email: ' + escapeHtml(order.orderContactInfo.contact_email || 'N/A')}</p>
                <p>${'First Name: ' + escapeHtml(order.orderContactInfo.contact_first_name || 'N/A')}</p>
                <p>${'Last Name: ' + escapeHtml(order.orderContactInfo.contact_last_name || 'N/A')}</p>
                <p>${'Phone: ' + escapeHtml(order.orderContactInfo.contact_phone || 'N/A')}</p>
                
                <h3>Ordered Items</h3>
                <ul>
                    ${Array.isArray(orderItemsDetails) ? orderItemsDetails.map(item => `
                        <li class="order-details">
                            <img class="order-item-img" src="${escapeHtml(item.product.imageURL)}" alt="${escapeHtml(item.product.name)}"/>
                            <p class="order-item-title">${escapeHtml(item.product.name)}</p>
                            <p class="order-item-quantity">${'QTY: ' + escapeHtml(item.quantity.toString())}</p>
                            <p class="order-item-price">$${escapeHtml(item.product.price.toString())}</h3>
                            
                        </li>
                        <hr />
                    `).join('') : '<p>No items found</p>'}
                </ul>
            </div>
        </div>
        `;
    }

    function getOrderIDFromURL() {
        const params = new URLSearchParams(window.location.search);
        return escapeHtml(params.get('orderID'));
    }

    async function loadOrderDetails() {
        const orderID = getOrderIDFromURL();

        if (orderID) {
            const orderDetailsRes = await fetchOrderDetails(orderID);
            console.log(orderDetailsRes);
            if (orderDetailsRes) {
                displayOrderDetails(orderDetailsRes.order);
            } else {
                document.getElementById("orderDetailsView").innerHTML = '<p>Order not found</p>';
            }
        } else {
            document.getElementById("orderDetailsView").innerHTML = '<p>Invalid order ID</p>';
        }
    }

    async function checkLoginForUserInfo() {
        const userValidateRes = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php/`, {});
        console.log(userValidateRes);
        if (userValidateRes.ok) {
            loadOrderDetails();
        }
    }

    checkLoginForUserInfo();
});