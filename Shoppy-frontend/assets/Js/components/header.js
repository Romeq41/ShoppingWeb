
document.addEventListener("DOMContentLoaded", async () => {
    function escapeHtml(unsafe) {
        if (!unsafe) return null;
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');

    const iconToggle = document.getElementById("toggle");
    const navLinks = document.getElementById("nav-links");
    const userMenu = document.getElementById("user-menu");
    const userIcon = document.getElementById("user");
    const nav = document.getElementById("nav");

    const searchbar = document.querySelector(".searchbar");
    const searchButton = searchbar.querySelector(".searchbar button");
    const searchInput = searchbar.querySelector(".searchbar input");
    searchInput.value = searchTerm;

    searchButton.addEventListener("click", () => {
        if (searchbar.querySelector("input").value === "") return;
        const searchInput = searchbar.querySelector("input");
        window.location.href = `./shop.php?search=${escapeHtml(searchInput.value)}`;
    });

    searchbar.addEventListener("keypress", (event) => {
        if (event.key === "Enter" && searchbar.querySelector("input").value !== "") {
            const searchInput = searchbar.querySelector("input");
            window.location.href = `./shop.php?search=${escapeHtml(searchInput.value)}`;
        }
    });

    // Toggle navigation menu for smaller screens
    if (iconToggle) {
        iconToggle.addEventListener("click", (event) => {
            event.stopPropagation();
            navLinks.classList.toggle("show");
            userMenu.classList.remove("show"); // Hide userMenu when navLinks is shown
        });
    }

    // Toggle user menu dropdown
    if (userIcon) {
        userIcon.addEventListener("click", (event) => {
            event.stopPropagation();
            userMenu.style.top = `${nav.offsetHeight}px`;
            userMenu.classList.toggle("show");
            navLinks.classList.remove("show"); // Hide navLinks when userMenu is shown
        });
    }

    // Close the user menu and nav links when clicking outside of them
    document.addEventListener("click", (event) => {
        if (!userMenu.contains(event.target) && !userIcon.contains(event.target)) {
            userMenu.classList.remove("show");
        }
        if (!navLinks.contains(event.target) && !iconToggle.contains(event.target)) {
            navLinks.classList.remove("show");
        }
    });

    // Add event listeners to the li elements
    const menuItems = document.querySelectorAll("#user-menu li");
    menuItems.forEach(item => {
        item.addEventListener("click", (event) => {
            const link = item.querySelector("a");
            if (link) {
                event.preventDefault();
                window.location.href = link.href;
            }
        });
    });

    // Setup Logout button
    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
        console.log("Adding event listener to logout button");
        logoutButton.addEventListener("click", () => logout());
    }

    const myOrdersButton = document.getElementById("my-orders-button");
    const userPageButton = document.getElementById("user-page-button");
    const adminPageButton = document.getElementById("admin-page-button");
    const loginButton = document.getElementById("login-button");

    const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php/`, {});
    console.log(res);
    const username = document.getElementById("username");

    if (res.ok) {
        const user = await res.json();
        console.log(user);
        if (username) username.textContent = escapeHtml(user.data.username);
        if (adminPageButton) adminPageButton.style.display = escapeHtml(user.data.role.toString()) === '1' ? "block" : "none";
        if (userPageButton) userPageButton.style.display = "block";
        if (logoutButton) logoutButton.style.display = "block";
        if (myOrdersButton) myOrdersButton.style.display = "block";
        if (loginButton) loginButton.style.display = "none";
    } else {
        localStorage.removeItem("user");
        localStorage.removeItem("cart");
        localStorage.removeItem("userAddress");
        if (username) username.style.display = "none";
        if (userPageButton) userPageButton.style.display = "none";
        if (adminPageButton) adminPageButton.style.display = "none";
        if (logoutButton) logoutButton.style.display = "none";
        if (myOrdersButton) myOrdersButton.style.display = "none";
        if (loginButton) loginButton.style.display = "block";
    }

    updateFavoriteCount();
    updateCartItemCount();

    window.addEventListener("cartUpdated", () => {
        window.dispatchEvent(new Event("cartUpdatedEnd"));
    });

    window.addEventListener("cartUpdatedEnd", () => {
        window.dispatchEvent(new Event("cartCountUpdated"));
    });

    window.addEventListener("cartCountUpdated", () => {
        updateCartItemCount();
    });

    window.addEventListener("favoriteUpdated", () => {
        updateFavoriteCount();
    });


    function adjustUserMenuWidth() {
        if(window.innerWidth < 630){
            userMenu.style.width = "100vw";
            return;
        }
        userMenu.style.width = `${nav.offsetWidth}px`;
    }

    adjustUserMenuWidth();
    window.addEventListener("resize", adjustUserMenuWidth);


    function updateFavoriteCount() {
        const favoriteCount = document.getElementById("favorite-count");
        const favoriteProducts = JSON.parse(localStorage.getItem("favoriteProducts"));
        if (favoriteProducts) {
            favoriteCount.textContent = favoriteProducts.length;
            favoriteCount.style.display = "flex";
        } else {
            favoriteCount.style.display = "none";
        }
    }

    async function updateCartItemCount() {
        console.log("Updating cart item count");
        const cartItemCount = document.getElementById("cartItem-count");
        const response = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php/`, {});

        const cart = JSON.parse(localStorage.getItem("cart"));
        const guestCart = JSON.parse(localStorage.getItem("guestCart"));

        console.log(cart);
        if (response.ok) {
            if (cart && cart.cartItems.length > 0) {
                cartItemCount.textContent = cart.cartItems.reduce((acc, item) => acc + item.quantity, 0).toString();
                cartItemCount.style.display = "flex";
            } else {
                cartItemCount.style.display = "none";
            }
        } else if (guestCart) {
            if (guestCart.cartItems.length > 0) {
                cartItemCount.textContent = guestCart.cartItems.reduce((acc, item) => acc + item.quantity, 0).toString();
                cartItemCount.style.display = "flex";
            } else {
                cartItemCount.style.display = "none";
            }
        } else {
            cartItemCount.style.display = "none";
        }
    }

    async function logout() {
        const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
        const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken
            },
        });

        const result = await res.json();
        console.log(result);
        if (res.ok) {
            localStorage.removeItem("user");
            localStorage.removeItem("cart");
            localStorage.removeItem("guestCart");
        }

        window.location.href = "index.php";
    }

});
