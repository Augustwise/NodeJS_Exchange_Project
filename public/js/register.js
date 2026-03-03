const registerForm = document.getElementById('registerForm') || document.querySelector('.register-container form');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const dateOfBirthInput = document.getElementById('dateOfBirth');
const countrySelect = document.getElementById('country');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirm');
const registerMessage = document.getElementById('registerMessage');

const PASSWORD_MIN_LENGTH = 12;
const NAME_PATTERN = /^[\p{L}][\p{L}\s'-]{1,99}$/u;
const COUNTRY_PATTERN = /^[\p{L}][\p{L}\s'.()-]{1,99}$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeText(value) {
    return value.trim().replace(/\s+/g, ' ');
}

function setFormMessage(text, type = 'error') {
    if (!registerMessage) {
        return;
    }

    registerMessage.textContent = text || '';
    registerMessage.className = 'form-message';

    if (!text) {
        return;
    }

    registerMessage.classList.add(type === 'success' ? 'form-message--success' : 'form-message--error');
}

function parseDateOfBirth(rawValue) {
    const value = rawValue.trim();
    const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);

    if (!match) {
        return null;
    }

    const [, day, month, year] = match;
    const isoDate = `${year}-${month}-${day}`;
    const parsedDate = new Date(`${isoDate}T00:00:00Z`);

    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    const isSameDate =
        parsedDate.getUTCFullYear() === Number(year) &&
        parsedDate.getUTCMonth() + 1 === Number(month) &&
        parsedDate.getUTCDate() === Number(day);

    if (!isSameDate) {
        return null;
    }

    const now = new Date();
    const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const oldestAllowedDate = new Date(
        Date.UTC(now.getUTCFullYear() - 120, now.getUTCMonth(), now.getUTCDate())
    );

    if (parsedDate > todayUtc || parsedDate < oldestAllowedDate) {
        return null;
    }

    return isoDate;
}

function validateNameField(input, label) {
    if (!input) {
        return false;
    }

    input.value = normalizeText(input.value);

    if (!NAME_PATTERN.test(input.value)) {
        input.setCustomValidity(`${label} must be 2-100 characters and contain only letters.`);
        return false;
    }

    input.setCustomValidity('');
    return true;
}

function validateDateOfBirth() {
    if (!dateOfBirthInput) {
        return false;
    }

    const isoDate = parseDateOfBirth(dateOfBirthInput.value);

    if (!isoDate) {
        dateOfBirthInput.setCustomValidity('Use a valid date in DD.MM.YYYY format.');
        return null;
    }

    dateOfBirthInput.setCustomValidity('');
    return isoDate;
}

function validateCountry() {
    if (!countrySelect) {
        return false;
    }

    const countryValue = normalizeText(countrySelect.value);
    countrySelect.value = countryValue;

    if (!COUNTRY_PATTERN.test(countryValue)) {
        countrySelect.setCustomValidity('Please select a valid country.');
        return false;
    }

    countrySelect.setCustomValidity('');
    return true;
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

function validatePasswordRules() {
    if (!passwordInput) {
        return false;
    }

    const passwordValue = passwordInput.value;
    const hasMinLength = passwordValue.length >= PASSWORD_MIN_LENGTH;
    const hasDigit = /\d/.test(passwordValue);

    if (!hasMinLength || !hasDigit) {
        passwordInput.setCustomValidity('Password must be at least 12 characters and contain at least one digit.');
        return false;
    }

    passwordInput.setCustomValidity('');
    return true;
}

function validatePasswordMatch() {
    if (!confirmInput || !passwordInput) {
        return false;
    }

    if (confirmInput.value !== passwordInput.value) {
        confirmInput.setCustomValidity('Passwords do not match.');
        return false;
    }

    confirmInput.setCustomValidity('');
    return true;
}

if (firstNameInput) {
    firstNameInput.addEventListener('input', () => validateNameField(firstNameInput, 'First name'));
}

if (lastNameInput) {
    lastNameInput.addEventListener('input', () => validateNameField(lastNameInput, 'Last name'));
}

if (dateOfBirthInput) {
    dateOfBirthInput.addEventListener('input', (event) => {
        const digits = event.target.value.replace(/\D/g, '').slice(0, 8);
        let formatted = digits;

        if (digits.length > 2) {
            formatted = `${digits.slice(0, 2)}.${digits.slice(2)}`;
        }
        if (digits.length > 4) {
            formatted = `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
        }

        event.target.value = formatted;
        validateDateOfBirth();
    });
}

if (countrySelect) {
    countrySelect.addEventListener('change', validateCountry);
}

if (emailInput) {
    emailInput.addEventListener('input', validateEmail);
}

if (passwordInput) {
    passwordInput.addEventListener('input', () => {
        validatePasswordRules();
        validatePasswordMatch();
    });
}

if (confirmInput) {
    confirmInput.addEventListener('input', validatePasswordMatch);
}

const fallbackCountries = [
    'Australia',
    'Brazil',
    'Canada',
    'China',
    'France',
    'Germany',
    'India',
    'Japan',
    'Poland',
    'Spain',
    'Ukraine',
    'United Kingdom',
    'United States'
];

function fillCountryOptions(countries) {
    if (!countrySelect) {
        return;
    }

    countrySelect.innerHTML = '';

    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = 'Select country';
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    countrySelect.appendChild(placeholderOption);

    countries.forEach((countryName) => {
        const option = document.createElement('option');
        option.value = countryName;
        option.textContent = countryName;
        countrySelect.appendChild(option);
    });
}

async function loadCountries() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name');

        if (!response.ok) {
            throw new Error('Failed to load countries');
        }

        const countries = await response.json();
        const names = countries
            .map((country) => country?.name?.common)
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));

        if (names.length === 0) {
            throw new Error('Empty country list');
        }

        fillCountryOptions(names);
    } catch (error) {
        fillCountryOptions(fallbackCountries);
    }
}

document.querySelectorAll('.password-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.target);
        if (!input) return;
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        btn.classList.toggle('visible', isHidden);
    });
});

if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setFormMessage('');

        const isFirstNameValid = validateNameField(firstNameInput, 'First name');
        const isLastNameValid = validateNameField(lastNameInput, 'Last name');
        const dateOfBirthIso = validateDateOfBirth();
        const isCountryValid = validateCountry();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePasswordRules();
        const isConfirmValid = validatePasswordMatch();

        if (
            !isFirstNameValid ||
            !isLastNameValid ||
            !dateOfBirthIso ||
            !isCountryValid ||
            !isEmailValid ||
            !isPasswordValid ||
            !isConfirmValid
        ) {
            registerForm.reportValidity();
            return;
        }

        const submitButton = registerForm.querySelector('button[type="submit"]');

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: normalizeText(firstNameInput.value),
                    surname: normalizeText(lastNameInput.value),
                    dateOfBirth: dateOfBirthIso,
                    country: normalizeText(countrySelect.value),
                    email: emailInput.value.trim().toLowerCase(),
                    password: passwordInput.value,
                    confirmPassword: confirmInput.value
                })
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                setFormMessage(result.message || 'Registration failed. Please try again.');
                return;
            }

            setFormMessage(
                result.message || 'Registration completed successfully. Redirecting to login...',
                'success'
            );
            registerForm.reset();

            if (countrySelect) {
                countrySelect.selectedIndex = 0;
            }

            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
        } catch (error) {
            setFormMessage('Network error. Please try again.');
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
}

loadCountries();
