import {addProductToCart, generateStars, handleFavorite} from './product.js';

document.addEventListener('DOMContentLoaded', () => {
    function escapeHtml(unsafe) {
        if (!unsafe) return null;
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    const container = document.getElementById('newest-products-container');
    const favorites = JSON.parse(localStorage.getItem('favoriteProducts')) || [];

    fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/products.php?quantity=8&sortBy=created_at&order=asc`)
        .then(response => response.json())
        .then(products => {
            console.log(products);
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
        })
        .catch(error => console.error('Error fetching products:', error));
});

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