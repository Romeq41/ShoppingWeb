document.addEventListener("DOMContentLoaded", () => {
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    const form = document.querySelector(".message form");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = escapeHtml(document.getElementById('name').value);
        const email = escapeHtml(document.getElementById('email').value);
        const subject = escapeHtml(document.getElementById('subject').value);
        const textarea = escapeHtml(document.getElementById('textarea').value);

        if (name === "" || email === "" || subject === "" || textarea === "") {
            alert("Please fill in all fields.");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        const formData = {
            name: name,
            email: email,
            subject: subject,
            report_data: textarea
        };

        const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
        try {
            const response = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/report.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            alert(escapeHtml(result.message));
            form.reset();
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while submitting the form.");
        }
    });
});