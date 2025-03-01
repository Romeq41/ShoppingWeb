document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/user.php/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (response.ok) {
        const checkToken = await response.json();
        console.log('User logged in:', checkToken.data);
        if (checkToken.data.role !== 1) {
            alert('You are not authorized to view this page');
        }
    } else {
        window.location.href = window.location.origin + window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/')) + '/index.php';
    }


    document.getElementById('zipcode').addEventListener('input', function (event) {
        let value = event.target.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.slice(0, 5);
        }
        if (value.length > 2) {
            value = value.slice(0, 2) + '-' + value.slice(2);
        }
        event.target.value = value;

        if (/^\d{2}-\d{3}$/.test(value)) {
            event.target.style.border = '1px solid #ccc';
            document.getElementById('zipcode-error-msg').textContent = '';
        } else {
            event.target.style.border = '1px solid red';
            document.getElementById('zipcode-error-msg').textContent = 'zip code is incorrect!';
            document.getElementById('zipcode-error-msg').style.fontSize = '12px';
            document.getElementById('zipcode-error-msg').style.padding = '0';
            document.getElementById('zipcode-error-msg').style.color = 'red';
        }
    });

    document.getElementById('city').addEventListener('input', function (event) {
        let value = event.target.value.replace(/[^a-zA-Z\u0100-\u017F\s]/g, '');
        event.target.value = value;

        if (/^[a-zA-Z\u0100-\u017F\s]+$/.test(value)) {
            event.target.style.border = '1px solid #ccc';
        } else {
            event.target.style.border = '1px solid red';
        }
    });

    document.getElementById('street').addEventListener('input', function (event) {
        let value = event.target.value.replace(/[^a-zA-Z/.0-9\u0100-\u017F\s]/g, '');
        event.target.value = value;

        if (/^[a-zA-Z/.0-9\u0100-\u017F\s]+$/.test(value)) {
            event.target.style.border = '1px solid #ccc';
        } else {
            event.target.style.border = '1px solid red';
        }
    });


    document.getElementById('contact_first_name').addEventListener('input', function (event) {
        let value = event.target.value.replace(/[^a-zA-Z\u0100-\u017F\s]/g, '');
        event.target.value = value;

        if (/^[a-zA-Z\u0100-\u017F\s]+$/.test(value)) {
            event.target.style.border = '1px solid #ccc';
        } else {
            event.target.style.border = '1px solid red';
        }
    });

    document.getElementById('contact_last_name').addEventListener('input', function (event) {
        let value = event.target.value.replace(/[^a-zA-Z\u0100-\u017F\s]/g, '');
        event.target.value = value;

        if (/^[a-zA-Z\u0100-\u017F\s]+$/.test(value)) {
            event.target.style.border = '1px solid #ccc';
        } else {
            event.target.style.border = '1px solid red';
        }
    });

    document.getElementById('contact_email').addEventListener('input', function (event) {
        let value = event.target.value.replace(/\s/g, '');
        event.target.value = value;

        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            event.target.style.border = '1px solid #ccc';
        } else {
            event.target.style.border = '1px solid red';
        }
    });

    document.getElementById('contact_phone').addEventListener('input', function (event) {
        let value = event.target.value.replace(/\D/g, '');
        event.target.value = value;

        if (/^[0-9]{9,12}$/.test(value)) {
            event.target.style.border = '1px solid #ccc';
        } else {
            event.target.style.border = '1px solid red';
        }
    });

    document.getElementById('userID').addEventListener('input', function (event) {
        let value = event.target.value.replace(/\D/g, '');
        event.target.value = value;

        if (/^[0-9]+$/.test(value)) {
            event.target.style.border = '1px solid #ccc';
        } else {
            event.target.style.border = '1px solid red';
        }
    });

    document.getElementById('total').addEventListener('input', function (event) {

        const priceRegex = /^(\d{1,3}(,\d{3})*|\d+)(,\d{1,2})?$/;

        if (priceRegex.test(value)) {
            event.target.style.border = '1px solid #ccc'; // Valid format
        } else {
            event.target.style.border = '1px solid red'; // Invalid format
        }
    });


    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    const urlParams = new URLSearchParams(window.location.search);
    const orderID = escapeHtml(urlParams.get('orderID'));
    const csrfToken = escapeHtml(document.querySelector('meta[name="csrf-token"]').content);

    const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/order.php/${orderID}`, {
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        }
    });

    const data = await res.json();
    console.log(data);
    console.log(escapeHtml(data.orderContactInfo.contact_first_name));
    document.getElementById('contact_first_name').value = escapeHtml(data.orderContactInfo.contact_first_name);
    document.getElementById('contact_last_name').value = escapeHtml(data.orderContactInfo.contact_last_name);
    document.getElementById('contact_email').value = escapeHtml(data.orderContactInfo.contact_email);
    document.getElementById('contact_phone').value = escapeHtml(data.orderContactInfo.contact_phone);
    document.getElementById('userID').value = data.userID ? escapeHtml(data.userID.toString()) : '';
    document.getElementById('total').value = escapeHtml(data.total.toString());
    document.getElementById('isFullfilled').value = escapeHtml(data.isFullfilled.toString());
    document.getElementById('paymentMethod').value = escapeHtml(data.paymentMethod);
    document.getElementById('deliveryMethod').value = escapeHtml(data.deliveryMethod);
    if (data.orderAddress) {
        document.getElementById('edit-order-address').style.display = 'block';
        document.getElementById('city').value = escapeHtml(data.orderAddress.city);
        document.getElementById('street').value = escapeHtml(data.orderAddress.street);
        document.getElementById('zipcode').value = escapeHtml(data.orderAddress.zipcode);
    } else {
        document.getElementById('edit-order-address').style.display = 'none';
        document.getElementById('city').removeAttribute('required');
        document.getElementById('street').removeAttribute('required');
        document.getElementById('zipcode').removeAttribute('required');
    }

    const deliveryMethodElement = document.getElementById('deliveryMethod');
    deliveryMethodElement.addEventListener('change', (event) => {
        const deliveryMethod = event.target.value;
        if (deliveryMethod === 'pickup') {
            document.getElementById('edit-order-address').style.display = 'none';
            document.getElementById('city').removeAttribute('required');
            document.getElementById('street').removeAttribute('required');
            document.getElementById('zipcode').removeAttribute('required');
            document.getElementById('city').value = '';
            document.getElementById('street').value = '';
            document.getElementById('zipcode').value = '';
        } else if (deliveryMethod === 'courier') {
            document.getElementById('edit-order-address').style.display = 'flex';
            document.getElementById('edit-order-address').style.flexDirection = 'column';
            document.getElementById('city').setAttribute('required', 'required');
            document.getElementById('street').setAttribute('required', 'required');
            document.getElementById('zipcode').setAttribute('required', 'required');
        }
    });

    document.getElementById('editOrder-form').addEventListener('submit', async (event) => {
        console.log('submit');
        event.preventDefault();


        const formData = {
            contact_first_name: document.getElementById('contact_first_name').value,
            contact_last_name: document.getElementById('contact_last_name').value,
            contact_email: document.getElementById('contact_email').value,
            contact_phone: document.getElementById('contact_phone').value,
            userID: document.getElementById('userID').value,
            total: document.getElementById('total').value,
            isFullfilled: document.getElementById('isFullfilled').value,
            paymentMethod: document.getElementById('paymentMethod').value,
            deliveryMethod: document.getElementById('deliveryMethod').value,
            city: document.getElementById('city').value,
            street: document.getElementById('street').value,
            zipcode: document.getElementById('zipcode').value
        }

        const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/order.php/${orderID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            const data = await res.json();
            console.log(data);
            alert('Order updated successfully');
            window.location.href = './adminpage.php';
        } else {
            const data = await res.json();
            console.log(data);
            alert('Failed to update order');
        }

    });
});