// ShopX dashboard interactions, scroll choreography, metrics and charts.
document.addEventListener('DOMContentLoaded', () => {
    const authenticated = localStorage.getItem('loggedIn') === 'true' || sessionStorage.getItem('loggedIn') === 'true';
    if (!authenticated) {
        window.location.replace('index.html');
        return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const toggle = document.getElementById('sidebarToggle');
    const closeButton = document.getElementById('sidebarClose');
    const navLinks = Array.from(document.querySelectorAll('[data-nav-link]'));
    const topbar = document.querySelector('.top-navbar');
    const progressBar = document.getElementById('scrollProgress');
    const heroBanner = document.querySelector('.hero-banner');
    let toastTimer;
    let scrollTicking = false;

    // Session controls.
    const closeSidebar = () => {
        if (!sidebar || !overlay) return;
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
        document.body.classList.remove('sidebar-open');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
    };

    const openSidebar = () => {
        if (!sidebar || !overlay) return;
        sidebar.classList.add('show');
        overlay.classList.add('show');
        document.body.classList.add('sidebar-open');
        if (toggle) toggle.setAttribute('aria-expanded', 'true');
        if (closeButton) closeButton.focus();
    };

    if (toggle) toggle.addEventListener('click', openSidebar);
    if (closeButton) closeButton.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeSidebar();
    });

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            setActiveLink(link.getAttribute('href'));
            closeSidebar();
        });
    });

    const setActiveLink = (hash) => {
        navLinks.forEach((link) => link.classList.remove('active'));
        const match = navLinks.find((link) => link.getAttribute('href') === hash);
        if (match) match.classList.add('active');
    };

    // Use the current date and time in the little store snapshot line.
    const dateLabel = document.getElementById('dashboardDate');
    if (dateLabel) {
        dateLabel.textContent = new Intl.DateTimeFormat('en-US', {
            weekday: 'short', month: 'short', day: 'numeric'
        }).format(new Date()).toUpperCase();
    }
    const periodTime = document.querySelector('.period-label span');
    if (periodTime) {
        periodTime.textContent = `Today, ${new Intl.DateTimeFormat('en-US', {
            hour: 'numeric', minute: '2-digit'
        }).format(new Date())}`;
    }
    const greeting = document.querySelector('.page-heading h1');
    if (greeting) {
        const hour = new Date().getHours();
        const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
        greeting.firstChild.textContent = `${timeGreeting}, Alex`;
    }

    // Reveal panels as they enter the viewport. Each panel animates only once.
    if (!reducedMotion && 'IntersectionObserver' in window) {
        document.documentElement.classList.add('has-motion');
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
        document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));
    } else {
        document.querySelectorAll('[data-reveal]').forEach((element) => element.classList.add('is-visible'));
    }

    // Count-up numbers when their cards arrive, instead of animating off-screen.
    const formatIndian = (value, decimals = 0) => new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);

    const animateCounter = (element) => {
        if (element.dataset.counted === 'true') return;
        element.dataset.counted = 'true';
        const target = Number(element.dataset.counter || 0);
        const prefix = element.dataset.prefix || '';
        const decimals = Number(element.dataset.decimals || 0);
        const numberFormat = element.dataset.numberFormat;
        const duration = reducedMotion ? 1 : 1050;
        const startTime = performance.now();
        const renderValue = (number) => {
            const formatted = numberFormat === 'indian'
                ? formatIndian(number, decimals)
                : number.toFixed(decimals);
            element.textContent = `${prefix}${formatted}`;
        };
        const tick = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            renderValue(target * eased);
            if (progress < 1) window.requestAnimationFrame(tick);
            else renderValue(target);
        };
        window.requestAnimationFrame(tick);
    };

    const counters = document.querySelectorAll('[data-counter]');
    if ('IntersectionObserver' in window && !reducedMotion) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: .55 });
        counters.forEach((counter) => counterObserver.observe(counter));
    } else {
        counters.forEach(animateCounter);
    }

    // A slim reading-progress line and a gentle counter-motion layer on the hero.
    const updateScrollState = () => {
        const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
        if (progressBar) progressBar.style.width = `${progress * 100}%`;
        if (topbar) topbar.classList.toggle('is-scrolled', window.scrollY > 12);
        if (heroBanner && !reducedMotion) {
            const amount = Math.min(window.scrollY * .075, 44);
            heroBanner.style.setProperty('--hero-scroll-shift', `${amount}px`);
        }
        scrollTicking = false;
    };

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            scrollTicking = true;
            window.requestAnimationFrame(updateScrollState);
        }
    }, { passive: true });
    updateScrollState();

    // Track the section in view so the navigation feels connected to the scroll.
    if ('IntersectionObserver' in window) {
        const observedSections = ['overview', 'orders', 'products', 'analytics', 'activity']
            .map((id) => document.getElementById(id)).filter(Boolean);
        const sectionObserver = new IntersectionObserver((entries) => {
            const candidates = entries.filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
            if (candidates[0]) setActiveLink(`#${candidates[0].target.id}`);
        }, { threshold: [0.15, 0.35, 0.6], rootMargin: '-15% 0px -62% 0px' });
        observedSections.forEach((section) => sectionObserver.observe(section));
    }

    // Pointer-driven tilt: the 3D product card responds subtly on desktop only.
    const heroVisual = document.getElementById('heroVisual');
    if (heroVisual && !reducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const artCard = document.getElementById('heroArtCard');
        heroVisual.addEventListener('pointermove', (event) => {
            const bounds = heroVisual.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - .5;
            const y = (event.clientY - bounds.top) / bounds.height - .5;
            if (artCard) {
                artCard.style.setProperty('--tilt-x', `${-13 + x * 18}deg`);
                artCard.style.setProperty('--tilt-y', `${5 - y * 13}deg`);
            }
        });
        heroVisual.addEventListener('pointerleave', () => {
            if (artCard) {
                artCard.style.setProperty('--tilt-x', '-13deg');
                artCard.style.setProperty('--tilt-y', '5deg');
            }
        });
    }

    // Draw the charts and keep the range switch interactive.
    const chartData = {
        '7d': {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            values: [45000, 52000, 38000, 65000, 48000, 75000, 84590],
            total: 84590
        },
        '30d': {
            labels: ['Sep 03', 'Sep 07', 'Sep 11', 'Sep 15', 'Sep 19', 'Sep 23', 'Sep 27', 'Oct 02'],
            values: [34000, 41500, 38600, 53200, 46100, 57900, 67200, 84590],
            total: 342750
        },
        '90d': {
            labels: ['Jul 08', 'Jul 20', 'Aug 01', 'Aug 13', 'Aug 25', 'Sep 06', 'Sep 18', 'Oct 02'],
            values: [43500, 51800, 48900, 62700, 55700, 73900, 78200, 84590],
            total: 972480
        }
    };

    const currency = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;
    const revenueCanvas = document.getElementById('revenueChart');
    const categoryCanvas = document.getElementById('categoryChart');
    let revenueChart = null;

    if (!window.Chart) {
        document.querySelector('.chart-container')?.classList.add('chart-static');
        document.querySelector('.donut-wrap')?.classList.add('chart-static');
    }

    if (window.Chart && revenueCanvas) {
        const context = revenueCanvas.getContext('2d');
        const fillGradient = context.createLinearGradient(0, 0, 0, 230);
        fillGradient.addColorStop(0, 'rgba(126, 109, 244, .24)');
        fillGradient.addColorStop(.68, 'rgba(126, 109, 244, .055)');
        fillGradient.addColorStop(1, 'rgba(126, 109, 244, 0)');

        Chart.defaults.font.family = "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif";
        Chart.defaults.color = '#9697a4';
        Chart.defaults.animation.duration = reducedMotion ? 0 : 1050;

        revenueChart = new Chart(context, {
            type: 'line',
            data: {
                labels: chartData['7d'].labels,
                datasets: [{
                    label: 'Gross sales',
                    data: chartData['7d'].values,
                    borderColor: '#7868ed',
                    backgroundColor: fillGradient,
                    borderWidth: 2.5,
                    fill: true,
                    tension: .38,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBorderWidth: 3,
                    pointHoverBorderColor: '#fff',
                    pointHoverBackgroundColor: '#7868ed'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                layout: { padding: { top: 6, right: 7, left: 2, bottom: 0 } },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#232333',
                        titleColor: 'rgba(255,255,255,.64)',
                        bodyColor: '#fff',
                        titleFont: { size: 9, weight: '600' },
                        bodyFont: { size: 11, weight: '700' },
                        displayColors: false,
                        padding: 11,
                        cornerRadius: 9,
                        callbacks: { label: (item) => currency(item.parsed.y) }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        suggestedMin: 20000,
                        suggestedMax: 95000,
                        grid: { color: 'rgba(61, 60, 85, .075)', drawTicks: false },
                        ticks: {
                            maxTicksLimit: 5,
                            padding: 11,
                            font: { size: 8, weight: '500' },
                            callback: (value) => `₹${Math.round(value / 1000)}k`
                        },
                        border: { display: false }
                    },
                    x: {
                        grid: { display: false, drawTicks: false },
                        ticks: { padding: 9, maxRotation: 0, font: { size: 8, weight: '600' } },
                        border: { display: false }
                    }
                }
            }
        });
    }

    if (window.Chart && categoryCanvas) {
        new Chart(categoryCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Electronics', 'Clothing', 'Home & living', 'Sports'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: ['#8372ee', '#b3d96b', '#f5a77d', '#82a5f3'],
                    borderWidth: 0,
                    hoverOffset: 5,
                    spacing: 3,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '76%',
                rotation: -90,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#232333',
                        titleColor: '#fff',
                        bodyColor: 'rgba(255,255,255,.7)',
                        padding: 10,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: { label: (item) => `${item.label}: ${item.parsed}%` }
                    }
                },
                animation: { animateRotate: !reducedMotion, animateScale: !reducedMotion, duration: 1100 }
            }
        });
    }

    const totalLabel = document.getElementById('chartTotal');
    document.querySelectorAll('[data-range]').forEach((button) => {
        button.addEventListener('click', () => {
            const range = button.dataset.range;
            const data = chartData[range];
            if (!data) return;
            document.querySelectorAll('[data-range]').forEach((candidate) => {
                const active = candidate === button;
                candidate.classList.toggle('is-active', active);
                candidate.setAttribute('aria-pressed', String(active));
            });
            if (revenueChart) {
                revenueChart.data.labels = data.labels;
                revenueChart.data.datasets[0].data = data.values;
                revenueChart.update('active');
            }
            if (totalLabel) totalLabel.textContent = currency(data.total);
        });
    });

    // Search across recent orders and the top-product list.
    const searchInput = document.getElementById('dashboardSearch');
    const orderRows = Array.from(document.querySelectorAll('[data-order-row]'));
    const productRows = Array.from(document.querySelectorAll('.product-row'));
    const ordersBody = document.getElementById('ordersBody');
    const noResultsRow = document.createElement('tr');
    noResultsRow.className = 'no-results';
    noResultsRow.hidden = true;
    noResultsRow.innerHTML = '<td colspan="5">No matching orders in this view.</td>';
    if (ordersBody) ordersBody.append(noResultsRow);

    const applySearch = () => {
        const query = searchInput ? searchInput.value.trim().toLocaleLowerCase() : '';
        let visibleOrders = 0;
        orderRows.forEach((row) => {
            const matches = !query || row.textContent.toLocaleLowerCase().includes(query);
            row.hidden = !matches;
            if (matches) visibleOrders += 1;
        });
        productRows.forEach((row) => {
            row.hidden = Boolean(query) && !row.textContent.toLocaleLowerCase().includes(query);
        });
        noResultsRow.hidden = visibleOrders > 0;
    };
    if (searchInput) searchInput.addEventListener('input', applySearch);

    document.addEventListener('keydown', (event) => {
        const targetTag = event.target && event.target.tagName ? event.target.tagName.toLowerCase() : '';
        const isTyping = ['input', 'textarea', 'select'].includes(targetTag) || event.target.isContentEditable;
        if (event.key === '/' && !isTyping && searchInput) {
            event.preventDefault();
            searchInput.focus();
        }
        if (event.key === 'Escape' && searchInput && document.activeElement === searchInput) {
            searchInput.value = '';
            applySearch();
            searchInput.blur();
        }
    });

    // Friendly toast feedback and a working CSV export for the visible orders.
    const toast = document.getElementById('toastMessage');
    const toastText = document.getElementById('toastText');
    const showToast = (message) => {
        if (!toast || !toastText) return;
        toastText.textContent = message;
        toast.classList.add('is-visible');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3200);
    };

    const exportButton = document.getElementById('exportButton');
    if (exportButton) {
        exportButton.addEventListener('click', () => {
            const rows = orderRows.filter((row) => !row.hidden);
            const csvRows = [['Order', 'Customer', 'Product', 'Amount', 'Status']];
            rows.forEach((row) => {
                const cells = Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent.trim().replace(/\s+/g, ' '));
                csvRows.push(cells);
            });
            const csv = csvRows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\r\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const download = document.createElement('a');
            download.href = url;
            download.download = 'shopx-orders.csv';
            document.body.appendChild(download);
            download.click();
            download.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            showToast(`Report exported with ${rows.length} recent ${rows.length === 1 ? 'order' : 'orders'}.`);
        });
    }

    const notifications = document.getElementById('notificationsButton');
    if (notifications) notifications.addEventListener('click', () => showToast('You’re all caught up. Four store updates are ready to review.'));

    const chartInfo = document.getElementById('chartInfoButton');
    if (chartInfo) chartInfo.addEventListener('click', () => showToast('Gross sales include completed and in-progress orders for the selected period.'));

    const profileButton = document.querySelector('.user-profile');
    if (profileButton) profileButton.addEventListener('click', () => showToast('Signed in as Alex Morgan · Store owner.'));

    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('loggedIn');
            sessionStorage.removeItem('loggedIn');
            window.location.assign('index.html');
        });
    }
});
