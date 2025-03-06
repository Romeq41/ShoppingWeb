export async function handleRemoveAddress(addressID) {
    console.log(addressID);
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/address.php/${addressID}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        }
    });

    console.log(res);
    console.log(await res.json());

    if (res.ok) {
        console.log('Address deleted');
        window.location.reload();
    } else {
        console.error('Failed to delete address');
    }
}

export async function handleAddAddress(event, user) {

    event.preventDefault();
    console.log('Add Address form submitted');
    console.log(user);
    const street = document.getElementById("street").value.trim();
    const city = document.getElementById("city").value.trim();
    const zipcodeInput = document.getElementById("zipcode");
    const zipcode = zipcodeInput.value.trim();

    // Reset previous error state
    zipcodeInput.classList.remove('error');

    // Value verification
    if (!street || !city || !zipcode) {
        console.error('All fields are required');
        alert('All fields are required');
        return false;
    }

    if (!/^\d{2}-\d{3}$/.test(zipcode)) {
        console.error('Invalid form data');
        zipcodeInput.classList.add('error');
        return false;
    }

    const userID = user.userID;
    const newAddress = {addressID: null, street, city, zipcode, userID: userID};

    console.log(newAddress);

    const res = await fetch(`${window.location.origin}/ShoppingWeb/shoppy-backend/routes/address.php/${userID}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify(newAddress)
    });

    const result = await res.json();
    console.log(result);

    newAddress.addressID = result;
    console.log(newAddress);
    if (!res.ok) {
        console.error('Failed to add address:', result);
    } else {
        document.getElementById('userpage-overlay').remove();
        window.location.reload();
    }
}

export async function addAddressForm(user) {
    document.body.insertAdjacentHTML('beforeend', `
        <div id="userpage-overlay" class="overlay">
            <div id="addAddress-form">
                <h2>Add Address</h2>
                <button class="close-button">
                    <i class="fa-solid fa-times"></i>
                </button>
                <form id="addressForm">
                    <div class="form-group">
                        <label for="street">Street:</label>
                        <input type="text" id="street" name="street" placeholder="Al. Jerozolimskie 25a" required>
                    </div>
                    <div class="form-group">
                        <label for="city">City:</label>
                        <input type="text" id="city" name="city" placeholder="Warsaw" required>
                    </div>
                    <div class="form-group zipcode">
                        <label for="zipcode">Zip Code:</label>
                        <input type="text" id="zipcode" name="zipcode" placeholder="12-345" required>
                        <p id="zipcode-error-msg"></p>
                    </div>
                    <button type="submit">Add Address</button>
                </form>
            </div>
        </div>
    `);

    document.getElementById('addressForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        const handleAddAddressResult = await handleAddAddress(event, user);
        const handleAddAddressJSON = JSON.stringify(handleAddAddressResult);
        console.log(handleAddAddressJSON);
        if(handleAddAddressResult) {
            document.getElementById('userpage-overlay').remove();
        }else{
            console.error('Failed to add address');
        }
    });

    document.getElementById('userpage-overlay').addEventListener('click', function (event) {
        if (event.target.id === 'userpage-overlay') {
            document.getElementById('userpage-overlay').remove();
        }
    });

    document.querySelector('.close-button').addEventListener('click', function () {
        document.getElementById('userpage-overlay').remove();
    });

    document.getElementById('zipcode').addEventListener('input', function (event) {
        let value = event.target.value.replace(/\D/g, '');
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

}