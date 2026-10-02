// js/login.js
document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect to dashboard
    if (localStorage.getItem('loggedIn') === 'true') {
        window.location.href = 'dashboard.html';
    }

    const loginForm = document.getElementById('login-form');
    const loginAlert = document.getElementById('login-alert');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            // Hardcoded validation
            if (email === 'admin@shop.com' && password === 'admin123') {
                // Hide alert if visible
                loginAlert.classList.add('d-none');
                
                // Set localStorage
                localStorage.setItem('loggedIn', 'true');
                
                // Show some native feedback on button
                const btn = loginForm.querySelector('button[type="submit"]');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Authenticating...';
                btn.disabled = true;

                // Simulate slight delay for realism and animation observation
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 800);
            } else {
                // Show error alert
                loginAlert.classList.remove('d-none');
                
                // Add Animate.css shake effect
                loginAlert.classList.remove('animate__shakeX'); // reset if already shaken
                void loginAlert.offsetWidth; // trigger reflow
                loginAlert.classList.add('animate__animated', 'animate__shakeX');
                
                // Shake the form slightly as well
                const card = document.querySelector('.login-card');
                card.classList.remove('animate__headShake');
                void card.offsetWidth;
                card.classList.add('animate__animated', 'animate__headShake');
                
                // Auto-hide alert after 5 seconds
                setTimeout(() => {
                    loginAlert.classList.add('d-none');
                }, 5000);
            }
        });
    }
});
