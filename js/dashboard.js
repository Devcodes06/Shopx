// js/dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Authentication Check
    // If not logged in, boot back to index
    if (localStorage.getItem('loggedIn') !== 'true') {
        window.location.href = 'index.html';
        return; // prevent further execution
    }

    // 2. Logout Functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('loggedIn');
            window.location.href = 'index.html';
        });
    }

    // 3. Mobile Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (sidebarToggle && sidebar && sidebarOverlay) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.add('show');
            sidebarOverlay.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        });

        // Close when clicking overlay
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('show');
            sidebarOverlay.classList.remove('show');
            document.body.style.overflow = ''; // Restore scroll
        });
    }

    // 4. Initialize Charts
    // Global defaults for Chart.js
    Chart.defaults.font.family = "'Inter', -apple-system, system-ui, sans-serif";
    Chart.defaults.color = "#8b92a5";

    // Reusable Tooltip config
    const tooltipOptions = {
        backgroundColor: '#1a1a2e',
        padding: 12,
        titleFont: { size: 13, weight: 'normal' },
        bodyFont: { size: 14, weight: 'bold' },
        displayColors: false,
        cornerRadius: 8,
    };

    // Revenue Line Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Revenue',
                    data: [45000, 52000, 38000, 65000, 48000, 75000, 84590],
                    borderColor: '#4361ee', // Electric Blue
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#4361ee',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4 // Smooth curves
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        ...tooltipOptions,
                        callbacks: {
                            label: function(context) {
                                return '₹' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#eef0f7',
                            drawBorder: false
                        },
                        ticks: {
                            callback: function(value) {
                                return '₹' + (value / 1000) + 'k';
                            },
                            padding: 10
                        },
                        border: { display: false }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: { padding: 10 },
                        border: { display: false }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
            }
        });
    }

    // Sales by Category Doughnut Chart
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: ['Electronics', 'Clothing', 'Home Info', 'Sports'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: [
                        '#4361ee', // Blue
                        '#2ecc71', // Green
                        '#f39c12', // Orange
                        '#9b59b6'  // Purple
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%', // Thin ring
                layout: {
                    padding: { bottom: 20 }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        ...tooltipOptions,
                        callbacks: {
                            label: function(context) {
                                return ' ' + context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    }
});
