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

// The <html> background is what iOS paints in the rubber-band overscroll and
// around the safe areas, and it can't read a class that lives on <body>, so
// the flag is mirrored onto the root element.
function setThemeClass(isDark) {
    document.documentElement.classList.toggle('dark-mode', isDark);
}

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
    setThemeClass(true);
    setThemeIcon(true);
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        setThemeClass(isDark);
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

// ========== TOAST NOTIFICATIONS ==========
// Replaces window.alert(), which blocks the page, can't be styled, is stamped
// with the vercel.app hostname, and on a phone looks like a browser error
// rather than a reply from the site. Everything user-facing goes through
// showToast() so success and failure look like they belong to the page.

const TOAST_TEXT = {
    tr: { success: 'Başarılı', error: 'Bir sorun oluştu', info: 'Bilgi', close: 'Kapat' },
    en: { success: 'Success', error: 'Something went wrong', info: 'Information', close: 'Close' },
    de: { success: 'Erfolgreich', error: 'Ein Fehler ist aufgetreten', info: 'Hinweis', close: 'Schließen' }
};

const TOAST_ICONS = {
    success: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6.5 9.5 17 4 11.5"/></svg>',
    error: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7v6"/><path d="M12 16.8v.2"/><circle cx="12" cy="12" r="9"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 11v6"/><path d="M12 7.2v.2"/><circle cx="12" cy="12" r="9"/></svg>'
};

// An error is worth reading twice as long as a confirmation.
const TOAST_DURATION = { success: 5000, info: 5000, error: 8000 };
const TOAST_MAX = 3;

let toastContainer = null;

function getToastContainer() {
    if (toastContainer && document.body.contains(toastContainer)) return toastContainer;

    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    // polite: a confirmation shouldn't interrupt whatever a screen reader is
    // in the middle of. Errors override this per-toast below.
    toastContainer.setAttribute('aria-live', 'polite');
    toastContainer.setAttribute('aria-atomic', 'false');
    document.body.appendChild(toastContainer);
    return toastContainer;
}

function dismissToast(toast) {
    if (!toast || toast.dataset.closing === '1') return;
    toast.dataset.closing = '1';
    clearTimeout(Number(toast.dataset.timer));
    toast.classList.add('toast--out');

    // transitionend alone would strand the node if the transition never runs
    // (reduced motion, a backgrounded tab), so a timer backs it up.
    let removed = false;
    const remove = () => {
        if (removed) return;
        removed = true;
        toast.remove();
    };
    toast.addEventListener('transitionend', remove, { once: true });
    setTimeout(remove, 400);
}

/**
 * @param {string} message  the line the visitor reads
 * @param {'success'|'error'|'info'} type
 * @param {{title?: string, duration?: number}} [options]
 */
function showToast(message, type = 'info', options = {}) {
    if (!message) return null;

    const kind = TOAST_ICONS[type] ? type : 'info';
    const lang = (document.documentElement.lang || 'tr').slice(0, 2).toLowerCase();
    const text = TOAST_TEXT[lang] || TOAST_TEXT.tr;
    const duration = options.duration != null ? options.duration : TOAST_DURATION[kind];

    const container = getToastContainer();

    // Keep the stack short: past three, the oldest is already read.
    const live = container.querySelectorAll('.toast:not(.toast--out)');
    for (let i = 0; i <= live.length - TOAST_MAX; i++) {
        dismissToast(live[i]);
    }

    const toast = document.createElement('div');
    toast.className = 'toast toast--' + kind;
    toast.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    if (kind === 'error') toast.setAttribute('aria-live', 'assertive');

    const icon = document.createElement('span');
    icon.className = 'toast__icon';
    icon.innerHTML = TOAST_ICONS[kind];

    const bodyEl = document.createElement('div');
    bodyEl.className = 'toast__body';

    const title = document.createElement('strong');
    title.className = 'toast__title';
    title.textContent = options.title || text[kind];

    const msg = document.createElement('p');
    msg.className = 'toast__message';
    // textContent, not innerHTML: some of these strings come back from the
    // form endpoint.
    msg.textContent = message;

    bodyEl.append(title, msg);

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'toast__close';
    close.setAttribute('aria-label', text.close);
    close.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
    close.addEventListener('click', () => dismissToast(toast));

    const progress = document.createElement('span');
    progress.className = 'toast__progress';
    // Set before the node is in the document: the CSS declares the animation
    // without a duration, so an element that lands in the DOM first would run
    // it to completion in one frame and flash an already-empty bar.
    if (duration > 0) {
        progress.style.animationDuration = duration + 'ms';
    } else {
        progress.style.display = 'none';
    }

    toast.append(icon, bodyEl, close, progress);
    container.appendChild(toast);

    if (duration > 0) {
        toast.dataset.timer = String(setTimeout(() => dismissToast(toast), duration));

        // Don't time out a message the visitor is currently reading or has
        // tabbed into. The CSS pauses the progress bar off the same states.
        const pause = () => clearTimeout(Number(toast.dataset.timer));
        const resume = () => {
            if (toast.dataset.closing === '1') return;
            toast.dataset.timer = String(setTimeout(() => dismissToast(toast), 2500));
        };
        toast.addEventListener('mouseenter', pause);
        toast.addEventListener('mouseleave', resume);
        toast.addEventListener('focusin', pause);
        toast.addEventListener('focusout', resume);
    }

    // Force the start state to be computed before flipping to the end state,
    // otherwise the two land in the same style recalculation and the entrance
    // transition never runs. Reading a layout property is what commits it.
    void toast.offsetHeight;
    toast.classList.add('toast--in');

    return toast;
}

// Escape closes the newest one, the way a dialog would.
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !toastContainer) return;
    const open = toastContainer.querySelectorAll('.toast:not(.toast--out)');
    if (open.length) dismissToast(open[open.length - 1]);
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

    // The request is no longer announced by a blocking alert, so the button
    // has to show that something is happening — and stay disabled until it
    // resolves, otherwise an impatient second tap sends the form twice.
    const submitBtn = consultationForm.querySelector('button[type="submit"], input[type="submit"]');
    // innerHTML, not textContent: the button carries an arrow icon in a span
    // that has to survive being put back.
    const submitMarkup = submitBtn ? submitBtn.innerHTML : '';
    const sendingText = {
        tr: 'Gönderiliyor...',
        en: 'Sending...',
        de: 'Wird gesendet...'
    };

    function setSubmitting(busy) {
        if (!submitBtn) return;
        submitBtn.disabled = busy;
        submitBtn.classList.toggle('is-submitting', busy);

        if (!busy) {
            submitBtn.innerHTML = submitMarkup;
            return;
        }

        const l = (document.documentElement.lang || 'tr').slice(0, 2).toLowerCase();
        submitBtn.textContent = sendingText[l] || sendingText.tr;
        const spinner = document.createElement('span');
        spinner.className = 'btn-spinner';
        spinner.setAttribute('aria-hidden', 'true');
        submitBtn.appendChild(spinner);
    }

    const invalidPhoneText = {
        tr: 'Telefon numarası geçerli görünmüyor. Lütfen ülke kodunu ve numarayı kontrol edin.',
        en: "That phone number doesn't look valid. Please check the country code and the number.",
        de: 'Die Telefonnummer scheint ungültig zu sein. Bitte prüfen Sie Ländervorwahl und Nummer.'
    };

    consultationForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (submitBtn && submitBtn.disabled) return;

        // A wrong phone number is the one mistake the form can't recover from —
        // it's the field we call people back on. Guarded on the utils script
        // because isValidNumber() returns false without it, and that script
        // comes from a CDN: if it fails to load, every submission would be
        // rejected here for no reason.
        if (iti && window.intlTelInputUtils && !iti.isValidNumber()) {
            const l = (document.documentElement.lang || 'tr').slice(0, 2).toLowerCase();
            showToast(invalidPhoneText[l] || invalidPhoneText.tr, 'error');
            const tel = consultationForm.querySelector('input[type="tel"]');
            if (tel) tel.focus();
            return;
        }

        setSubmitting(true);

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
                    showToast(successMessages[lang] || successMessages['tr'], 'success');
                    this.reset();
                } else {
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                            showToast(data["errors"].map(error => error["message"]).join(", "), 'error');
                        } else {
                            showToast(errorMessages[lang] || errorMessages['tr'], 'error');
                        }
                    }).catch(() => {
                        // A non-JSON error body would otherwise leave the
                        // visitor with no answer at all.
                        showToast(errorMessages[lang] || errorMessages['tr'], 'error');
                    })
                }
            }).catch(error => {
                showToast(errorMessages[lang] || errorMessages['tr'], 'error');
            }).finally(() => {
                setSubmitting(false);
            });
        } else {
            // Fallback if Formspree action isn't set properly
            showToast(successMessages[lang] || successMessages['tr'], 'success');
            this.reset();
            setSubmitting(false);
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
                if (entry.target.classList.contains('slide-in-left') ||
                    entry.target.classList.contains('will-reveal')) {
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

    // The treatment timeline arrives step by step rather than as five cards
    // appearing at once — the order is the whole message of that section. The
    // hidden state is applied from here, not from the stylesheet, so the cards
    // are simply visible if this script never runs.
    document.querySelectorAll('.process-card').forEach((element, i) => {
        element.classList.add('will-reveal');
        element.style.animationDelay = (i * 90) + 'ms';
        observer.observe(element);
    });
}

// ========== BEFORE/AFTER IMAGE SLIDER ==========
function initBeforeAfterSliders() {
    const sliders = document.querySelectorAll('.before-after-slider');

    sliders.forEach(slider => {
        const beforeImg = slider.querySelector('.img-before');
        const handle = slider.querySelector('.slider-handle');

        let isDragging = false;   // mouse only: pressed inside the slider
        let touchId = null;       // the finger that started on the slider
        let touchStartX = 0;
        let touchStartY = 0;
        let touchIsDrag = false;  // stays false while the gesture looks like a page scroll
        let rafId = 0;
        let pendingX = 0;

        // Touch handling used to flip a plain `isDragging` flag on touchstart and
        // then run on every window touchmove. Starting a normal vertical page
        // scroll with a finger on a slider therefore forced a
        // getBoundingClientRect + two style writes on every single touchmove —
        // layout thrash for the whole duration of the scroll, and the handle
        // jumped as a side effect. A gesture now only counts as a drag once it
        // proves it is mostly horizontal.
        const DRAG_THRESHOLD = 10; // px of movement before deciding the axis

        function paint() {
            rafId = 0;
            const rect = slider.getBoundingClientRect();
            if (!rect.width) return;
            const percentage = Math.max(0, Math.min(100, ((pendingX - rect.left) / rect.width) * 100));
            beforeImg.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
            handle.style.left = `${percentage}%`;
        }

        // Batch into the next frame: several move events can land inside one
        // frame, and each one on its own would force a synchronous layout.
        function schedule(clientX) {
            pendingX = clientX;
            if (!rafId) rafId = requestAnimationFrame(paint);
        }

        slider.addEventListener('mousedown', (e) => {
            isDragging = true;
            schedule(e.clientX);
            e.preventDefault();
        });
        window.addEventListener('mousemove', (e) => {
            if (isDragging) schedule(e.clientX);
        });
        window.addEventListener('mouseup', () => { isDragging = false; });

        slider.addEventListener('touchstart', (e) => {
            if (touchId !== null || e.touches.length !== 1) return;
            const t = e.touches[0];
            touchId = t.identifier;
            touchStartX = t.clientX;
            touchStartY = t.clientY;
            touchIsDrag = false;
        }, { passive: true });

        slider.addEventListener('touchmove', (e) => {
            if (touchId === null) return;

            let t = null;
            for (let i = 0; i < e.touches.length; i++) {
                if (e.touches[i].identifier === touchId) { t = e.touches[i]; break; }
            }
            if (!t) return;

            if (!touchIsDrag) {
                const dx = Math.abs(t.clientX - touchStartX);
                const dy = Math.abs(t.clientY - touchStartY);
                if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) return;
                if (dy >= dx) {
                    // Vertical: this is the visitor scrolling the page. Bow out
                    // for the rest of the gesture and touch nothing.
                    touchId = null;
                    return;
                }
                touchIsDrag = true;
            }

            // Only now, on a confirmed horizontal drag, stop the page from
            // scrolling sideways underneath the handle.
            if (e.cancelable) e.preventDefault();
            schedule(t.clientX);
        }, { passive: false });

        function endTouch() {
            touchId = null;
            touchIsDrag = false;
        }
        slider.addEventListener('touchend', endTouch, { passive: true });
        slider.addEventListener('touchcancel', endTouch, { passive: true });
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

        // Straight to the section's own top edge. Sections reserve room for the
        // fixed header in their top padding, so no extra offset is needed here —
        // subtracting the header height again would leave the tail of the
        // previous section on screen.
        const top = target.getBoundingClientRect().top + window.pageYOffset;

        window.scrollTo({
            top: Math.max(0, top),
            behavior: 'smooth'
        });
    });
});

// ========== LANDING ON A #HASH FROM ANOTHER PAGE ==========
// The header links to `index.html#faq` from the services and results pages.
// The browser does jump to the fragment, but it does so before the hero photo,
// the section images and the web fonts have arrived — each of which then grows
// the layout *above* the target and carries it back off screen, so the visitor
// lands on the top of the homepage instead of on the FAQ. Re-aiming after each
// of those settles is what actually gets them there.
(function landOnHashTarget() {
    const rawHash = window.location.hash;
    if (!rawHash || rawHash.length < 2) return;

    let target;
    try {
        target = document.querySelector(rawHash);
    } catch (err) {
        return; // not a valid selector (e.g. "#!/something")
    }
    if (!target) return;

    let cancelled = false;

    function aim() {
        if (cancelled) return;
        // No header offset: every section already carries enough top padding to
        // clear the fixed header, so its own top edge is the right landing
        // point. Subtracting the header height on top of that would park the
        // previous section's last 80px on screen.
        const top = target.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
    }

    // The moment the visitor takes over, stop correcting — being yanked back
    // is worse than landing a little off.
    function cancel() {
        cancelled = true;
    }
    window.addEventListener('wheel', cancel, { passive: true, once: true });
    window.addEventListener('touchstart', cancel, { passive: true, once: true });
    window.addEventListener('keydown', cancel, { once: true });

    aim();
    window.addEventListener('load', () => {
        aim();
        // One more after layout has settled: late images without dimensions and
        // the font swap both land shortly after `load`.
        setTimeout(aim, 120);
        setTimeout(aim, 400);
    });

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => setTimeout(aim, 60));
    }
})();

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
    const dotsEl = document.querySelector('.svc-dots');
    const dots = document.querySelectorAll('.svc-dot');
    const slidesEl = document.querySelector('.svc-slides');
    const slides = document.querySelectorAll('.svc-slide');
    const prevBtn = document.querySelector('.svc-prev');
    const nextBtn = document.querySelector('.svc-next');

    if (dots.length === 0 || slides.length === 0) return;

    let currentIndex = 0;

    /* --- The pill that slides between tabs ---------------------------------
       Built here rather than in the markup so all four language copies of this
       page pick it up without being edited. */
    let indicator = null;
    if (dotsEl) {
        indicator = document.createElement('span');
        indicator.className = 'svc-tab-indicator';
        indicator.setAttribute('aria-hidden', 'true');
        dotsEl.appendChild(indicator);
        dotsEl.classList.add('has-indicator');
    }

    function positionIndicator(animate) {
        if (!indicator) return;
        const dot = dots[currentIndex];
        if (!dot || !dot.offsetWidth) return;

        // The very first placement must not slide in from the top-left corner,
        // so it is applied with transitions off.
        if (!animate) indicator.style.transition = 'none';

        indicator.style.width = dot.offsetWidth + 'px';
        indicator.style.height = dot.offsetHeight + 'px';
        indicator.style.transform = 'translate(' + dot.offsetLeft + 'px,' + dot.offsetTop + 'px)';
        indicator.classList.add('is-ready');

        if (!animate) {
            // Read back a layout property so the untransitioned position is
            // committed before transitions are handed back.
            void indicator.offsetWidth;
            indicator.style.transition = '';
        }
    }

    /* --- ARIA ---------------------------------------------------------------
       The tabs are real buttons already; this tells assistive tech that they
       switch panels rather than navigate. Ids are generated so the markup
       doesn't have to carry them in four languages. */
    if (dotsEl) dotsEl.setAttribute('role', 'tablist');
    dots.forEach((dot, i) => {
        const panel = slides[i];
        dot.setAttribute('role', 'tab');
        dot.id = dot.id || 'svc-tab-' + i;
        dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        // Only the selected tab stays in the tab order; arrow keys move between
        // them, which is how a tablist is expected to behave.
        dot.setAttribute('tabindex', i === 0 ? '0' : '-1');
        if (panel) {
            panel.id = panel.id || 'svc-panel-' + i;
            panel.setAttribute('role', 'tabpanel');
            panel.setAttribute('aria-labelledby', dot.id);
            dot.setAttribute('aria-controls', panel.id);
        }
    });

    function showSlide(index, opts) {
        const options = opts || {};
        const total = slides.length;
        // Wrap around
        if (index >= total) index = 0;
        if (index < 0) index = total - 1;
        if (index === currentIndex && !options.force) return;

        // Which way the new slide should travel in. Stepping from the last tab
        // to the first is still "forward", so compare on the wrapped distance
        // rather than on the raw index.
        const forward = ((index - currentIndex + total) % total) <= total / 2;
        if (slidesEl) slidesEl.style.setProperty('--svc-dir', forward ? '1' : '-1');

        currentIndex = index;

        slides.forEach(s => s.classList.remove('active'));
        dots.forEach((d, i) => {
            d.classList.remove('active');
            d.setAttribute('aria-selected', 'false');
            d.setAttribute('tabindex', i === currentIndex ? '0' : '-1');
        });

        slides[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');
        dots[currentIndex].setAttribute('aria-selected', 'true');

        positionIndicator(true);

        // The tab strip scrolls horizontally on small screens; keep the active
        // tab visible when the slide changes via swipe or arrow. Guarded on the
        // strip actually overflowing, so on desktop this can never nudge the
        // page itself.
        if (dotsEl && dotsEl.scrollWidth > dotsEl.clientWidth + 1) {
            dots[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }

        if (options.focusTab) dots[currentIndex].focus();

        // Every change — a click, a swipe, an arrow key or the timer itself —
        // restarts the countdown, so a slide the visitor just chose always gets
        // its full turn rather than the remainder of the previous one.
        restartProgress();
    }

    // Dot click
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            showSlide(parseInt(dot.dataset.index, 10));
        });
    });

    // Left/right walk the tabs while one of them has focus — expected of a
    // tablist, and it makes the carousel usable without a mouse.
    if (dotsEl) {
        dotsEl.addEventListener('keydown', (e) => {
            let next = null;
            if (e.key === 'ArrowRight') next = currentIndex + 1;
            else if (e.key === 'ArrowLeft') next = currentIndex - 1;
            else if (e.key === 'Home') next = 0;
            else if (e.key === 'End') next = slides.length - 1;
            if (next === null) return;
            e.preventDefault();
            showSlide(next, { focusTab: true });
        });
    }

    // Arrow click
    if (prevBtn) prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));

    const wrapperEl = document.querySelector('.svc-slides-wrapper');

    addSwipe(
        wrapperEl,
        () => showSlide(currentIndex + 1),
        () => showSlide(currentIndex - 1)
    );

    /* --- Autoplay -----------------------------------------------------------
       The countdown is the progress bar: the bar's own CSS animation is what
       ends the slide (animationend → next), so what is on screen and what the
       timer thinks can never disagree — no setInterval racing a transition, and
       pausing is one class rather than a cleared and re-armed timer.

       It holds while the visitor is on the panel (hover or keyboard focus),
       while the tab is in the background, and while the section is scrolled
       out of view: nothing should change behind someone's back, and nobody
       should return to the page having missed four slides. */
    const SLIDE_INTERVAL_MS = 7000;
    const panelEl = document.querySelector('.svc-carousel');
    const prefersReducedMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let progressEl = null;
    let progressFill = null;
    // Several independent things can pause the carousel; it resumes only once
    // every one of them has let go.
    const holds = new Set();

    if (panelEl && wrapperEl && slides.length > 1 && !prefersReducedMotion) {
        progressEl = document.createElement('div');
        progressEl.className = 'svc-progress';
        progressEl.setAttribute('aria-hidden', 'true');
        progressEl.style.setProperty('--svc-interval', SLIDE_INTERVAL_MS + 'ms');
        progressFill = document.createElement('span');
        progressEl.appendChild(progressFill);
        panelEl.insertBefore(progressEl, wrapperEl);

        progressFill.addEventListener('animationend', () => {
            showSlide(currentIndex + 1);
        });

        const hold = (reason) => {
            holds.add(reason);
            syncPaused();
        };
        const release = (reason) => {
            holds.delete(reason);
            syncPaused();
        };

        // Guarded on a real pointer: on a touch screen `mouseenter` fires on tap
        // and the matching `mouseleave` may never come, which would leave the
        // carousel paused for the rest of the visit.
        if (!window.matchMedia || window.matchMedia('(hover: hover)').matches) {
            panelEl.addEventListener('mouseenter', () => hold('hover'));
            panelEl.addEventListener('mouseleave', () => release('hover'));
        }

        // Only keyboard focus holds. A mouse click on a tab focuses it too, and
        // holding on that would stop the carousel for good the first time
        // someone picked a technique with the mouse.
        panelEl.addEventListener('focusin', (e) => {
            let keyboard = true;
            try {
                keyboard = e.target.matches(':focus-visible');
            } catch (err) {
                /* older browser: treat any focus as keyboard focus */
            }
            if (keyboard) hold('focus');
        });
        panelEl.addEventListener('focusout', () => release('focus'));

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) hold('hidden');
            else release('hidden');
        });

        if ('IntersectionObserver' in window) {
            const section = panelEl.closest('.services-carousel-section') || panelEl;
            new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) release('offscreen');
                    else hold('offscreen');
                });
            }, { threshold: 0.25 }).observe(section);
        }
    }

    function syncPaused() {
        if (!progressEl) return;
        progressEl.classList.toggle('is-paused', holds.size > 0);
    }

    function restartProgress() {
        if (!progressEl || !progressFill) return;
        progressEl.classList.remove('is-running');
        // Forces the cancelled animation to be committed, so re-adding the
        // class starts a new run instead of continuing the old one.
        void progressFill.offsetWidth;
        progressEl.classList.add('is-running');
        syncPaused();
    }

    restartProgress();

    // The pill is measured from the tabs, so it has to be re-measured whenever
    // they can have changed size: the font swap and any reflow.
    positionIndicator(false);
    window.addEventListener('load', () => positionIndicator(false));
    window.addEventListener('resize', debounce(() => positionIndicator(false), 150));
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => positionIndicator(false));
    }
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
