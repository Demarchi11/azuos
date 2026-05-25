/**
 * Script principal - Inicialização global da aplicação
 * Setup e configurações que rodamem todas as páginas
 */

// Atualiza ano no footer
document.addEventListener('DOMContentLoaded', () => {
  const yearElements = document.querySelectorAll('[data-year]');
  const currentYear = new Date().getFullYear();
  
  yearElements.forEach(el => {
    el.textContent = currentYear;
  });

  // Setup do header em mobile
  setupMobileHeader();
});

/**
 * Setup do header responsivo em mobile
 */
function setupMobileHeader() {
  const navToggle = document.querySelector('[data-site-nav-toggle]');
  const nav = document.querySelector('#siteNav');
  
  if (!navToggle || !nav) return;

  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    
    navToggle.setAttribute('aria-expanded', !isExpanded);
    nav.classList.toggle('site-nav--mobile-open');
  });

  // Fecha menu ao clicar em um link
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('site-nav--mobile-open');
    });
  });
}

/**
 * Scroll para seções (usado nos data-scroll-target)
 */
document.addEventListener('click', (e) => {
  const scrollTarget = e.target.getAttribute('data-scroll-target');
  
  if (scrollTarget) {
    e.preventDefault();
    smoothScroll(scrollTarget);
  }
});
