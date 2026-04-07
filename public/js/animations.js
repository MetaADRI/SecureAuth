/**
 * SecureAuth Frontend Animations
 * Smooth scroll effects and interactive elements
 */

// Initialize Intersection Observer for scroll animations
document.addEventListener('DOMContentLoaded', () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all fade-in elements
  const fadeElements = document.querySelectorAll('.fade-in-on-scroll');
  fadeElements.forEach(el => observer.observe(el));

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#' && document.querySelector(href)) {
        e.preventDefault();
        document.querySelector(href).scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Add animation to buttons on hover
  const buttons = document.querySelectorAll('button, [class*="btn"]');
  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.02)';
    });
    btn.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
    });
  });

  // Add subtle parallax to hero section
  const heroSection = document.querySelector('.hero-gradient');
  if (heroSection) {
    window.addEventListener('scroll', () => {
      const scrollPosition = window.pageYOffset;
      heroSection.style.backgroundPosition = `0 ${scrollPosition * 0.5}px`;
    });
  }

  // Auto-hide loading spinners after animations
  const spinners = document.querySelectorAll('.spinner-border, [id*="Spinner"]');
  spinners.forEach(spinner => {
    if (spinner.classList.contains('d-none') || spinner.classList.contains('hidden')) {
      spinner.style.display = 'none';
    }
  });

  // Add input focus effects
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
    });
    input.addEventListener('blur', function() {
      this.parentElement.classList.remove('focused');
    });
  });

  // Prevent form submission default behavior with visual feedback
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn && !submitBtn.disabled) {
        submitBtn.style.opacity = '0.8';
      }
    });
  });

  console.log('✨ SecureAuth animations initialized');
});

// Utility function for smooth transitions
function smoothTransition(element, property, startValue, endValue, duration = 300) {
  const startTime = performance.now();
  
  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const currentValue = startValue + (endValue - startValue) * progress;
    element.style[property] = currentValue;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  
  requestAnimationFrame(animate);
}

// Export for use in other scripts
window.SecureAuthAnimations = {
  smoothTransition
};
