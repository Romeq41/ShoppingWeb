document.addEventListener("DOMContentLoaded", async () => {
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
        }
    } else {
        window.location.href = window.location.origin + window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/')) + '/index.php';
    }
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    const urlParams = new URLSearchParams(window.location.search);
    const userID = escapeHtml(urlParams.get('userID').toString());

    async function displayEditUserForm() {
        const userResponse = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php/${userID}`);
        const userResponseJSON = await userResponse.json();
        console.log('User response:', userResponseJSON);
        const user = userResponseJSON.data;
        console.log('User:', user);
        if (!user || user.role === 1) {
            alert('User not found');
            window.location.href = 'adminpage.php';
        }

        const addressResponse = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/address.php/${userID}`);
        const addresses = await addressResponse.json();

        console.log('Addresses:', addresses);

        document.getElementById('admin-content').insertAdjacentHTML('beforeend', `
            <div class="container edit-user-form">
                <h2>Edit User ID: ${escapeHtml(userID)}</h2>
                <form id="editUser-form">
                    <div class="form-group">
                        <label for="user-name">Username:</label>
                        <input id="user-name" name="user-name" required type="text">
                    </div>
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input id="email" name="email" required type="email">
                    </div>
                    <div class="form-group">
                        <label for="firstname">First Name:</label>
                        <input id="firstname" name="firstname" required type="text">
                    </div>
                    <div class="form-group">
                        <label for="lastname">Last Name:</label>
                        <input id="lastname" name="lastname" required type="text">
                    </div>
                    <div class="form-group">
                        <label for="phone">Phone:</label>
                        <input id="phone" name="phone" required type="text">
                    </div>

                    <div class="form-group">
                        <label for="role">Role:</label>
                        <select id="role" name="role">
                            <option value="admin">Admin(1)</option>
                            <option value="user">User(0)</option>
                        </select>
                    </div>
                    
                    <button type="submit">Save Changes</button>
                    <button type="button" id="new-password-button">Generate new password</button>
                   
                </form>
                    
                    <div id="addresses">
                        <h2>Edit Addresses</h2>
                        <div class="new-address">
                            <h3>New Address</h3>
                            <div class="form-group">
                                <label for="street">Street:</label>
                                <input name="street" required>

                                <label for="city">City:</label>
                                <input name="city" required>

                                <label for="zipcode">Zipcode:</label>
                                <input name="zipcode" required>

                                <button type="button" id="add-address-button">Add</button>
                            </div>
                        </div>

                        ${addresses.map((address, index) => `
                            <div class="existing-address">
                                <h3>Existing Address</h3>
                                <div class="form-group">
                                    <label for="street">Street:</label>
                                    <input name="street" value="${escapeHtml(address.street)}" disabled>
                                    
                                    <label for="city">City:</label>
                                    <input name="city" value="${escapeHtml(address.city)}" disabled>
                                    
                                    <label for="zipcode">Zipcode:</label>
                                    <input name="zipcode" value="${escapeHtml(address.zipcode)}" disabled>
                                    
                                    <button type="button" class="delete-address-button" data-index="${index}">Delete</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                
            </div>
        `);

        console.log(user);
        document.getElementById('user-name').value = escapeHtml(user.username);
        document.getElementById('firstname').value = escapeHtml(user.firstname);
        document.getElementById('lastname').value = escapeHtml(user.lastname);
        document.getElementById('email').value = escapeHtml(user.email);
        document.getElementById('phone').value = escapeHtml(user.phone);
        document.getElementById('role').value = user.role ? 'admin' : 'user';

        document.getElementById('editUser-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);

            for (let [key, value] of formData.entries()) {
                console.log(`${escapeHtml(key)}: ${escapeHtml(value)}`);
            }
            const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
            const body = JSON.stringify({
                username: escapeHtml(formData.get('user-name')),
                email: escapeHtml(formData.get('email')),
                firstname: escapeHtml(formData.get('firstname')),
                lastname: escapeHtml(formData.get('lastname')),
                phone: escapeHtml(formData.get('phone')),
                role: escapeHtml(formData.get('role')) === 'admin' ? 1 : 0
            });
            // console.log(body);
            const formRes = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php/${userID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: body
            });


            console.log('User updated:', formRes);
            if (formRes.ok) {
                const res=  await formRes.json();
                console.log(res);
                alert('User updated successfully');
                window.location.href = 'adminpage.php';
            } else {
                alert('Error updating user');
            }
        });

        document.getElementById('add-address-button').addEventListener('click', async () => {
            showLoadingScreen();

            const address = {
                street: escapeHtml(document.querySelector('.new-address input[name="street"]').value),
                city: escapeHtml(document.querySelector('.new-address input[name="city"]').value),
                zipcode: escapeHtml(document.querySelector('.new-address input[name="zipcode"]').value),
                userID: escapeHtml(userID)
            };

            const response = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/address.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(address),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Address added:', result);
                hideLoadingScreen();
                window.location.reload();
            } else {
                console.error('Failed to add address:', response);
                alert('Failed to add address');
                hideLoadingScreen();
            }
        });

        document.querySelectorAll('.delete-address-button').forEach(button => {
            button.addEventListener('click', async (event) => {
                showLoadingScreen();
                const addressID = escapeHtml(addresses[event.target.getAttribute('data-index')].addressID);
                const response = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/address.php/${addressID}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    console.log('Address deleted');
                    hideLoadingScreen();
                    window.location.reload();
                } else {
                    console.error('Failed to delete address:', response);
                    alert('Failed to delete address');
                    hideLoadingScreen();
                }
            });
        });

        document.getElementById('new-password-button').addEventListener('click', async () => {
            showLoadingScreen();
            const response = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php/generatePassword`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: escapeHtml(user.email) }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('New password:', result);
                alert('New password generated successfully');
                hideLoadingScreen();
            } else {
                console.error('Failed to generate new password:', response);
                alert('Failed to generate new password');
                hideLoadingScreen();
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

            await displayEditUserForm();
        } else {
            window.location.href = '../../index.php';
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

    document.getElementById('users-button').addEventListener('click', async () => {
        window.location.href = './adminpage.php';
    });

    document.getElementById('products-button').addEventListener('click', async () => {
        window.location.href = './adminpage.php';
    });

    document.getElementById('orders-button').addEventListener('click', async () => {
        window.location.href = './adminpage.php';
    });

    document.getElementById('reports-button').addEventListener('click', async () => {
        window.location.href = './adminpage.php';
    });

    checkLoginAndDisplayAdmin();
});