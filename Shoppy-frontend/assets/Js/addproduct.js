document.addEventListener("DOMContentLoaded", () => {
    console.log('Admin script loaded');

    async function displayAddProductForm() {
        const adminContainer = document.getElementById('admin-content');
        adminContainer.innerHTML = `
            <div class="product-form">
                <h2>Add Product</h2>
                <form id="Product-form">
                    <div class="form-group">
                        <label for="name">Name:</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="description">Description:</label>
                        <input type="text" id="description" name="description" required>
                    </div>
                    <div class="form-group">
                        <label for="price">Price:</label>
                        <input type="number" id="price" name="price" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label for="imageURL">Image URL:</label>
                        <input type="text" id="imageURL" name="imageURL" required>
                    </div>
                    <div class="form-group">
                        <label for="stock">Stock:</label>
                        <input type="number" id="stock" name="stock" required>
                    </div>
                    <button type="submit">Add Product</button>
                </form> 
            </div>
        `;

        const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
        async function addProduct(product) {
            console.log('Adding product:', product);
            const response = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/products.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify(product),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Product added:', result);
                window.location.href = 'adminpage.php';
            } else {
                console.error('Failed to add product:', response.statusText);
            }
        }

        document.getElementById('Product-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const description = document.getElementById('description').value;
            const price = document.getElementById('price').value;
            const imageURL = document.getElementById('imageURL').value;
            const stock = document.getElementById('stock').value;
            const product = {name, description, price, imageURL, stock};

            const result = await addProduct(product);
            console.log(result);
            if (result.success) {
                alert('Product added successfully');
                window.location.reload();
            } else {
                alert('Failed to add product');
            }
        });
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
                alert('You are not authorized to view this page');
                window.location.href = '../../index.php';
            }

            displayAddProductForm();
        } else {
            window.location.href = '../../index.php';
        }
    }

    document.getElementById('users-button').addEventListener('click', async () => {
        window.location.href = '../../adminpage.php';
    });

    document.getElementById('products-button').addEventListener('click', async () => {
        window.location.href = '../../adminpage.php';
    });

    document.getElementById('orders-button').addEventListener('click', async () => {
        window.location.href = '../../adminpage.php';
    });

    document.getElementById('reports-button').addEventListener('click', async () => {
        window.location.href = '../../adminpage.php';

    });

    checkLoginAndDisplayAdmin();
});