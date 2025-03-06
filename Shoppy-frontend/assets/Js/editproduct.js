document.addEventListener("DOMContentLoaded", async () => {
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    const urlParams = new URLSearchParams(window.location.search);
    const productID = escapeHtml(urlParams.get('productID'));

    const productRes = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/products.php/${productID}`);
    const product = await productRes.json();
    console.log(product);
    document.getElementById('name').value = escapeHtml(product.name);
    document.getElementById('description').value = escapeHtml(product.description);
    document.getElementById('price').value = escapeHtml(product.price.toString());
    document.getElementById('imageURL').value = escapeHtml(product.imageURL);
    document.getElementById('stock').value = escapeHtml(product.stock.toString());

    document.getElementById('Product-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        console.log(formData);

        const product = {
            name: escapeHtml(formData.get('name')),
            description: escapeHtml(formData.get('description')),
            price: escapeHtml(formData.get('price')),
            imageURL: escapeHtml(formData.get('imageURL')),
            stock: escapeHtml(formData.get('stock')),
        };

        console.log('Product:', product);

        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        const response = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/products.php/${productID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken,
            },
            body: JSON.stringify(product),
        });
        console.log('Response:', response);

        if (response.ok) {
            const result = await response.json();
            console.log('Product updated:', result);
            window.location.href = 'adminpage.php';
        } else {
            console.error('Failed to update product:', response);
        }
    });
});