/**
 * Utilitários gerais da página
 * Funções auxiliares que podem ser usadas em qualquer página
 */

// Scroll suave entre seções
function smoothScroll(target) {
  if (typeof target === 'string') {
    const element = document.querySelector(target);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

// Anima números com contagem
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

// Toggle de classes
function toggleClass(element, className) {
  if (typeof element === 'string') {
    element = document.querySelector(element);
  }
  if (element) {
    element.classList.toggle(className);
  }
}

// Verifica se elemento está visível
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Intersection Observer para animações de reveal
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      // Desobserva depois de revelar para não animar novamente
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

// Inicializa observers quando DOM está pronto
document.addEventListener('DOMContentLoaded', () => {
  const revealElements = document.querySelectorAll('.reveal');
  
  revealElements.forEach(el => {
    // Se já está no viewport, marca como revelado imediatamente
    if (isElementInViewport(el)) {
      el.classList.add('revealed');
    } else {
      // Caso contrário, observa para revelar quando entrar em view
      revealObserver.observe(el);
    }
  });
});

// Continua observando mesmo após DOMContentLoaded (para elementos dinâmicos)
window.addEventListener('load', () => {
  const revealElements = document.querySelectorAll('.reveal:not(.revealed)');
  revealElements.forEach(el => {
    if (isElementInViewport(el)) {
      el.classList.add('revealed');
    } else {
      revealObserver.observe(el);
    }
  });
});
