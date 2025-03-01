import {handleChangePassword, handleLogin} from "./auth.js";
import {addAddressForm, handleRemoveAddress} from "./address.js";
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
            <p>Forgot your password? <a href="password-reset.php">click here</a></p>
          </div>
        `;

        document.getElementById("loginForm").addEventListener("submit", handleLogin);
    }

    function displayUserInfo(user, userAddress) {
        if (document.getElementById("userView") === null) {
            return;
        }

        document.getElementById("userView").innerHTML = `
        <div class="sectionTag">
            <h2>User Info</h2>
            <button id="change-password-button">Change Password</button>
        </div>
        <div class="container info-container">

            <div class="info-box">
                <div class="icons">
                    <button class="editButton" data-type="credentials">
                        <p style="color: white">Edit</p>
                        <i class="fa-solid fa-edit"></i>
                    </button>
                </div>
                <h3>User Credentials</h3>
                <p><strong>Username:</strong> ${escapeHtml(user.username) || 'No Username'}</p>
                <p><strong>Email:</strong> ${user.email || 'No Email'}</p>
            </div>

        </div>

        <div class="container info-container">
            <div class="info-box">
                <div class="icons">
                    <button class="editButton" data-type="personal">
                    <p style="color: white">Edit</p> 
                        <i class="fa-solid fa-edit"></i>
                    </button>
                </div>
                <h3>Personal Info</h3>
                <p>${'First Name: ' + (escapeHtml(user.firstname) || '<em>N/A</em>')}</p>
                <p>${'Last Name: ' + (escapeHtml(user.lastname) || '<em>N/A</em>')}</p>
                <p>${'Phone Number: ' + (escapeHtml(user.phone?.toString()) || '<em>N/A</em>')}</p>
            </div>
        </div>

        <div class="sectionTag">
            <h2>Address</h2>
            <button id="add-address-button">Add Address</button>
        </div>
        <div class="container info-container">
            ${userAddress.length > 0 ? userAddress.map((address, index) => `
            <div class="info-box address-info">
                <div class="icons">
                    <button class="editButton" data-type="address" data-index="${index}" data-address-id="${escapeHtml(address.addressID.toString())}">
                        <p style="color: white">Edit</p>
                        <i class="fa-solid fa-edit" data-index="${index}"></i>
                    </button>
                    <button class="removeButton" data-type="address" data-index="${index}" data-address-id="${escapeHtml(address.addressID.toString())}">
                        <p style="color: white" data-index="${index}">Remove
                        <i class="fa-solid fa-times" data-index="${index}"></i>
                    </button>
                </div>
                <h3>Address #${escapeHtml(address.addressID.toString())}</h3>
                <p>${'Street: ' + (escapeHtml(address.street) || 'No Street')}</p>
                <p>${'City: ' + (escapeHtml(address.city) || 'No City')}</p>
                <p>${'Zip: ' + (escapeHtml(address.zipcode) || 'No Zipcode')}</p>
            </div>
            `).join('') : '<p>No addresses found</p>'}
        </div>
            `;

        document.querySelectorAll(".removeButton").forEach(button => {
            const type = button.getAttribute("data-type")
            if (type === "address") {
                const addressID = button.getAttribute("data-address-id");
                button.addEventListener("click", () => handleRemoveAddress(addressID));
            }
        });

        document.querySelectorAll(".editButton").forEach(button => {
            const type = button.getAttribute("data-type");
            const index = button.getAttribute("data-index");
            if (type === "credentials") {
                button.addEventListener("click", () => userCredentialsEditForm(user));
            } else if (type === "personal") {
                button.addEventListener("click", () => personalInfoEditForm(index, user));
            } else if (type === "address") {
                button.addEventListener("click", () => addressEditForm(index, userAddress[index]));
            }
        });
        document.getElementById("add-address-button").addEventListener("click", () => addAddressForm(user));
        document.getElementById("change-password-button").addEventListener("click", () => changePasswordForm(user.userID));
    }

    async function changePasswordForm(userID) {
        document.body.insertAdjacentHTML('beforeend', `
        <div id="userpage-overlay" class="overlay">
            <div id="changePassword-form">
                <h2>Edit User Credentials</h2>
                <button class="close-button">
                    <i class="fa-solid fa-times"></i>
                </button>
                <form id="changePasswordForm">
                    <div class="form-group">
                        <label for="password">Current Password:</label>
                        <input type="password" id="password" placeholder="Current Password" autocomplete="current-password" required />
                    </div>
                    <div class="form-group">
                        <label for="newPassword">New Password:</label>
                        <input type="password" id="newPassword" placeholder="New Password" autocomplete="new-password" required />
                    </div>
                     <div class="form-group">
                        <label for="confirmNewPassword">Confirm New Password:</label>
                        <input type="password" id="confirmPassword" placeholder="Confirm new password"  autocomplete="new-password"required />
                    </div>
                    <div id="passwordError" style="display: none"></div>
                    <button type="submit">Save</button>
                </form>
            </div>
        </div>
    `);

        document.getElementById("changePasswordForm").addEventListener("submit", async function (event) {
            event.preventDefault();
            await handleChangePassword(userID);
        });
        document.getElementById('userpage-overlay').addEventListener('click', function (event) {
            if (event.target.id === 'userpage-overlay') {
                document.getElementById('userpage-overlay').remove();
            }
        });

        document.querySelector('.close-button').addEventListener('click', function () {
            document.getElementById('userpage-overlay').remove();
        });
    }

    function userCredentialsEditForm(user) {
        document.body.insertAdjacentHTML('beforeend', `
        <div id="userpage-overlay" class="overlay">
            <div id="editUserCredentials-form">
                <h2>Edit User Credentials</h2>
                <button class="close-button">
                    <i class="fa-solid fa-times"></i>
                </button>
                <form id="editUserCredentialsForm">
                    <div class="form-group">
                        <label for="editUserName">Username:</label>
                        <input type="text" id="editUserName" placeholder="Username" autocomplete="username" required />
                    </div>
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" placeholder="Email" required />
                    </div>
                    <div id="editUserCredentialsError" style="color:red;"></div>
                    <button type="submit">Save</button>
                </form>
                
            </div>
        </div>
    `);

        if (user) {
            document.getElementById("editUserName").value = escapeHtml(user.username);
            document.getElementById("email").value = escapeHtml(user.email);
        }
        document.getElementById("editUserCredentialsForm").addEventListener("submit", (event) => handleEditUserCredentials(event, user));
        document.getElementById('userpage-overlay').addEventListener('click', function (event) {
            if (event.target.id === 'userpage-overlay') {
                document.getElementById('userpage-overlay').remove();
            }
        });
        document.querySelector('.close-button').addEventListener('click', function () {
            document.getElementById('userpage-overlay').remove();
        });
    }

    function personalInfoEditForm(index, user) {
        document.body.insertAdjacentHTML('beforeend', `
        <div id="userpage-overlay" class="overlay">
            <div id="editPersonalInfo-form">
                <h2>Edit Personal Info</h2>
                <button class="close-button">
                    <i class="fa-solid fa-times"></i>
                </button>
                <form id="editPersonalInfoForm">
                    <div class="form-group
                    ">
                        <label for="firstname">First Name:</label>
                        <input type="text" id="firstname" placeholder="First Name" required />
                    </div>
                    <div class="form-group
                    ">
                        <label for="lastname">Last Name:</label>
                        <input type="text" id="lastname" placeholder="Last Name" required />
                    </div>
                    <div class="form-group phone">
                        <label for="phone">Phone Number:</label>
                        <input type="text" id="phone" placeholder="Phone Number" required />
                    </div>
                    <div id="personalInfoError" style="color:red;"></div>
                    <button type="submit">Save</button>
                </form>
                
            </div>
        </div>
    `);

            if (user) {
                document.getElementById("firstname").value = escapeHtml(user.firstname);
                document.getElementById("lastname").value = escapeHtml(user.lastname);
                document.getElementById("phone").value = escapeHtml(user.phone);
            }
            document.getElementById("editPersonalInfoForm").addEventListener("submit", (event) => handleEditPersonalInfo(event,index, user));
            document.getElementById('userpage-overlay').addEventListener('click', function (event) {
                if (event.target.id === 'userpage-overlay') {
                    document.getElementById('userpage-overlay').remove();
                }
            });
            document.querySelector('.close-button').addEventListener('click', function () {
                document.getElementById('userpage-overlay').remove();
            });

    }

    async function handleEditUserCredentials(event, user) {
        event.preventDefault(); // Prevent the default form submission behavior
        const username = document.getElementById('editUserName').value;
        const email = document.getElementById('email').value;
        const userID = user.userID;
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        if(!username || !email){
            document.getElementById('editUserCredentialsError').textContent = 'Please fill in all fields';
            return;
        }

        if(username === user.username && email === user.email){
            document.getElementById('editUserCredentialsError').textContent = 'No changes detected';
            return;
        }

        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!regex.test(email)) {
            document.getElementById('editUserCredentialsError').textContent = 'Invalid email format';
            return;
        }

        document.getElementById('editUserCredentialsError').textContent = '';
        document.getElementById('editUserName').style.border = '1px solid green';
        document.getElementById('email').style.border = '1px solid green';

        const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php/${userID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({username, email})
        });

        const result = await res.json();
        if (res.ok) {
            user.username = username;
            user.email = email;
            window.location.reload();
        } else {
            document.getElementById('editUserCredentialsError').textContent = result.message;
        }
    }

    function addressEditForm(index, address) {
        document.body.insertAdjacentHTML('beforeend', `
        <div id="userpage-overlay" class="overlay">
            <div id="editAddress-form">
                <h2>Edit Address</h2>
                <button class="close-button">
                    <i class="fa-solid fa-times"></i>
                </button>
                <form id="editAddressForm">
                    <div class="form-group street">
                        <label for="street">Street:</label>
                        <input type="text" id="street" name="street" value="${escapeHtml(address.street)}" required>
                    </div>
                    <div class="form-group city">
                        <label for="city">City:</label>
                        <input type="text" id="city" name="city" value="${escapeHtml(address.city)}" required>
                    </div>
                    <div class="form-group zipcode">
                        <label for="zipcode">Zip Code:</label>
                        <input type="text" id="zipcode" name="zipcode" value="${escapeHtml(address.zipcode)}" required>
                        <p id="zipcode-error-msg"></p>
                    </div>
                    
                    <div id="editAddressError" style="color:red;"></div>
                    <button type="submit">Save</button>
                    
                </form>
            </div>
        </div>
    `);

        document.getElementById('city').addEventListener('input', function (event) {
            let value = event.target.value.replace(/[^a-zA-Z\u0100-\u017F\s]/g, '');
            event.target.value = value;

            if (/^[a-zA-Z\u0100-\u017F\s]+$/.test(value)) {
                event.target.style.border = '1px solid #ccc';
            } else {
                event.target.style.border = '1px solid red';
            }
        });

        document.getElementById('street').addEventListener('input', function (event) {
            let value = event.target.value.replace(/[^a-zA-Z/.0-9\u0100-\u017F\s]/g, '');
            event.target.value = value;

            if (/^[a-zA-Z/.0-9\u0100-\u017F\s]+$/.test(value)) {
                event.target.style.border = '1px solid #ccc';
            } else {
                event.target.style.border = '1px solid red';
            }
        });

        document.getElementById('zipcode').addEventListener('input', function (event) {
            let value = event.target.value.replace(/\D/g, '');
            if (value.length > 2) {
                value = value.slice(0, 2) + '-' + value.slice(2);
            }
            event.target.value = value;

            if (/^\d{2}-\d{3}$/.test(value)) {
                event.target.style.border = '1px solid #ccc';
                document.getElementById('zipcode-error-msg').textContent = '';
            } else {
                event.target.style.border = '1px solid red';
                document.getElementById('zipcode-error-msg').textContent = 'zip code is incorrect!';
                document.getElementById('zipcode-error-msg').style.color = 'red';
            }
        });

        document.getElementById('editAddressForm').addEventListener('submit', async function (event) {
            event.preventDefault();
            const street = document.getElementById('street').value;
            const city = document.getElementById('city').value;
            const zipcode = document.getElementById('zipcode').value;

            const res = await handleEditAddress(index, address ,{street, city, zipcode, addressID: address.addressID});

            if (!res.ok) {
                console.error('Failed to update address');
                return;
            }
            document.getElementById('userpage-overlay').remove();
            window.location.reload();
        });

        document.getElementById('userpage-overlay').addEventListener('click', function (event) {
            if (event.target.id === 'userpage-overlay') {
                document.getElementById('userpage-overlay').remove();
            }
        });

        document.querySelector('.close-button').addEventListener('click', function () {
            document.getElementById('userpage-overlay').remove();
        });
    }

    async function handleEditAddress(index, address,updatedAddress) {
        if(updatedAddress.street === '' || updatedAddress.city === '' || updatedAddress.zipcode === '' || !updatedAddress.street || !updatedAddress.city || !updatedAddress.zipcode){
            console.log('Please fill in all fields');
            updatedAddress.street === '' ? document.getElementById('street').style.border = "1px solid red" : document.getElementById('street').style.border = "1px solid green";
            updatedAddress.city === '' ? document.getElementById('city').style.border = "1px solid red" : document.getElementById('city').style.border = "1px solid green";
            updatedAddress.zipcode === '' ? document.getElementById('zipcode').style.border = "1px solid red" : document.getElementById('zipcode').style.border = "1px solid green";
            return;
        }

        if(updatedAddress.street === address.street && updatedAddress.city === address.city && updatedAddress.zipcode === address.zipcode){
            console.log('No changes detected');
            document.getElementById('editAddressError').textContent = 'No changes detected';
            return;
        }

        const zipPattern = /^\d{2}-\d{3}$/;
        if (!zipPattern.test(updatedAddress.zipcode)) {
            document.getElementById('zipcode').style.border = "1px solid red";
            document.getElementById('editAddressError').textContent = 'Invalid zip code format';
            console.log('Invalid zip code format');
            return;
        }

        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/address.php/${updatedAddress.addressID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify(updatedAddress)
        });

        console.log('Response:', res);
        const result = await res.json();
        if (!res.ok) {
            console.error('Failed to update address:', result);
        }
        return res;
    }

    async function handleEditPersonalInfo(event,index, user) {
        event.preventDefault();
        const firstname = document.getElementById('firstname').value;
        const lastname = document.getElementById('lastname').value;
        const phone = document.getElementById('phone').value;
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        console.log('User ID:', user.userID, 'First Name:', firstname, 'Last Name:', lastname, 'Phone:', phone);

        if(firstname === '' || lastname === '' || phone === '' || !firstname || !lastname || !phone){
            console.log('Please fill in all fields');
            firstname === '' ? document.getElementById('firstname').style.border = "1px solid red" : document.getElementById('firstname').style.border = "1px solid green";
            lastname === '' ? document.getElementById('lastname').style.border = "1px solid red" : document.getElementById('lastname').style.border = "1px solid green";
            phone === '' ? document.getElementById('phone').style.border = "1px solid red" : document.getElementById('phone').style.border = "1px solid green";
            return;
        }

        if(firstname === user.firstname && lastname === user.lastname && phone === user.phone){
            console.log('No changes detected');
            document.getElementById('personalInfoError').textContent = 'No changes detected';
            return;
        }

        const regex = /^[a-zA-Z]+$/;
        if (!regex.test(firstname) || !regex.test(lastname)) {
            console.log('Invalid name format');
            document.getElementById('firstname').style.border = "1px solid red";
            document.getElementById('lastname').style.border = "1px solid red";
            document.getElementById('personalInfoError').textContent = 'Invalid name format';
            return;
        }

        const phonePattern = /^\d{9}$/;
        if (!phonePattern.test(phone)) {
            document.getElementById('phone').style.border = "1px solid red";
            document.getElementById('personalInfoError').textContent = 'Invalid phone number format';
            console.log('Invalid phone number format');
            return;
        }

        document.getElementById('firstname').style.border = "1px solid green";
        document.getElementById('lastname').style.border = "1px solid green";
        document.getElementById('phone').style.border = "1px solid green";

        const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php/${user.userID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({firstname, lastname, phone})
        });

        const result = await res.json();
        if (!res.ok) {
            console.error('Failed to update personal info:', result);
            return;
        }

        window.location.reload();
    }

    async function checkLoginForUserInfo() {
        console.log('Checking login for user info');

        const resUser = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php`);
        if (resUser.ok) {
            const user = await resUser.json();
            const resAddress = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/address.php/${user.data.userID}`);
            const userAddress = await resAddress.json();
            console.log('User:', user);
            console.log('User Address:', userAddress);
            await displayUserInfo(user.data, userAddress);
        } else {
            await displayLoginForm();
        }
    }

    checkLoginForUserInfo();
});