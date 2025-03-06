import {addProductToCart, generateStars, handleFavorite} from './product.js';

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

    async function fetchSearchResults(searchTerm) {
        const searchResults = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/products.php?search=${escapeHtml(searchTerm)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (searchResults.ok) {
            return await searchResults.json();
        } else {
            return null;
        }
    }

    async function fetchProducts() {
        const response = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/products.php`);
        const products = await response.json();
        if (response.ok) {
            return products;
        } else {
            return null;
        }
    }

    async function displaySearchResults() {
        if (document.getElementById("shopView") === null) {
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const searchTerm = urlParams.get('search');
        console.log(searchTerm);
        if (!searchTerm) {
            console.log('No search term provided');
            return null;
        }
        document.getElementById("offer").style.display = "block";
        const searchResults = await fetchSearchResults(escapeHtml(searchTerm));
        console.log(searchResults);
        if (!searchResults) {
            document.getElementById("searchResultSectionTag").textContent = 'Search Results';
            document.getElementById("search-result-message").textContent = 'No results found';
            console.error('Failed to fetch search results');
            return null;
        }

        const container = document.getElementById('searchResults');
        const favorites = JSON.parse(localStorage.getItem('favoriteProducts')) || [];
        document.getElementById("searchResultSectionTag").textContent = 'Search Results';
        document.getElementById("search-result-message").textContent = `There are ${escapeHtml(searchResults.length.toString())} results found for search \"${searchTerm}\"`;


        searchResults.forEach(product => {
            const isFavorite = favorites.some(fav => fav.productID === product.productID);
            const productElement = document.createElement('div');
            productElement.classList.add('product');
            productElement.innerHTML = `
                    <div class="content">
                        <div class="img-container">
                            <img src="${escapeHtml(product.imageURL)}" alt="${escapeHtml(product.name)}" />
                        </div>
                        <h3 class="title">${escapeHtml(product.name)}</h3>
                        
                        <button class="product-cart" data-product-id="${escapeHtml(product.productID.toString())}">
                            <span class="cart-desc">$${escapeHtml(product.price.toFixed(2).toString())} </span>
                            <i class="fa-solid fa-cart-arrow-down"></i>
                        </button>
                        <button class="product-favorite-button ${isFavorite ? 'favorite' : ''}" data-product-id="${escapeHtml(product.productID.toString())}">
                            ${isFavorite ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>'}
                        </button>
                    </div>
                `;

            const cartButton = productElement.querySelector('.product-cart');
            cartButton.addEventListener('click', () => {
                console.log('Adding product to cart:', product);
                showLoadingScreen();
                addProductToCart(product);
                setTimeout(() => hideLoadingScreen(), 1000);
            });

            const favoriteButton = productElement.querySelector('.product-favorite-button');
            favoriteButton.addEventListener('click', () => {
                const added = handleFavorite(product);
                if (added) {
                    favoriteButton.classList.add('favorite');
                    favoriteButton.innerHTML = '<i class="fa-solid fa-heart"></i>';
                } else {
                    favoriteButton.classList.remove('favorite');
                    favoriteButton.innerHTML = '<i class="fa-regular fa-heart"></i>';
                }
            });

            container.appendChild(productElement);

        });
    }

    async function displayProducts() {
        if (document.getElementById("shopView") === null) {
            return;
        }

        const products = await fetchProducts();

        const container = document.getElementById('most-popular-products-container');
        const favorites = JSON.parse(localStorage.getItem('favoriteProducts')) || [];
        products.forEach(product => {
            const isFavorite = favorites.some(fav => fav.productID === product.productID);
            const productElement = document.createElement('div');
            productElement.classList.add('product');
            productElement.innerHTML = `
                    <div class="content">
                        <div class="img-container">
                            <img src="${escapeHtml(product.imageURL)}" alt="${escapeHtml(product.name)}" />
                        </div>
                        <h3 class="title">${escapeHtml(product.name)}</h3>
                        
                        <button class="product-cart" data-product-id="${escapeHtml(product.productID.toString())}">
                            <span class="cart-desc">$${escapeHtml(product.price.toString())} </span>
                            <i class="fa-solid fa-cart-arrow-down"></i>
                        </button>
                        <button class="product-favorite-button ${isFavorite ? 'favorite' : ''}" data-product-id="${escapeHtml(product.productID.toString())}">
                            ${isFavorite ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>'}
                        </button>
                    </div>
                `;

            const cartButton = productElement.querySelector('.product-cart');
            cartButton.addEventListener('click', () => {
                console.log('Adding product to cart:', product);
                showLoadingScreen();
                addProductToCart(product);
                setTimeout(() => hideLoadingScreen(), 1000);
            });

            const favoriteButton = productElement.querySelector('.product-favorite-button');
            favoriteButton.addEventListener('click', () => {
                const added = handleFavorite(product);
                if (added) {
                    favoriteButton.classList.add('favorite');
                    favoriteButton.innerHTML = '<i class="fa-solid fa-heart"></i>';
                } else {
                    favoriteButton.classList.remove('favorite');
                    favoriteButton.innerHTML = '<i class="fa-regular fa-heart"></i>';
                }
            });

            container.appendChild(productElement);
        });
    }

    async function init() {
        await displaySearchResults();
        await displayProducts();
    }

    init();

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
});