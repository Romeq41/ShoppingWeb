
window.addEventListener("DOMContentLoaded", () => {

    async function handleRegister(event) {
        event.preventDefault();

        const username = document.getElementById("username1").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');


        if (password !== confirmPassword) {
            document.getElementById("password").style.border = "1px solid red";
            document.getElementById("confirmPassword").style.border = "1px solid red";
            document.getElementById("registerError").textContent = "Passwords do not match.";
            return;
        }

        if (password.length < 8) {
            document.getElementById("password").style.border = "1px solid red";
            document.getElementById("confirmPassword").style.border = "1px solid red";
            document.getElementById("registerError").textContent = "Password must be at least 8 characters long.";
            return;
        }

        if(username === undefined || !email || !password){
            document.getElementById("username1").style.border = "1px solid red";
            document.getElementById("email").style.border = "1px solid red";
            document.getElementById("password").style.border = "1px solid red";
            document.getElementById("registerError").textContent = "Please fill in all fields.";
            return;
        }
        console.log(csrfToken);
        console.log(username, email, password);

        const response = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({ username, email, password })
        });

        const result = await response.json();
        console.log(result);

        if (response.ok && result.success) {
            window.location.href = 'userpage.php';
        } else {
            console.error('Registration failed:', result);
            document.getElementById("username1").style.border = "1px solid red";
            document.getElementById("email").style.border = "1px solid red";
            document.getElementById("password").style.border = "1px solid red";
            document.getElementById("registerError").textContent = "Registration failed. Please try again.";
        }
    }

    const registerForm = document.getElementById("registerForm");
    registerForm.addEventListener("submit", handleRegister);
});

