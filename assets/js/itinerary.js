(function() {
  'use strict';
  
  // Mobile navigation toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('active');
    });
    
    // Close menu on link click (mobile)
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function() {
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Packing list checkbox toggle
  document.querySelectorAll('.packing-checkbox').forEach(checkbox => {
    checkbox.addEventListener('click', function() {
      const parentLi = this.closest('li');
      if (parentLi) {
        this.textContent = this.textContent === '☐' ? '☑' : '☐';
        parentLi.classList.toggle('completed');
      }
    });
  });
  
  // Add loading animation
  document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('loaded');
  });
})();