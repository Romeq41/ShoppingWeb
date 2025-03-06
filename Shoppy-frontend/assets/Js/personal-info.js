function escapeHtml(unsafe) {
    if (!unsafe) return null;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function displayPersonalInfoForm(user) {
    if (user){
        const cartRes = localStorage.getItem('cart');
        if(cartRes){
            const cart = JSON.parse(cartRes);
            console.log('cart', cart);
            if(cart.cartItems.length === 0) {
                window.location.href = `${window.location.origin}${window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/'))}/cart.php`;
            }
        }
    }else{
        const cartRes = localStorage.getItem('guestCart');
        if(cartRes){
            const cart = JSON.parse(cartRes);
            console.log('cart', cart);
            if(cart.cartItems.length === 0) {
                window.location.href = `${window.location.origin}${window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/'))}/cart.php`;
            }
        }
    }
    document.getElementById("checkoutView").innerHTML = `
        <div class="order-summary-container">
            <div class="personal-info-container">
                <h2>Order Information</h2>
                <form id="personal-info-form">
                    <div class="form-group">
                        <label for="firstname">First Name:</label>
                        <input type="text" id="firstname" name="firstname" required>

                        <label for="lastname">Last Name:</label>
                        <input type="text" id="lastname" name="lastname" required>

                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" required>

                        <label for="phone">Phone:</label>
                        <input type="tel" id="phone" name="phone" required>
                    </div>
                    <button id="proceed-to-checkout-button-user" style="background: white;color:var(--mainColor); border: 2px var(--mainColor) solid">Continue as ${user ? escapeHtml(user.data.firstname) : 'Guest'} and proceed to checkout</button>
                    <button id="proceed-to-checkout-button">Proceed to checkout</button>
                </form>
            </div>
        </div>
    `;

    document.getElementById("proceed-to-checkout-button").addEventListener('click', async (e) => {
        await handleProceedToCheckout(e, null);
    });

    document.getElementById("proceed-to-checkout-button-user").addEventListener('click', async (e) => {
        await handleProceedToCheckout(e, user);
    });

    const personalInfoButton = document.getElementById('proceed-to-checkout-button-user');
    if (user && user.data.firstname && user.data.lastname && user.data.email && user.data.phone) {
        personalInfoButton.style.display = 'block';
    } else {
        personalInfoButton.style.display = 'none';
    }
}

async function handleProceedToCheckout(e, user) {
    e.preventDefault();
    const form = document.getElementById('personal-info-form');
    const formData = new FormData(form);
    let personalInfo = Object.fromEntries(formData.entries());

    if (user) {
        personalInfo = {
            firstname: escapeHtml(user.data.firstname),
            lastname: escapeHtml(user.data.lastname),
            email: escapeHtml(user.data.email),
            phone: escapeHtml(user.data.phone)
        };
    }

    console.log(personalInfo);

    if (validatePersonalInfo(personalInfo)) {
        console.log(personalInfo);
        localStorage.setItem('personalInfo', JSON.stringify(personalInfo));
        window.location.href = `${window.location.origin}${window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/'))}/order-summary.php`;
    } else {
        alert('Please fill out all required fields correctly.');
        highlightErrors(personalInfo);
    }
}

function validatePersonalInfo(info) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\d{9}$/;

    let isValid = true;

    if (!info.firstname) {
        isValid = false;
    }

    if (!info.lastname) {
        isValid = false;
    }

    if (!emailPattern.test(info.email)) {
        isValid = false;
    }

    if (!phonePattern.test(info.phone)) {
        isValid = false;
    }

    return isValid;
}

function highlightErrors(info) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\d{9}$/;

    document.getElementById('firstname').classList.toggle('error', !info.firstname);
    document.getElementById('lastname').classList.toggle('error', !info.lastname);
    document.getElementById('email').classList.toggle('error', !emailPattern.test(info.email));
    document.getElementById('phone').classList.toggle('error', !phonePattern.test(info.phone));
}

async function checkLoginForUserInfo() {
    console.log('Checking login for user info');
    const response = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php/`, {});

    console.log('Response:', response);

    if (response.ok) {
        const checkTokenData = await response.json();
        await displayPersonalInfoForm(checkTokenData);
    } else {
        await displayPersonalInfoForm(null);
    }
}

checkLoginForUserInfo();

window.addEventListener('cartUpdated', async () => {
    console.log('Cart updated');
    const userRes = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php/`);
    const user = await userRes.json();
    await displayCart(user ? user.data : null);

    window.dispatchEvent(new Event("cartUpdatedEnd"));
});