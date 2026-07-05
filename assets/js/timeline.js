(function() {
  'use strict';
  
  // Timeline interactive features
  const timelineDays = document.querySelectorAll('.timeline-day');
  
  timelineDays.forEach(day => {
    // Toggle day details on mobile
    const header = day.querySelector('.day-header');
    const events = day.querySelector('.day-events');
    
    if (header && events) {
      header.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
        events.classList.toggle('expanded');
      });
      
      // Initialize mobile state
      if (window.innerWidth <= 768) {
        events.classList.remove('expanded');
        header.setAttribute('aria-expanded', 'false');
      } else {
        events.classList.add('expanded');
        header.setAttribute('aria-expanded', 'true');
      }
      
      // Handle resize
      window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
          events.classList.remove('expanded');
          header.setAttribute('aria-expanded', 'false');
        } else {
          events.classList.add('expanded');
          header.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });
  
  // Animate timeline items on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.event-item').forEach(item => {
    observer.observe(item);
  });
})();