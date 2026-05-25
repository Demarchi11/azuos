/**
 * Script da página Home/Landing
 * Gerencia animações e interatividades da página principal
 */

class HomePage {
  constructor() {
    this.init();
  }

  init() {
    this.setupTeamCarousel();
    this.setupCounters();
    this.setupContactForm();
  }

  /**
   * Setup do carrossel de time
   */
  setupTeamCarousel() {
    const nameButtons = document.querySelectorAll('.team-chip--interactive');
    if (nameButtons.length === 0) return;

    const teamData = [
      {
        name: 'Gabriel Toledo',
        formation: 'Estudante do Ensino Médio Técnico em Desenvolvimento de Sistemas'
      },
      {
        name: 'João V. Demarchi',
        formation: 'Estudante do Ensino Médio Técnico em Desenvolvimento de Sistemas'
      },
      {
        name: 'Mathias Basílio',
        formation: 'Estudante do Ensino Médio Técnico em Desenvolvimento de Sistemas'
      },
      {
        name: 'Nicolas Esteves',
        formation: 'Estudante do Ensino Médio Técnico em Desenvolvimento de Sistemas'
      },
      {
        name: 'Thiago Tesch',
        formation: 'Estudante do Ensino Médio Técnico em Desenvolvimento de Sistemas'
      }
    ];

    const teamMemberName = document.getElementById('teamMemberName');
    const teamMemberFormation = document.getElementById('teamMemberFormation');
    const teamMemberAvatar = document.getElementById('teamMemberAvatar');
    const teamMemberCounter = document.getElementById('teamMemberCounter');

    nameButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        this.updateTeamMember(
          index,
          teamData,
          teamMemberName,
          teamMemberFormation,
          teamMemberAvatar,
          teamMemberCounter,
          nameButtons
        );
      });

      // Hover em desktop
      button.addEventListener('mouseenter', () => {
        this.updateTeamMember(
          index,
          teamData,
          teamMemberName,
          teamMemberFormation,
          teamMemberAvatar,
          teamMemberCounter,
          nameButtons
        );
      });
    });

    // Carrega primeiro membro por padrão
    this.updateTeamMember(
      0,
      teamData,
      teamMemberName,
      teamMemberFormation,
      teamMemberAvatar,
      teamMemberCounter,
      nameButtons
    );
  }

  /**
   * Atualiza membro do time
   */
  updateTeamMember(
    index,
    teamData,
    nameEl,
    formationEl,
    avatarEl,
    counterEl,
    buttons
  ) {
    const member = teamData[index];

    if (nameEl) nameEl.textContent = member.name;
    if (formationEl) {
      const span = formationEl.querySelector('span');
      if (span) span.textContent = member.formation;
    }

    if (avatarEl) {
      avatarEl.textContent = member.name.charAt(0).toUpperCase();
    }

    if (counterEl) {
      counterEl.textContent = `${String(index + 1).padStart(2, '0')} / ${teamData.length}`;
    }

    // Marca botão ativo
    buttons.forEach(btn => btn.classList.remove('team-chip--active'));
    buttons[index].classList.add('team-chip--active');
  }

  /**
   * Setup de contadores com animação
   */
  setupCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length === 0) return;

    const observerOptions = {
      threshold: 0.5
    };

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          const target = parseInt(entry.target.getAttribute('data-count'));
          const suffix = entry.target.getAttribute('data-suffix') || '';

          animateCounter(entry.target, target, 2000);
          entry.target.textContent += suffix;
          entry.target.classList.add('counted');
        }
      });
    }, observerOptions);

    counters.forEach(counter => counterObserver.observe(counter));
  }

  /**
   * Setup do formulário de contato
   */
  setupContactForm() {
    const contactForm = document.getElementById('contactLeadForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('leadEmail');
      const email = emailInput.value.trim();

      if (!this.isValidEmail(email)) {
        alert('Por favor, insira um e-mail válido.');
        return;
      }

      // Simula envio (pode ser integrado com API depois)
      console.log('Email de contato:', email);
      
      alert('Obrigado! Entraremos em contato em breve.');
      contactForm.reset();
    });
  }

  /**
   * Valida email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Inicializa quando o DOM está pronto
document.addEventListener('DOMContentLoaded', () => {
  new HomePage();
});
