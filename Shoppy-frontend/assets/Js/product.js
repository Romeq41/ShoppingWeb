import { loadCart } from './cart.js';

function escapeHtml(unsafe) {
    if (!unsafe) return null;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function updateCart() {
    window.dispatchEvent(new Event("cartUpdated"));
}

function updateFavorite() {
    window.dispatchEvent(new Event("favoriteUpdated"));
}

export function handleFavorite(product) {
    let favorites = JSON.parse(localStorage.getItem('favoriteProducts')) || [];
    const index = favorites.findIndex(fav => fav.productID === product.productID);
    console.log(index);
    if (index === -1) {
        favorites.push(product);
        localStorage.setItem('favoriteProducts', JSON.stringify(favorites));
        updateFavorite();
        return true;
    } else {
        favorites.splice(index, 1);
        localStorage.setItem('favoriteProducts', JSON.stringify(favorites));
        if (favorites.length === 0) {
            localStorage.removeItem('favoriteProducts');
        }
        updateFavorite();
        return false;
    }
}

export function removeFromFavorites(product) {
    let favoriteProducts = localStorage.getItem('favoriteProducts');
    favoriteProducts = JSON.parse(favoriteProducts);
    favoriteProducts = favoriteProducts.filter(favoriteProduct => favoriteProduct.productID !== product.productID);
    if (favoriteProducts.length === 0) {
        localStorage.removeItem('favoriteProducts');
        // location.reload();
        return;
    }
    localStorage.setItem('favoriteProducts', JSON.stringify(favoriteProducts));
    // location.reload();
}

export function generateStars(rating) {
    const totalStars = 5;
    const fullStars = Math.floor(rating);
    const halfStars = Math.ceil(rating - fullStars);
    const emptyStars = totalStars - fullStars - halfStars;
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fa-solid fa-star"></i>';
    }
    for (let i = 0; i < halfStars; i++) {
        stars += '<i class="fa-solid fa-star-half"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="fa-regular fa-star"></i>';
    }
    return stars;
}

export async function addProductToCart(product) {
    const resUser = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php`);
    if (!resUser.ok) {
        console.log('guest user cart');

        let guestCart = localStorage.getItem('guestCart');
        if (guestCart === null) {
            guestCart = {
                cart: {
                    cartID: null,
                    total: parseFloat(0).toFixed(2),
                }, cartItems: []
            };
        } else {
            console.log('cart exists');
            guestCart = JSON.parse(guestCart);
        }
        console.log(guestCart);
        const existingProduct = guestCart.cartItems.find(item => item.productID === product.productID);
        console.log(existingProduct);
        if (existingProduct) {
            console.log('increasing quantity');
            existingProduct.quantity++;
        } else {
            guestCart.cartItems.push({cartID: null, cartItemID: null, productID: product.productID, quantity: 1});
        }

        guestCart.cart.total = parseFloat(guestCart.cart.total) + parseFloat(product.price);
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        updateCart();
        // window.location.reload();
        return product;
    } else {

        console.log('logged in user cart');
        const cart = JSON.parse(localStorage.getItem('cart'));
        if(cart === null) {
            await loadCart();
        }
        console.log(cart);
        const cartID = cart.cart.cartID;
        const productID = product.productID;
        console.log('cartID:', cartID);
        console.log('productID:', productID);
        const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
        const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/cart.php/addItem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({productID: escapeHtml(productID.toString()), cartID: escapeHtml(cartID.toString())}),
        });
        const result = await res.json();
        console.log(result);
        if (res.ok) {
            console.log(cart);
            let duplicate = cart.cartItems.find(item => item.productID === productID)
            console.log(duplicate);
            if (duplicate) {
                duplicate.quantity++;
            } else {
                cart.cartItems.push({cartID: cartID, cartItemID: result.cartItemID, productID, quantity: 1});
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
            // window.location.reload();
            return product;
        } else {
            console.error('Failed to add product to cart:', result);
        }
    }
}