// ---------- Header: add a background once the page is scrolled ----------
const header = document.getElementById('site-header');
const toTop = document.getElementById('to-top');

function onScroll() {
    const scrolled = window.scrollY > 20;
    header.classList.toggle('bg-ink-950/80', scrolled);
    header.classList.toggle('backdrop-blur-lg', scrolled);
    header.classList.toggle('border-white/10', scrolled);

    const showTop = window.scrollY > 600;
    toTop.classList.toggle('opacity-0', !showTop);
    toTop.classList.toggle('translate-y-20', !showTop);
    toTop.classList.toggle('pointer-events-none', !showTop);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

toTop.addEventListener('click', () => window.scrollTo({ top: 0 }));

// ---------- Mobile menu ----------
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

function setMenu(open) {
    mobileMenu.classList.toggle('hidden', !open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuToggle.querySelector('.menu-open').classList.toggle('hidden', open);
    menuToggle.querySelector('.menu-close').classList.toggle('hidden', !open);
    header.classList.toggle('bg-ink-950/95', open);
}

menuToggle.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
});
mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
});
window.matchMedia('(min-width: 768px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
});

// ---------- Highlight the nav link of the section in view ----------
const navLinks = document.querySelectorAll('.nav-link');
const sections = [...navLinks].map((link) => document.querySelector(link.getAttribute('href')));

const sectionObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navLinks.forEach((link) => {
                link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
            });
        });
    },
    { rootMargin: '-45% 0px -50% 0px' }
);
sections.forEach((section) => section && sectionObserver.observe(section));

// ---------- Reveal elements as they scroll into view ----------
const revealObserver = new IntersectionObserver(
    (entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    },
    { threshold: 0.15 }
);
document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));

// ---------- Typing effect for the hero roles ----------
const typedRole = document.getElementById('typed-role');
const roles = ['Frontend Developer', 'Tailwind CSS Enthusiast', 'JavaScript Developer', 'Problem Solver'];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (typedRole && !reduceMotion) {
    let roleIndex = 0;
    let charIndex = roles[0].length;
    let deleting = true;

    function type() {
        const role = roles[roleIndex];
        charIndex += deleting ? -1 : 1;
        typedRole.textContent = role.slice(0, charIndex);

        let delay = deleting ? 45 : 90;
        if (!deleting && charIndex === role.length) {
            deleting = true;
            delay = 1800;
        } else if (deleting && charIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            delay = 300;
        }
        setTimeout(type, delay);
    }
    setTimeout(type, 2000);
}

// ---------- Contact form: validate, then send the message to my inbox via FormSubmit ----------
const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');
const submitBtn = form.querySelector('button[type="submit"]');
const EMAIL_TO = 'joshuagboga@gmail.com';
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${EMAIL_TO}`;

function showError(field, show) {
    field.classList.toggle('!border-red-400', show);
    field.setAttribute('aria-invalid', String(show));
    const error = field.parentElement.querySelector('.field-error');
    if (error) error.classList.toggle('hidden', !show);
}

function setStatus(text, isError = false) {
    statusEl.textContent = text;
    statusEl.classList.toggle('text-red-400', isError);
    statusEl.classList.toggle('text-gold-300', !isError);
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { name, email, subject, message, _honey } = form.elements;

    let valid = true;
    [name, email, message].forEach((field) => {
        const bad = !field.value.trim() || !field.checkValidity();
        showError(field, bad);
        if (bad && valid) {
            field.focus();
            valid = false;
        }
    });
    if (!valid) return;

    // Bots fill in the hidden honeypot field; people never see it.
    if (_honey.value) return;

    const mailSubject = subject.value.trim() || `Portfolio enquiry from ${name.value.trim()}`;
    const buttonLabel = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-60', 'cursor-wait');
    submitBtn.textContent = 'Sending…';
    setStatus('');

    try {
        const response = await fetch(FORM_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                name: name.value.trim(),
                email: email.value.trim(),
                message: message.value.trim(),
                _subject: mailSubject,
                _replyto: email.value.trim(),
                _template: 'table',
                _captcha: 'false',
            }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || String(result.success) !== 'true') throw new Error(result.message || 'Send failed');

        setStatus("Thanks! Your message has been sent. I'll get back to you soon.");
        form.reset();
    } catch {
        setStatus(`Sorry, your message couldn't be sent. Please email me directly at ${EMAIL_TO}.`, true);
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-60', 'cursor-wait');
        submitBtn.innerHTML = buttonLabel;
    }
});

form.querySelectorAll('.form-field').forEach((field) => {
    field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') showError(field, !field.checkValidity());
    });
});

// ---------- Footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();
