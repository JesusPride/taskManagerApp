
const fullNameInput = document.getElementById("fullName");
const fullNameError = document.getElementById("fullNameError");
const emailAddressInput = document.getElementById("emailAddress");
const emailAddressError = document.getElementById("emailAddressError");
const passwordInput = document.getElementById("password");
const passwordError = document.getElementById("passwordError");

function validateFullName() {
    const fullName = fullNameInput.value.trim();
    if (fullName.length < 2 || !/^[a-zA-Z ]+$/.test(fullName)) {
        fullNameError.innerHTML = "Please enter a valid full name.";
        fullNameError.classList.add("text-danger");
    } else {
        fullNameError.innerHTML = "";
        fullNameError.classList.remove("text-danger");
    }
}

function validateEmailAddress() {
    const emailAddress = emailAddressInput.value.trim();
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailAddress)) {
        emailAddressError.innerHTML = "Please enter a valid email address.";
        emailAddressError.classList.add("text-danger");
    } else {
        emailAddressError.innerHTML = "";
        emailAddressError.classList.remove("text-danger");
    }
}

function validatePassword() {
    const password = passwordInput.value.trim();
    if (password.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
        passwordError.innerHTML = "Please enter a valid password (at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character).";
        passwordError.classList.add("text-danger");
    } else {
        passwordError.innerHTML = "";
        passwordError.classList.remove("text-danger");
    }
}


fullNameInput.addEventListener("input", validateFullName);
emailAddressInput.addEventListener("input", validateEmailAddress);
passwordInput.addEventListener("input", validatePassword);


document.getElementById("registerForm").addEventListener("submit", function(event) {
    event.preventDefault();

    validateFullName();
    validateEmailAddress();
    validatePassword();

    const fullName = fullNameInput.value.trim();
    const emailAddress = emailAddressInput.value.trim();
    const password = passwordInput.value.trim();
    const isValid = fullNameError.innerHTML === "" && emailAddressError.innerHTML === "" && passwordError.innerHTML === "";

    if (isValid) {
        try {
            const user = {
                fullName: fullName,
                emailAddress: emailAddress,
                password: password,
            };
            localStorage.setItem(emailAddress, JSON.stringify(user));
            Swal.fire({
                toast: true,
                position: 'top-right',
                icon: 'success',
                title: 'Registration Successful!',
                showConfirmButton: false
            });
            setTimeout(() => {
                window.location.href = "/index.html"
            }, 2000);
        } catch (error) {
            console.error("Error storing data in local storage:", error);
            alert("An error occurred. Please try again.")
        }
    }
});