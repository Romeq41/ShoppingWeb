function escapeHtml(unsafe) {
    if (!unsafe) return null;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Function to display registration form
function displayPasswordResetForm() {
    document.getElementById("userView").innerHTML = `
      <div class="register-form">
        <h2>Reset Password</h2>
        <form id="passwordResetForm">
          <input type="email" id="email" placeholder="Email" required />
          <button type="submit">Reset</button>
        </form>
        <div id="registerError" style="color:red;"></div>
        <p>Already have an account? <a href="userPage.php">Login</a></p>
      </div>
    `;

    document.getElementById("passwordResetForm").addEventListener("submit", handleResetPassword);
}

function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = 'flex';
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.display = 'none';
}

async function handleResetPassword(event) {
    showLoadingScreen();
    event.preventDefault();
    const recipientEmail = escapeHtml(document.getElementById("email").value);

    const response = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php/generatePassword` , {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email: recipientEmail}),
    });

    const result = await response.json();

    if (response.ok) {
        hideLoadingScreen();
        document.getElementById("registerError").textContent = "If the email exists, a new password will be sent to it.";
        document.getElementById("registerError").style.color = "green";
        document.getElementById("email").style.border = "1px solid green";
    } else {
        hideLoadingScreen();
        console.error('Registration failed:', result);
        document.getElementById("email").style.border = "1px solid red";
        document.getElementById("registerError").textContent = "Registration failed. Please try again.";
    }
}

displayPasswordResetForm();