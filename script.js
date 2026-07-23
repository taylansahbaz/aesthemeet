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
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
}

function showSlide(n) {
    slides.forEach(slide => slide.classList.remove('active'));
    const dots = document.querySelectorAll('.dot');
    dots.forEach(dot => dot.classList.remove('active'));

    slides[n].classList.add('active');
    dots[n].classList.add('active');
}

function goToSlide(n) {
    currentSlide = n;
    showSlide(currentSlide);
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    showSlide(currentSlide);
}

// Carousel navigation buttons
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');

if (nextBtn && prevBtn) {
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
}

// Auto-rotate carousel every 6 seconds if we have slides
if (totalSlides > 0) {
    setInterval(nextSlide, 6000);
}

// ========== SCROLL EVENT REMOVED ==========
// The sticky header logic was removed as requested.

// ========== THEME TOGGLE ==========
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        themeToggle.textContent = '☀️';
    } else {
        localStorage.setItem('theme', 'light');
        themeToggle.textContent = '🌙';
    }
});

// ========== MOBILE MENU TOGGLE ==========
const menuToggle = document.getElementById('menuToggle');
const navbar = document.querySelector('.navbar');

function closeMobileMenu() {
    navbar.classList.remove('nav-open');
    menuToggle.classList.remove('active');
    menuToggle.textContent = '☰';
}

function openMobileMenu() {
    navbar.classList.add('nav-open');
    menuToggle.classList.add('active');
    menuToggle.textContent = '✕';
}

menuToggle.addEventListener('click', () => {
    if (navbar.classList.contains('nav-open')) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
});

// Close menu when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            closeMobileMenu();
        }
    });
});

// Close menu on resize back to desktop width
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
});

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
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
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
    initResultsCarousel();
    observeElements();
    initBeforeAfterSliders();

    // Add parallax effect to hero section on scroll
    window.addEventListener('scroll', function () {
        const hero = document.querySelector('.hero');
        if (hero) {
            const scrollPosition = window.pageYOffset;
            hero.style.backgroundPosition = `center ${scrollPosition * 0.5}px`;
        }
    });
});

// ========== CONTACT FORM BEHAVIOR ==========
document.querySelectorAll('input, textarea, select').forEach(input => {
    input.addEventListener('focus', function () {
        this.parentElement.style.transform = 'scale(1.02)';
    });

    input.addEventListener('blur', function () {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// ========== KEYBOARD NAVIGATION FOR CAROUSEL ==========
document.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') {
        prevSlide();
        const glassPrev = document.querySelector('.results-glass .glass-prev');
        if (glassPrev) glassPrev.click();
    } else if (event.key === 'ArrowRight') {
        nextSlide();
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

// ========== PAGE VISIBILITY API ==========
document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        // Pause any auto-playing content
        // e.g., carousel can be paused
    } else {
        // Resume content
    }
});

// ========== RESPONSIVE MENU FIX ==========
window.addEventListener('resize', function () {
    if (window.innerWidth > 768) {
        navbar.style.display = 'flex';
    } else {
        navbar.style.display = 'none';
    }
});

console.log('Aesthemeet website initialized successfully!');

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

    // Auto sliding
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 5000); // 5 seconds
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

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

    nextBtn.addEventListener('click', () => {
        const card = slider.querySelector('.testimonial-card');
        const scrollAmount = card.offsetWidth + 30; // 30px is the gap
        
        // Check if we are at the end (with a 10px buffer for rounding errors)
        if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10) {
            // Reached the end, circular link back to the beginning
            slider.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    });

    prevBtn.addEventListener('click', () => {
        const card = slider.querySelector('.testimonial-card');
        const scrollAmount = card.offsetWidth + 30;
        
        // Check if we are at the beginning
        if (slider.scrollLeft <= 10) {
            // Reached the beginning, circular link to the end
            slider.scrollTo({ left: slider.scrollWidth, behavior: 'smooth' });
        } else {
            slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
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
