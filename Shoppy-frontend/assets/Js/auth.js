// auth.js
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function fetchCartItems(userID) {
    const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/cart.php/${escapeHtml(userID).toString()}/getAll`);
    if (res.ok) {
        return await res.json();
    } else {
        return false;
    }
}

async function fetchSession() {
    const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php/sessionContents`);

    if (res.ok) {
        console.log('Session contents fetched');
        return await res.json();
    } else {
        return false;
    }
}

function updateCart() {
    window.dispatchEvent(new Event("cartUpdated"));
}

export async function handleLogin(event) {
    event.preventDefault();
    const email = escapeHtml(document.getElementById("email").value);
    const password = escapeHtml(document.getElementById("password").value);
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    console.log(csrfToken)
    const response = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({email, password})
    });

    const result = await response.json();
    if (response.ok && result.success) {
        console.log('Login successful:', result);
        let loggedInUser = result.user;
        console.log('User logged in:', loggedInUser);
        const userID = escapeHtml(loggedInUser.userID.toString());

        const userAddressResponse = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/address.php/${userID.toString()}`);
        if (userAddressResponse.ok) {
            const userAddress = await userAddressResponse.json();
            localStorage.setItem('userAddress', JSON.stringify(userAddress));
            let cart = await fetchCartItems(userID);
            localStorage.setItem('cart', JSON.stringify(cart));

            const cartID = escapeHtml(cart.cart.cartID.toString());
            const existingCart = localStorage.getItem('guestCart');
            console.log(existingCart);
            if (existingCart) {
                document.body.insertAdjacentHTML('beforeend', `
                <div class="overlay" id="modal-overlay">
                    <div class="modal">
                        <p>There is already a cart loaded in local storage. Do you want to load it into your user database?</p>
                        <button id="yesButton">Yes</button>
                        <button id="noButton">No</button>
                    </div>
                </div>
                `);

                document.getElementById('yesButton').addEventListener('click', async () => {
                    localStorage.removeItem('guestCart');
                    const localCart = JSON.parse(existingCart);
                    for (const item of localCart.cartItems) {
                        for (let i = 0; i < item.quantity; i++) {
                            await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/cart.php/addItem`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRF-TOKEN': csrfToken
                                },
                                body: JSON.stringify({cartID, productID: escapeHtml(item.productID.toString())}),
                            });
                        }
                    }
                    document.getElementById('modal-overlay').remove();
                    let res = await fetchCartItems(userID);
                    console.log(res);
                    localStorage.setItem('cart', JSON.stringify(res));
                    updateCart();
                    window.location.reload();
                });

                document.getElementById('noButton').addEventListener('click', () => {
                    document.querySelector('.overlay').remove();
                    localStorage.removeItem('guestCart');
                    window.location.reload();
                });
            } else {
                updateCart();
                if(loggedInUser.role === 1){
                    window.location.href = 'adminpage.php';
                }else {
                    window.location.href = 'userpage.php';
                }
            }

        } else {
            console.error('Failed to fetch user address:', await userAddressResponse.text());
        }
    } else {
        console.error('Login failed:', result);
        document.getElementById("email").style.border = "1px solid red";
        document.getElementById("password").style.border = "1px solid red";
        document.getElementById("loginError").textContent = "Login failed. Please try again.";
    }
}

export async function handleChangePassword(userID) {
    console.log('Change password form submitted');
    const password = escapeHtml(document.getElementById("password").value);
    const newPassword = escapeHtml(document.getElementById("newPassword").value);
    const confirmPassword = escapeHtml(document.getElementById("confirmPassword").value);
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    if (newPassword === confirmPassword) {
        if(newPassword.length < 8){
            document.getElementById("newPassword").style.border = "1px solid red";
            document.getElementById("confirmPassword").style.border = "1px solid red";
            document.getElementById("passwordError").textContent = "Password must be at least 8 characters long.";
            document.getElementById("passwordError").style.color = "red";
            document.getElementById("passwordError").style.display = "block";

            return;
        }
        const response = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php/changePassword/${escapeHtml(userID.toString())}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({password, newPassword})
        });

        if (response.ok) {
            console.log('Password changed successfully');
            document.getElementById("password").style.border = "2px solid green";
            document.getElementById("newPassword").style.border = "2px solid green";
            document.getElementById("confirmPassword").style.border = "2px solid green";
            document.getElementById("passwordError").textContent = "Password changed successfully";
            document.getElementById("passwordError").style.color = "green";
            document.getElementById("passwordError").style.display = "block";
        } else {
            console.error('Failed to change password:', await response.text());
            document.getElementById("newPassword").style.border = "1px solid red";
            document.getElementById("confirmPassword").style.border = "1px solid red";
            document.getElementById("passwordError").textContent = "Incorrect password. Please try again.";
            document.getElementById("passwordError").style.color = "red";
            document.getElementById("passwordError").style.display = "block";
        }
    } else {
        console.error('Passwords do not match');
        document.getElementById("newPassword").style.border = "2px solid red";
        document.getElementById("confirmPassword").style.border = "2px solid red";
        document.getElementById("passwordError").textContent = "Passwords do not match";
        document.getElementById("passwordError").style.color = "red";
        document.getElementById("passwordError").style.display = "block";
        document.getElementById("password").style.border = "2px solid red";
    }
}