
'use strict';

const mainNav = document.getElementById('mainNav');

function handleNavScroll() {
  if (window.scrollY > 60) {
    mainNav.classList.add('scrolled');
  } else {
    mainNav.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavScroll, { passive: true });

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('#mainNav .nav-link');

function updateActiveLink() {
  let currentSection = '';
  const scrollPos = window.scrollY + 100;

  sections.forEach(section => {
    if (scrollPos >= section.offsetTop) {
      currentSection = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + currentSection) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Once revealed, stop observing to save performance
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,      // trigger when 12% of element is visible
    rootMargin: '0px 0px -40px 0px'
  }
);

// Observe all .reveal elements
document.querySelectorAll('.reveal').forEach(el => {
  revealObserver.observe(el);
});


/* =============================================
   4. ANIMATED STAT COUNTERS
   Counts up from 0 to the data-target value
   when the stats card enters the viewport
============================================== */
function animateCounter(element, target, duration) {
  let start = 0;
  const step = target / (duration / 16); // ~60fps

  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(start);
    }
  }, 16);
}

const statsCard = document.querySelector('.stats-card');
let countersStarted = false;

if (statsCard) {
  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersStarted) {
          countersStarted = true;

          document.querySelectorAll('.stat-number').forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            animateCounter(counter, target, 1500);
          });

          statsObserver.disconnect();
        }
      });
    },
    { threshold: 0.4 }
  );

  statsObserver.observe(statsCard);
}


/* =============================================
   5. CONTACT FORM — Validation & Submission
   Client-side validation before sending.
   Uses Formspree for email delivery.
============================================== */
const contactForm = document.getElementById('contactForm');
const formFeedback = document.getElementById('formFeedback');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');

if (contactForm) {
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    // ── Validation ──
    const fields = contactForm.querySelectorAll('[required]');
    let isValid = true;

    fields.forEach(field => {
      field.classList.remove('is-invalid');

      if (!field.value.trim()) {
        field.classList.add('is-invalid');
        isValid = false;
      }

      // Email format check
      if (field.type === 'email') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(field.value.trim())) {
          field.classList.add('is-invalid');
          isValid = false;
        }
      }
    });

    if (!isValid) {
      showFeedback('error', 'Please fill in all required fields correctly.');
      return;
    }

    // ── Loading state ──
    submitBtn.disabled = true;
    btnText.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';

    // ── Submit to Formspree ──
    try {
      const formData = new FormData(contactForm);
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        contactForm.reset();
        fields.forEach(f => f.classList.remove('is-invalid'));
        showFeedback(
          'success',
          'Thank you! Your message has been sent successfully. We will get back to you soon.'
        );
      } else {
        showFeedback(
          'error',
          'Something went wrong. Please email us directly at ailab@diu.edu.bd'
        );
      }
    } catch (err) {
      showFeedback(
        'error',
        'Network error. Please check your connection and try again.'
      );
    } finally {
      submitBtn.disabled = false;
      btnText.innerHTML = '<i class="bi bi-send-fill"></i> Send Message';
    }
  });

  // Remove invalid state on input
  contactForm.querySelectorAll('.form-control, .form-select').forEach(field => {
    field.addEventListener('input', () => field.classList.remove('is-invalid'));
  });
}

function showFeedback(type, message) {
  if (!formFeedback) return;
  formFeedback.className = 'form-feedback ' + type;
  formFeedback.textContent = message;
  formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Auto-hide success after 6 seconds
  if (type === 'success') {
    setTimeout(() => {
      formFeedback.className = 'form-feedback';
      formFeedback.textContent = '';
    }, 6000);
  }
}


/* =============================================
   6. SMOOTH SCROLL for anchor links
   Closes mobile menu after clicking a link
============================================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });

      // Close Bootstrap mobile navbar if open
      const navCollapse = document.getElementById('navMenu');
      if (navCollapse && navCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
        if (bsCollapse) bsCollapse.hide();
      }
    }
  });
});
