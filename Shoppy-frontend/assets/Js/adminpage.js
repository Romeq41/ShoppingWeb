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

    function displayAdminPage(users, products, orders, reports) {
        console.log(users);
        const adminContent = document.getElementById("admin-content");
        adminContent.innerHTML = `
            <div class="admin-page">
                <h2>Admin Dashboard</h2>

                <!-- Users Table -->
                <div class="admin-section" id="users-section">
                    <h3>Users</h3>
                    <table id="usersTable">
                        <thead>
                            <tr>
                                <th>userID</th>
                                <th>Username</th>
                                <th>Firstname</th>
                                <th>Lastname</th>
                                <th>phone</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map((user) => `
                                <tr>
                                    <td>${escapeHtml(user.userID.toString()) || 'N/A'}</td>
                                    <td>${escapeHtml(user.username) || 'N/A'}</td>
                                    <td>${escapeHtml(user.firstname) || 'N/A'}</td>
                                    <td>${escapeHtml(user.lastname) || 'N/A'}</td>
                                    <td>${escapeHtml(user.phone) || 'N/A'}</td>
                                    <td>${escapeHtml(user.email) || 'N/A'}</td>
                                    <td>
                                        <button class="edit-btn" data-type="user" data-index="${escapeHtml(user.userID.toString())}">Edit</button>
                                        <button class="delete-btn" data-type="user" data-index="${escapeHtml(user.userID.toString())}">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Products Table -->
                <div class="admin-section" id="products-section">
                    <div class="products-section-header">
                        <h3>Products</h3>
                        <button id="add-product-button">Add Product +</button>
                    </div>
                    <table id="productsTable">
                        <thead>
                            <tr>
                                <th>Product ID</th>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Created at</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.map((product) => `
                                <tr>
                                    <td>${escapeHtml(product.productID.toString()) || 'N/A'}</td>
                                    <td><img src="${escapeHtml(product.imageURL)}" alt="${escapeHtml(product.name)}" width="50" height="50"></td>
                                    <td style="width: fit-content">${escapeHtml(product.name) || 'N/A'}</td>
                                    <td>${escapeHtml(product.description) || 'N/A'}</td>
                                    <td>${escapeHtml(product.category) || 'N/A'}</td>
                                    <td>${escapeHtml(product.price.toString()) || 'N/A'}</td>
                                    <td>${escapeHtml(product.stock.toString()) || 'N/A'}</td>
                                    <td>${escapeHtml(product.created_at.toString()) || 'N/A'}</td>
                                    <td>
                                        <button class="edit-btn" data-type="product" data-index="${escapeHtml(product.productID.toString())}">Edit</button>
                                        <button class="delete-btn" data-type="product" data-index="${escapeHtml(product.productID.toString())}">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Orders Table -->
                <div class="admin-section" id="orders-section">
                    <h3>Orders</h3>
                    <table id="ordersTable">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>isFullfilled</th>
                                <th>Payment Method</th>
                                <th>Delivery Method</th>
                                <th>Delivery Address</th>
                                <th>Order Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orders.map((order) => `
                                <tr>
                                    <td>${escapeHtml(order.orderID.toString()) || 'N/A'}</td>
                                    <td>${escapeHtml(order.orderContactInfo.contact_first_name)} ${escapeHtml(order.orderContactInfo.contact_last_name)}</td>
                                    <td>${escapeHtml(order.total) || 'N/A'}</td>
                                    <td>${escapeHtml(order.isFullfilled === 0 ? 'False' : 'True')}</td>
                                    <td>${escapeHtml(order.paymentMethod) || 'N/A'}</td>
                                    <td>${escapeHtml(order.deliveryMethod) || 'N/A'}</td>
                                    <td>${order.orderAddress ? `${escapeHtml(order.orderAddress.street)} ${escapeHtml(order.orderAddress.city)} , ${escapeHtml(order.orderAddress.zipcode)}` : `N/A`}</td>
                                    <td>${escapeHtml(order.orderDate) || 'N/A'}</td>
                                    <td>
                                        <button class="edit-btn" data-type="order" data-index="${escapeHtml(order.orderID.toString())}">Edit</button>
                                        <button class="delete-btn" data-type="order" data-index="${escapeHtml(order.orderID.toString())}">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Reports Table -->
                <div class="admin-section" id="reports-section">
                    <h3>Reports</h3>
                    <table id="reportsTable">
                        <thead>
                            <tr>
                                <th>Report ID</th>
                                <th>email</th>
                                <th>Name</th>
                                <th>Subject</th>
                                <th>Report Data</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reports.map((report) => `
                                <tr>
                                    <td>${escapeHtml(report.reportID.toString()) || 'N/A'}</td>
                                    <td>${escapeHtml(report.email) || 'N/A'}</td>
                                    <td>${escapeHtml(report.name) || 'N/A'}</td>
                                    <td>${escapeHtml(report.subject) || 'N/A'}</td>
                                    <td>${escapeHtml(report.report_data) || 'N/A'}</td>
                                    <td>
                                        <button class="delete-btn" data-type="report" data-index="${escapeHtml(report.reportID.toString())}">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('add-product-button').addEventListener('click', () => {
            window.location.href = './addproduct.php';
        });

        // Adding event listeners to edit and delete buttons
        document.querySelectorAll(".edit-btn").forEach(button => {
            const type = button.getAttribute("data-type");
            const index = button.getAttribute("data-index");
            button.addEventListener("click", () => handleEdit(type, index));
        });

        document.querySelectorAll(".delete-btn").forEach(button => {
            const type = button.getAttribute("data-type");
            const index = button.getAttribute("data-index");

            button.addEventListener("click", async () => {
                showLoadingScreen();
                if (confirm('Are you sure you want to delete this item?')) {
                    await handleDelete(type, index);
                    window.dispatchEvent(new Event('adminPageUpdated'));
                    hideLoadingScreen();
                } else {
                    hideLoadingScreen();
                    console.log('Delete cancelled');
                }
            });
        });
    }

    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

    function handleEdit(type, index) {
        if (type === 'user') {
            window.location.href = `./edituser.php?userID=${index}`;
        } else if (type === 'product') {
            window.location.href = `./editproduct.php?productID=${index}`;
        } else {
            window.location.href = `./editorder.php?orderID=${index}`;
        }
    }

    async function handleDelete(type, index) {
        if (type === 'report') {
            const res = await fetchRemoveReport(escapeHtml(index));
            if (res.status === 'success') {
                return true;
            } else {
                console.error('Error deleting report:', res);
            }
        } else if (type === 'order') {
            const res = await fetchRemoveOrder(escapeHtml(index));
            if (res.status === 'success') {
                return true;
            } else {
                console.error('Error deleting order:', res);
            }
        } else if (type === 'product') {
            const res = await fetchRemoveProduct(escapeHtml(index));
            if (res.status === 'success') {
                return true;
            } else {
                console.error('Error deleting product:', res);
            }
        } else {
            const res = await fetchRemoveUser(escapeHtml(index));
            if (res.status === 'success') {
                return true;
            } else {
                console.error('Error deleting user:', res);
            }
        }
    }

    async function fetchOrders() {
        const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/order.php`);
        if (!res.ok) {
            console.error('Failed to fetch orders');
            return null;
        }
        return await res.json();
    }

    async function fetchProducts() {
        const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/products.php/getAll`);
        if (!res.ok) {
            console.error('Failed to fetch products');
            return null;
        }
        return await res.json();
    }

    async function fetchUsers() {
        const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php/AllUsers`);
        if (!res.ok) {
            console.error('Failed to fetch users');
            return null;
        }
        return await res.json();
    }

    async function fetchReports() {
        const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/report.php`);
        if (!res.ok) {
            console.error('Failed to fetch reports');
            return null;
        }
        return await res.json();
    }

    async function fetchRemoveReport(reportID) {
        const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/report.php/${escapeHtml(reportID)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            }
        });
        if (!res.ok) {
            console.error('Failed to delete report');
            return null;
        }
        return await res.json();
    }

    async function fetchRemoveProduct(productID) {
        const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/products.php/${escapeHtml(productID)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            }
        });
        if (!res.ok) {
            console.error('Failed to delete product');
            return null;
        }
        return await res.json();
    }

    async function fetchRemoveOrder(orderID) {
        const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/order.php/${escapeHtml(orderID)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            }
        });
        if (!res.ok) {
            console.error('Failed to delete order');
            return null;
        }
        return await res.json();
    }

    async function fetchRemoveUser(userID) {
        const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php/${escapeHtml(userID)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            }
        });
        if (!res.ok) {
            console.error('Failed to delete user');
            return null;
        }
        return await res.json();
    }

    async function checkLoginAndDisplayAdmin() {
        console.log('Checking login for user info');
        const response = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const checkToken = await response.json();
            console.log('User logged in:', checkToken.data);
            if (checkToken.data.role !== 1) {
                return;
            }
            const users = await fetchUsers() || [];
            const products = await fetchProducts() || [];
            const orders = await fetchOrders() || [];
            const reports = await fetchReports() || [];

            displayAdminPage(users.data, products, orders, reports);
        } else {
            window.location.href = '/index.php';
        }
    }

    function showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.display = 'flex';
        console.log('Loading screen displayed');
    }

    function hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.display = 'none';
        console.log('Loading screen hidden');
    }

    document.getElementById('users-button').addEventListener('click', async () => {
        const users = await fetchUsers();
        displayAdminPage(users.data, [], [], []);
    });

    document.getElementById('products-button').addEventListener('click', async () => {
        const products = await fetchProducts();
        displayAdminPage([], products, [], []);
    });

    document.getElementById('orders-button').addEventListener('click', async () => {
        const orders = await fetchOrders();
        console.log(orders);
        displayAdminPage([], [], orders, []);
    });

    document.getElementById('reports-button').addEventListener('click', async () => {
        const reports = await fetchReports();
        console.log(reports);
        displayAdminPage([], [], [], reports);
    });

    window.addEventListener('adminPageUpdated', async () => {
        await checkLoginAndDisplayAdmin();
    });

    checkLoginAndDisplayAdmin();
});