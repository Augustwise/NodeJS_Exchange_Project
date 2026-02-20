const loginForm = document.getElementById('loginForm') || document.querySelector('.login-container form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginMessage = document.getElementById('loginMessage');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setFormMessage(text, type = 'error') {
    if (!loginMessage) {
        return;
    }

    loginMessage.textContent = text || '';
    loginMessage.className = 'form-message';

    if (!text) {
        return;
    }

    loginMessage.classList.add(type === 'success' ? 'form-message--success' : 'form-message--error');
}

function validateEmail() {
    if (!emailInput) {
        return false;
    }

    emailInput.value = emailInput.value.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(emailInput.value) || emailInput.value.length > 255) {
        emailInput.setCustomValidity('Please enter a valid email address.');
        return false;
    }

    emailInput.setCustomValidity('');
    return true;
}

function validatePassword() {
    if (!passwordInput) {
        return false;
    }

    if (passwordInput.value.length === 0) {
        passwordInput.setCustomValidity('Please enter your password.');
        return false;
    }

    passwordInput.setCustomValidity('');
    return true;
}

if (emailInput) {
    emailInput.addEventListener('input', validateEmail);
}

if (passwordInput) {
    passwordInput.addEventListener('input', validatePassword);
}

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setFormMessage('');

        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();

        if (!isEmailValid || !isPasswordValid) {
            loginForm.reportValidity();
            return;
        }

        const submitButton = loginForm.querySelector('button[type="submit"]');

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: emailInput.value.trim().toLowerCase(),
                    password: passwordInput.value
                })
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                setFormMessage(result.message || 'Login failed. Please try again.');
                return;
            }

            setFormMessage(result.message || 'Login successful. Redirecting...', 'success');

            setTimeout(() => {
                window.location.href = '/';
            }, 800);
        } catch (error) {
            setFormMessage('Network error. Please try again.');
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
}
