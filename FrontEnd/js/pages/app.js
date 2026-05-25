/**
 * Script genérico de inicialização para páginas
 * Pode ser usado para páginas que precisam apenas de verificação de autenticação
 * e carregamento de sidebar comum
 */

class AppPage {
  constructor() {
    this.checkAuth();
    this.initCommon();
  }

  checkAuth() {
    if (!AuthService.isLoggedIn()) {
      window.location.href = 'login.html';
      return;
    }
  }

  async initCommon() {
    try {
      // Carrega sidebar com navegação
      await this.loadSidebar();

      // Configura header
      this.setupHeader();

      // Setup geral
      this.setupEventListeners();
    } catch (error) {
      console.error('Erro ao inicializar página:', error);
    }
  }

  /**
   * Carrega sidebar
   */
  async loadSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const user = APIService.getStoredUser();

    let html = `
      <div class="sidebar__brand">
        <a class="brand brand--compact" href="dashboard.html">
          <img src="../assets/icons/icon.png" alt="Azuos">
          <span class="brand__text">Azuos</span>
        </a>
      </div>

      <nav class="sidebar__nav" aria-label="Principal">
        <a href="dashboard.html" class="nav-item" data-page="dashboard">
          <i class="fa-solid fa-chart-line"></i>
          <span>Dashboard</span>
        </a>
        <a href="formulario.html" class="nav-item" data-page="formulario">
          <i class="fa-solid fa-clipboard-list"></i>
          <span>Formulário</span>
        </a>
        <a href="historico.html" class="nav-item" data-page="historico">
          <i class="fa-solid fa-history"></i>
          <span>Histórico</span>
        </a>
        <a href="ranking.html" class="nav-item" data-page="ranking">
          <i class="fa-solid fa-trophy"></i>
          <span>Ranking</span>
        </a>
        <a href="relatorios.html" class="nav-item" data-page="relatorios">
          <i class="fa-solid fa-file-lines"></i>
          <span>Relatórios</span>
        </a>
    `;

    // Menu de líder
    if (user.lider) {
      html += `
        <hr class="sidebar__divider">
        <p class="sidebar__label">Liderança</p>
        <a href="equipe.html" class="nav-item" data-page="equipe">
          <i class="fa-solid fa-users"></i>
          <span>Equipe</span>
        </a>
        <a href="trilhas.html" class="nav-item" data-page="trilhas">
          <i class="fa-solid fa-graduation-cap"></i>
          <span>Trilhas</span>
        </a>
      `;
    }

    html += `
        <hr class="sidebar__divider">
        <a href="configuracoes.html" class="nav-item" data-page="configuracoes">
          <i class="fa-solid fa-gear"></i>
          <span>Configurações</span>
        </a>
        <a href="notificacoes.html" class="nav-item" data-page="notificacoes">
          <i class="fa-solid fa-bell"></i>
          <span>Notificações</span>
        </a>
      </nav>

      <div class="sidebar__footer">
        <div class="user-card">
          <div class="user-card__avatar">
            ${user.nome.charAt(0).toUpperCase()}
          </div>
          <div class="user-card__info">
            <p class="user-card__name">${user.nome}</p>
            <p class="user-card__role">${user.lider ? 'Líder' : 'Membro'}</p>
          </div>
          <button class="user-card__logout" type="button" data-logout aria-label="Sair">
            <i class="fa-solid fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    `;

    sidebar.innerHTML = html;

    // Marca link ativo
    const currentPage = this.getCurrentPage();
    const activeLink = sidebar.querySelector(`[data-page="${currentPage}"]`);
    if (activeLink) {
      activeLink.classList.add('is-active');
    }
  }

  /**
   * Obtém página atual do DOM
   */
  getCurrentPage() {
    const pageFile = document.body.dataset.pageFile || '';
    return pageFile.replace('.html', '');
  }

  /**
   * Configura header
   */
  setupHeader() {
    const year = document.querySelector('[data-year]');
    if (year) {
      year.textContent = new Date().getFullYear();
    }
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Toggle sidebar em mobile
    const mobileToggle = document.querySelector('[data-sidebar-toggle]');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
          sidebar.classList.toggle('sidebar--open');
        }
      });
    }

    // Fechar sidebar ao clicar fora
    const overlay = document.getElementById('overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
          sidebar.classList.remove('sidebar--open');
        }
      });
    }

    // Logout
    const logoutBtn = document.querySelector('[data-logout]');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja sair?')) {
          AuthService.logout();
        }
      });
    }
  }
}

// Inicializa quando o DOM está pronto
document.addEventListener('DOMContentLoaded', () => {
  new AppPage();
});
