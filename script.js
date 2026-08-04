// ========== TOUCH SWIPE HELPER ==========
// Every carousel on this site hides its prev/next arrows below 768px, so on a
// phone the only way through them was to sit and wait for autoplay. This gives
// each one a horizontal swipe instead.
function addSwipe(element, onLeft, onRight) {
    if (!element) return;

    const MIN_DISTANCE = 45;   // px before a drag counts as a swipe
    const MAX_OFF_AXIS = 0.8;  // reject mostly-vertical drags (i.e. scrolling)
    let startX = 0;
    let startY = 0;
    let tracking = false;

    element.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        tracking = true;
    }, { passive: true });

    element.addEventListener('touchend', (e) => {
        if (!tracking) return;
        tracking = false;

        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;

        if (Math.abs(dx) < MIN_DISTANCE) return;
        if (Math.abs(dy) > Math.abs(dx) * MAX_OFF_AXIS) return;

        if (dx < 0) {
            onLeft();
        } else {
            onRight();
        }
    }, { passive: true });

    element.addEventListener('touchcancel', () => {
        tracking = false;
    }, { passive: true });
}

// ========== CAROUSEL FUNCTIONALITY ==========
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const totalSlides = slides.length;

function initCarousel() {
    // Create carousel dots
    const dotsContainer = document.getElementById('carouselDots');
    if (!dotsContainer) return; // Prevent error on pages without carousel

    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = `dot ${i === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => {
            goToSlide(i);
            resetHeroAutoplay();
        });
        dotsContainer.appendChild(dot);
    }
}

function showSlide(n) {
    // The results and services pages have no hero carousel at all.
    if (!slides[n]) return;

    slides.forEach(slide => slide.classList.remove('active'));
    const dots = document.querySelectorAll('.dot');
    dots.forEach(dot => dot.classList.remove('active'));

    slides[n].classList.add('active');
    if (dots[n]) dots[n].classList.add('active');
}

function goToSlide(n) {
    currentSlide = n;
    showSlide(currentSlide);
}

function nextSlide() {
    if (totalSlides === 0) return;
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
}

function prevSlide() {
    if (totalSlides === 0) return;
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    showSlide(currentSlide);
}

// Auto-rotate carousel, restarting the clock whenever the visitor takes over so
// a slide they just chose doesn't get yanked away a moment later.
let heroAutoplay = null;

function startHeroAutoplay() {
    if (totalSlides < 2) return;
    heroAutoplay = setInterval(nextSlide, 6000);
}

function resetHeroAutoplay() {
    clearInterval(heroAutoplay);
    startHeroAutoplay();
}

// Carousel navigation buttons
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');

if (nextBtn && prevBtn) {
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetHeroAutoplay();
    });
    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetHeroAutoplay();
    });
}

addSwipe(
    document.querySelector('.hero .carousel-container'),
    () => {
        nextSlide();
        resetHeroAutoplay();
    },
    () => {
        prevSlide();
        resetHeroAutoplay();
    }
);

startHeroAutoplay();

// Don't keep advancing slides in a backgrounded tab — the visitor comes back to
// a carousel that has silently run through several rotations.
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        clearInterval(heroAutoplay);
    } else {
        resetHeroAutoplay();
    }
});

// ========== STICKY HEADER ==========
const siteHeader = document.querySelector('.header');

function updateHeaderScrolledState() {
    if (window.scrollY > 40) {
        siteHeader.classList.add('scrolled');
    } else {
        siteHeader.classList.remove('scrolled');
    }
}

if (siteHeader) {
    updateHeaderScrolledState();
    window.addEventListener('scroll', updateHeaderScrolledState, { passive: true });
}

// ========== THEME TOGGLE ==========
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

function setThemeIcon(isDark) {
    if (!themeToggle) return;
    // Write into the icon span so the button's markup survives the toggle.
    const icon = themeToggle.querySelector('.theme-icon') || themeToggle;
    icon.textContent = isDark ? '☀️' : '🌙';
}

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
    setThemeIcon(true);
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        setThemeIcon(isDark);
    });
}

// ========== MOBILE MENU TOGGLE ==========
// Keep in sync with the `max-width: 900px` nav breakpoint in styles.css.
const NAV_BREAKPOINT = 900;
const menuToggle = document.getElementById('menuToggle');
const navbar = document.querySelector('.navbar');

function closeMobileMenu() {
    if (!navbar || !menuToggle) return;
    navbar.classList.remove('nav-open');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = '☰';
    if (siteHeader) siteHeader.classList.remove('nav-active');
}

function openMobileMenu() {
    if (!navbar || !menuToggle) return;
    navbar.classList.add('nav-open');
    menuToggle.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.textContent = '✕';
    if (siteHeader) siteHeader.classList.add('nav-active');
}

if (menuToggle && navbar) {
    menuToggle.setAttribute('aria-label', 'Menu');
    menuToggle.setAttribute('aria-expanded', 'false');

    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (navbar.classList.contains('nav-open')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= NAV_BREAKPOINT) {
                closeMobileMenu();
            }
        });
    });

    // Tapping anywhere outside the panel dismisses it.
    document.addEventListener('click', (e) => {
        if (!navbar.classList.contains('nav-open')) return;
        if (!navbar.contains(e.target) && e.target !== menuToggle) {
            closeMobileMenu();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMobileMenu();
    });

    // Close on a real orientation/width change only. Comparing against the last
    // known width keeps the URL-bar resize on mobile from closing the menu.
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;
        if (window.innerWidth > NAV_BREAKPOINT) closeMobileMenu();
    });
}

// ========== FAQ ACCORDION ==========
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        // Close all other FAQ items
        faqItems.forEach(otherItem => {
            if (otherItem !== item && otherItem.classList.contains('active')) {
                otherItem.classList.remove('active');
            }
        });

        // Toggle current item
        item.classList.toggle('active');
    });
});

// ========== FORM SUBMISSION ==========
const consultationForm = document.getElementById('consultationForm');
let iti;

if (consultationForm) {
    const phoneInput = consultationForm.querySelector('.phone-input');
    if (phoneInput && window.intlTelInput) {
        iti = window.intlTelInput(phoneInput, {
            initialCountry: "tr",
            preferredCountries: ["tr", "de", "gb", "us"],
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.2.1/js/utils.js"
        });
    }

    consultationForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form values
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const phone = iti ? iti.getNumber() : (this.querySelector('input[type="tel"]')?.value || '');
        const message = this.querySelector('textarea').value;
        const lang = document.documentElement.lang || 'tr';

        // Create localized FormData object
        const formData = new FormData();
        
        if (lang === 'tr') {
            formData.append('Ad Soyad', name);
            formData.append('E-posta', email);
            formData.append('Telefon Numarası', phone);
            formData.append('Mesaj', message);
        } else if (lang === 'de') {
            formData.append('Name', name);
            formData.append('E-Mail', email);
            formData.append('Telefon', phone);
            formData.append('Nachricht', message);
        } else {
            formData.append('Full Name', name);
            formData.append('Email', email);
            formData.append('Phone Number', phone);
            formData.append('Message', message);
        }

        // Language-aware success/error messages
        const successMessages = {
            'tr': 'Danışmanlık talebiniz alındı! Kısa sürede sizinle iletişime geçeceğiz.',
            'en': 'Your consultation request has been received! We will contact you shortly.',
            'de': 'Ihre Beratungsanfrage wurde erhalten! Wir werden uns in Kürze bei Ihnen melden.'
        };
        const errorMessages = {
            'tr': 'Form gönderilirken bir hata oluştu. Lütfen WhatsApp üzerinden ulaşın.',
            'en': 'An error occurred while sending the form. Please contact us via WhatsApp.',
            'de': 'Beim Senden des Formulars ist ein Fehler aufgetreten. Bitte kontaktieren Sie uns über WhatsApp.'
        };

        const formAction = this.getAttribute('action');

        // Submit via AJAX to Formspree
        if (formAction && formAction.includes('formspree.io')) {
            fetch(formAction, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    alert(successMessages[lang] || successMessages['tr']);
                    this.reset();
                } else {
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                            alert(data["errors"].map(error => error["message"]).join(", "));
                        } else {
                            alert(errorMessages[lang] || errorMessages['tr']);
                        }
                    })
                }
            }).catch(error => {
                alert(errorMessages[lang] || errorMessages['tr']);
            });
        } else {
            // Fallback if Formspree action isn't set properly
            alert(successMessages[lang] || successMessages['tr']);
            this.reset();
        }
    });
}

// ========== SCROLL ANIMATIONS ==========
function observeElements() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('slide-in-left')) {
                    entry.target.classList.add('revealed');
                } else {
                    entry.target.style.opacity = '1';
                }
            }
        });
    }, observerOptions);

    // Staggered observer for feature-items and stat-items (incremental reveal)
    const featureObserver = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.delay || 0) * 100;
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                    // If it's a stat-item, start the counter animation
                    const counter = entry.target.querySelector('.stat-number');
                    if (counter) {
                        const target = parseInt(counter.dataset.target);
                        animateCounter(counter, target);
                    }
                }, delay);
                featureObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

    // Observe stat items with incremental animation
    document.querySelectorAll('.stat-item[data-delay]').forEach(element => {
        featureObserver.observe(element);
    });

    // Observe all other elements that should fade in
    document.querySelectorAll('.service-card, .result-card, .testimonial-card, .step, .faq-item').forEach(element => {
        element.style.opacity = '0';
        element.style.transition = 'opacity 0.8s ease';
        observer.observe(element);
    });

    // Observe elements that slide in from the left (reveal effect)
    document.querySelectorAll('.slide-in-left').forEach(element => {
        observer.observe(element);
    });
}

// ========== BEFORE/AFTER IMAGE SLIDER ==========
function initBeforeAfterSliders() {
    const sliders = document.querySelectorAll('.before-after-slider');

    sliders.forEach(slider => {
        const beforeImg = slider.querySelector('.img-before');
        const handle = slider.querySelector('.slider-handle');
        let isDragging = false;

        function moveSlider(e) {
            if (!isDragging) return;
            const rect = slider.getBoundingClientRect();
            // Get x position relative to the slider
            let x = (e.type.includes('mouse') ? e.pageX : e.touches[0].pageX) - rect.left - window.scrollX;
            // Calculate percentage
            let percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

            // Apply clip-path to before image (inset from right side)
            beforeImg.style.clipPath = `inset(0 ${100 - Math.max(0, Math.min(100, percentage))}% 0 0)`;
            handle.style.left = `${percentage}%`;
        }

        slider.addEventListener('mousedown', () => isDragging = true);
        slider.addEventListener('touchstart', () => isDragging = true, { passive: true });

        window.addEventListener('mouseup', () => isDragging = false);
        window.addEventListener('touchend', () => isDragging = false);

        window.addEventListener('mousemove', moveSlider);
        window.addEventListener('touchmove', moveSlider, { passive: true });
    });
}

// ========== SMOOTH SCROLL BEHAVIOR ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        // The header is fixed, so scrolling to the raw offset buries the top of
        // the section underneath it — most noticeable on mobile, where the
        // section heading disappears entirely.
        const headerHeight = siteHeader ? siteHeader.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
            top: Math.max(0, top),
            behavior: 'smooth'
        });
    });
});

// ========== COUNTER ANIMATION ==========
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            start = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(start).toLocaleString();
    }, 16);
}

// ========== LAZY LOADING IMAGES ==========
const images = document.querySelectorAll('img');

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function () {
    initCarousel();
    observeElements();
    initBeforeAfterSliders();
});

// NOTE: the hero "parallax" that used to live here wrote
// hero.style.backgroundPosition on every scroll event. `.hero` has no
// background image of its own (the slides carry them), so it did nothing
// visible while forcing a style recalc on every frame of every scroll — the
// main source of scroll stutter on phones.

// NOTE: focusing an input used to scale its parent by 1.02. On mobile that
// jittered the layout as the keyboard opened, and on the phone field it
// transformed `.iti`, which made the country dropdown detach from the input.

// ========== KEYBOARD NAVIGATION FOR CAROUSEL ==========
document.addEventListener('keydown', function (event) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    // Otherwise moving the caret inside the contact form flips the hero slide.
    const el = document.activeElement;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)) {
        return;
    }

    if (event.key === 'ArrowLeft') {
        prevSlide();
        resetHeroAutoplay();
        const glassPrev = document.querySelector('.results-glass .glass-prev');
        if (glassPrev) glassPrev.click();
    } else {
        nextSlide();
        resetHeroAutoplay();
        const glassNext = document.querySelector('.results-glass .glass-next');
        if (glassNext) glassNext.click();
    }
});

// ========== SEARCH FUNCTIONALITY (Optional) ==========
function searchContent(query) {
    const sections = document.querySelectorAll('section');
    const results = [];

    sections.forEach(section => {
        const text = section.textContent.toLowerCase();
        if (text.includes(query.toLowerCase())) {
            results.push(section);
        }
    });

    return results;
}

// ========== COOKIE CONSENT (Optional) ==========
function setCookieConsent() {
    localStorage.setItem('cookieConsent', 'accepted');
    const banner = document.getElementById('cookieBanner');
    if (banner) {
        banner.style.display = 'none';
    }
}

// ========== UTILITY FUNCTIONS ==========
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ========== SOCIAL SHARING FUNCTIONS ==========
function shareOnSocial(platform, url = window.location.href) {
    const text = encodeURIComponent('Aesthemeet - Doğal ve Kalıcı Saç Ekimi');
    let shareUrl = '';

    switch (platform) {
        case 'facebook':
            shareUrl = `https://facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${text}%20${url}`;
            break;
    }

    if (shareUrl) {
        window.open(shareUrl, 'Share', 'width=600,height=400');
    }
}

// NOTE: there used to be a "responsive menu fix" resize handler here that set
// navbar.style.display directly. Mobile browsers fire `resize` whenever the URL
// bar collapses on scroll or the keyboard opens, so it stamped an inline
// `display: none` on the navbar that outranked `.navbar.nav-open` — the
// hamburger stopped working after the first scroll. The CSS already handles
// showing/hiding the nav per breakpoint, so no JS is needed.

// ========== GLASS RESULTS CAROUSEL ==========
function initResultsCarousel() {
    const slides = document.querySelectorAll('.results-glass .glass-slide');
    const prevBtn = document.querySelector('.results-glass .glass-prev');
    const nextBtn = document.querySelector('.results-glass .glass-next');

    if (slides.length === 0 || !prevBtn || !nextBtn) return;

    let currentIndex = 0;
    let autoSlideInterval;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        if (index >= slides.length) currentIndex = 0;
        else if (index < 0) currentIndex = slides.length - 1;
        else currentIndex = index;

        slides[currentIndex].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentIndex + 1);
    }

    function prevSlide() {
        showSlide(currentIndex - 1);
    }

    // Event listeners
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoSlide();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoSlide();
    });

    // The arrows are hidden below 768px, so this is the only way through the
    // results on a phone.
    addSwipe(
        document.querySelector('.results-glass .glass-carousel'),
        () => { nextSlide(); resetAutoSlide(); },
        () => { prevSlide(); resetAutoSlide(); }
    );

    // Auto sliding
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 5000); // 5 seconds
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(autoSlideInterval);
        } else {
            resetAutoSlide();
        }
    });

    // Start auto slide on init
    startAutoSlide();
}

// Initialize the carousel
initResultsCarousel();

// ========== TESTIMONIALS SLIDER ==========
function initTestimonialsSlider() {
    const slider = document.querySelector('.testimonials-slider');
    const prevBtn = document.querySelector('.testimonials-prev');
    const nextBtn = document.querySelector('.testimonials-next');

    if (!slider || !prevBtn || !nextBtn) return;

    const cards = slider.querySelectorAll('.testimonial-card');

    // The gap is a clamp() that changes per breakpoint, so read it rather than
    // assuming the 30px the desktop layout happens to use.
    function step() {
        const card = slider.querySelector('.testimonial-card');
        if (!card) return 0;
        const gap = parseFloat(getComputedStyle(slider).columnGap) || 0;
        return card.offsetWidth + gap;
    }

    // On phones a single card fills the row, so nothing hinted that there were
    // seven more reviews behind it. This counter sits between the arrows below
    // the card; it is built here so no per-language markup has to change.
    let counter = null;
    if (cards.length > 1) {
        counter = document.createElement('div');
        counter.className = 'testimonials-count';
        counter.setAttribute('aria-live', 'polite');
        slider.parentElement.appendChild(counter);
    }

    function currentIndex() {
        const s = step();
        if (!s) return 0;
        // Clamp: the last page can't scroll a full step when a card peeks.
        return Math.min(cards.length - 1, Math.max(0, Math.round(slider.scrollLeft / s)));
    }

    function updateCounter() {
        if (!counter) return;
        counter.innerHTML = (currentIndex() + 1) + ' <span>/ ' + cards.length + '</span>';
    }

    let ticking = false;
    slider.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            updateCounter();
            ticking = false;
        });
    }, { passive: true });

    window.addEventListener('resize', updateCounter);
    updateCounter();

    nextBtn.addEventListener('click', () => {
        // Check if we are at the end (with a 10px buffer for rounding errors)
        if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10) {
            // Reached the end, circular link back to the beginning
            slider.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            slider.scrollBy({ left: step(), behavior: 'smooth' });
        }
    });

    prevBtn.addEventListener('click', () => {
        // Check if we are at the beginning
        if (slider.scrollLeft <= 10) {
            // Reached the beginning, circular link to the end
            slider.scrollTo({ left: slider.scrollWidth, behavior: 'smooth' });
        } else {
            slider.scrollBy({ left: -step(), behavior: 'smooth' });
        }
    });
}

initTestimonialsSlider();

// ========== SERVICES PAGE CAROUSEL ==========
function initServicesCarousel() {
    const dots = document.querySelectorAll('.svc-dot');
    const slides = document.querySelectorAll('.svc-slide');
    const prevBtn = document.querySelector('.svc-prev');
    const nextBtn = document.querySelector('.svc-next');

    if (dots.length === 0 || slides.length === 0) return;

    let currentIndex = 0;

    function showSlide(index) {
        // Wrap around
        if (index >= slides.length) index = 0;
        if (index < 0) index = slides.length - 1;
        currentIndex = index;

        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));

        slides[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');

        // The tab strip scrolls horizontally on small screens; keep the active
        // tab visible when the slide changes via swipe or arrow.
        if (dots[currentIndex].scrollIntoView) {
            dots[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    // Dot click
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            showSlide(parseInt(dot.dataset.index));
        });
    });

    // Arrow click
    if (prevBtn) prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));

    addSwipe(
        document.querySelector('.svc-slides-wrapper'),
        () => showSlide(currentIndex + 1),
        () => showSlide(currentIndex - 1)
    );
}

initServicesCarousel();

// ========== PORTFOLIO GALLERY FILTER ==========
function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    if (!filterBtns.length || !portfolioItems.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            portfolioItems.forEach(item => {
                // If filter is "all", show everything
                if (filterValue === 'all') {
                    item.classList.remove('hide');
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    // Check if item has the filter class
                    if (item.classList.contains(filterValue)) {
                        item.classList.remove('hide');
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            item.classList.add('hide');
                        }, 400); // Wait for transition to finish
                    }
                }
            });
        });
    });
}

initPortfolioFilter();
