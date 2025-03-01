import {addProductToCart, generateStars, removeFromFavorites} from './product.js';

document.addEventListener('DOMContentLoaded', () => {

    function escapeHtml(unsafe) {
        if(!unsafe) return null;
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    const container = document.getElementById('favorite-products-container');

    let favoriteProducts = localStorage.getItem('favoriteProducts');
    console.log(favoriteProducts);
    if (favoriteProducts !== null) {
        favoriteProducts = JSON.parse(favoriteProducts);

        console.log(favoriteProducts);
        favoriteProducts.forEach(product => {
            // const stars = generateStars(product.rating);

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
                    <button class="product-favorite-button" data-product-id="${escapeHtml(product.productID.toString())}">
                        <i class="fa-solid fa-times"></i>
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
            console.log(product);
            favoriteButton.addEventListener('click', () => {
                console.log('Removing product from favorites:', product);
                removeFromFavorites(product);
                window.dispatchEvent(new Event("favoriteUpdated"));
                productElement.remove();
            });

            container.appendChild(productElement);

        });
    } else {
        container.innerHTML = '<h3> Your favorite list is empty! </h3>';
        container.style.textAlign = 'center';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.margin = '0';
        container.style.height = '100%';
        container.style.width = '100%';
        console.log('No favorite products found.');
    }


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


