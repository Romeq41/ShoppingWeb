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

    async function fetchOrders(userID) {
        try {
            const response = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/order.php/user/${escapeHtml(userID)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    async function fetchOrderDetails(orderID) {
        try {
            const response = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/order.php/${escapeHtml(orderID)}/items`);
            if (!response.ok) {
                throw new Error('Failed to fetch order details');
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async function fetchProduct(productID) {
        try {
            const response = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/products.php/${escapeHtml(productID)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch product details');
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    function displayLoginForm() {
        if (document.getElementById("userView") === null) {
            return;
        }

        document.getElementById("userView").innerHTML = `
            <div class="login-form">
                <h2>Login</h2>
                <form id="loginForm">
                    <input type="email" id="email" placeholder="Email" required />
                    <input type="password" id="password" placeholder="Password" required />
                    <button type="submit">Login</button>
                </form>
                <div id="loginError" style="color:red;"></div>
                <p>Don't have an account? <a href="register.php">Register</a></p>
            </div>
        `;

        document.getElementById("loginForm").addEventListener("submit", handleLogin);
    }

    function displayUserInfo(user, userOrders) {
        if (document.getElementById("ordersView") === null) {
            return;
        }

        document.getElementById("ordersView").innerHTML = `
            <div class="sectionTag">
                <h1>My Orders</h1>
            </div>
            <div class="container info-container">
                ${userOrders ? `
                ${userOrders.length > 0 ? userOrders.map((order, index) => `

                    <div class="info-box">
                        <h2>Order #${escapeHtml(order.orderID.toString())}</h2>
                        <p>${'Total: $' + escapeHtml((order.total || '0.00').toString())}</p>
                        <p>${'Payment Method: ' + escapeHtml((order.paymentMethod || 'N/A').toString())}</p>
                        <p>${'Date: ' + escapeHtml((order.orderDate || 'N/A').toString())}</p>
                        <hr/>
                        <ul>
                            ${Array.isArray(order.orderItems) && order.orderItems.length > 0 ? order.orderItems.map(item => `
                                <li class="order-details">
                                    <img class="order-item-img" src="${escapeHtml(item.product.imageURL)}" alt="${escapeHtml(item.product.name)}"/>
                                    <p class="order-item-title">${escapeHtml(item.product.name)}</p>
                                    <p class="order-item-quantity">${'QTY: ' + escapeHtml(item.quantity.toString())}</p>
                                    <p class="order-item-price">$${escapeHtml(item.product.price.toString())}</p>
                                </li>
                                <hr />
                            `).join('') : '<p>No items found in this order</p>'}
                        </ul>
<!--                        <button class="rate-order-button" data-order-id="${escapeHtml(order.orderID.toString())}">Rate your order</button>-->
                        <button class="view-order-button" data-order-id="${escapeHtml(order.orderID.toString())}">View order details</button>
                    </div>
                `).join('') : '<p>No orders found</p>'}`
                : `<p>No orders found</p>`}

            </div>
        `;

        document.querySelectorAll(".view-order-button").forEach(button => {
            button.addEventListener("click", (event) => {
                if (!event.target.getAttribute("data-order-id")) {
                    return;
                }
                const orderID = event.target.getAttribute("data-order-id");
                window.location.href = `order-details.php?orderID=${escapeHtml(orderID)}`;
            });
        });

        document.querySelectorAll(".rate-order-button").forEach(button => {
            button.addEventListener("click", (event) => {
                if (!event.target.getAttribute("data-order-id")) {
                    return;
                }
                const orderID = event.target.getAttribute("data-order-id");
                window.location.href = `order-details.php?orderID=${escapeHtml(orderID)}`;
            });
        });
    }

    async function checkLoginForUserInfo() {
        const userRes = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php/`, {});

        if (userRes.ok) {
            const user = await userRes.json();
            console.log(user);
            const userOrders = await fetchOrders(escapeHtml(user.data.userID.toString()));
            console.log(userOrders);
            if (!userOrders || !userOrders.orders) {
                displayUserInfo(user.data, []);
                return;
            }
            userOrders.orders = await Promise.all(userOrders.orders.map(async order => {
                const orderItemsDetailsRes = await fetchOrderDetails(escapeHtml(order.orderID.toString()));
                console.log(orderItemsDetailsRes.order);
                const orderItems = Array.isArray(orderItemsDetailsRes.order.orderItems) ? await Promise.all(orderItemsDetailsRes.order.orderItems.map(async item => {
                    const product = await fetchProduct(escapeHtml(item.productID.toString()));
                    return {
                        ...item,
                        product
                    };
                })) : [];
                console.log(orderItems);
                return {
                    ...order,
                    orderItems
                };
            }));
            console.log(userOrders.orders);

            displayUserInfo(user.data, userOrders.orders);
        } else {
            displayLoginForm();
        }
    }

    checkLoginForUserInfo();
});