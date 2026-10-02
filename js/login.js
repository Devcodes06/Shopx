// ShopX sign-in: demo authentication and small, purposeful interactions.
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true' || sessionStorage.getItem('loggedIn') === 'true';
    if (isLoggedIn) {
        window.location.replace('dashboard.html');
        return;
    }

    const form = document.getElementById('login-form');
    const alert = document.getElementById('login-alert');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const demoButton = document.getElementById('demoAutofill');
    const passwordToggle = document.getElementById('passwordToggle');
    let alertTimer;

    if (demoButton) {
        demoButton.addEventListener('click', () => {
            emailInput.value = 'admin@shop.com';
            passwordInput.value = 'admin123';
            alert.hidden = true;
            emailInput.focus();
        });
    }

    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', () => {
            const showing = passwordInput.type === 'text';
            passwordInput.type = showing ? 'password' : 'text';
            passwordToggle.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
            passwordToggle.innerHTML = `<i class="bi ${showing ? 'bi-eye' : 'bi-eye-slash'}" aria-hidden="true"></i>`;
        });
    }

    if (!form) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        if (email === 'admin@shop.com' && password === 'admin123') {
            window.clearTimeout(alertTimer);
            alert.hidden = true;

            // Honour the checkbox using persistent or tab-scoped demo access.
            if (document.getElementById('remember').checked) {
                localStorage.setItem('loggedIn', 'true');
                sessionStorage.removeItem('loggedIn');
            } else {
                sessionStorage.setItem('loggedIn', 'true');
                localStorage.removeItem('loggedIn');
            }

            const submitButton = form.querySelector('button[type="submit"]');
            const label = submitButton.querySelector('.submit-label');
            const icon = submitButton.querySelector('.submit-icon');
            submitButton.disabled = true;
            submitButton.setAttribute('aria-busy', 'true');
            label.textContent = 'Opening your workspace…';
            icon.classList.add('is-spinning');
            icon.innerHTML = '<i class="bi bi-arrow-repeat" aria-hidden="true"></i>';

            window.setTimeout(() => window.location.assign('dashboard.html'), 500);
            return;
        }

        alert.hidden = false;
        form.classList.remove('is-shaking');
        // Restart the shake so repeated invalid attempts still get feedback.
        void form.offsetWidth;
        form.classList.add('is-shaking');
        emailInput.focus();
        window.clearTimeout(alertTimer);
        alertTimer = window.setTimeout(() => {
            alert.hidden = true;
            form.classList.remove('is-shaking');
        }, 5200);
    });
});
