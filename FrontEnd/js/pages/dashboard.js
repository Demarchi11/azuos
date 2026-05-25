/**
 * Script da página Dashboard
 * Carrega e exibe dados agregados do usuário
 */

class DashboardPage {
  constructor() {
    this.checkAuth();
    this.init();
  }

  /**
   * Verifica autenticação
   */
  checkAuth() {
    if (!AuthService.isLoggedIn()) {
      window.location.href = 'login.html';
      return;
    }
  }

  async init() {
    try {
      // Carrega dados do dashboard
      const data = await DashboardService.loadDashboardData();
      
      // Renderiza componentes
      this.renderGreeting(data.user);
      this.renderMetrics(data);
      this.renderHeroSection(data);
      
      // Configura listeners
      this.setupEventListeners();
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      this.showError('Erro ao carregar dados do painel.');
    }
  }

  /**
   * Renderiza saudação personalizada
   */
  renderGreeting(user) {
    const greetMsg = document.getElementById('greetMsg');
    if (greetMsg && user) {
      const hour = new Date().getHours();
      let greeting = 'Olá';

      if (hour < 12) greeting = 'Bom dia';
      else if (hour < 18) greeting = 'Boa tarde';
      else greeting = 'Boa noite';

      greetMsg.textContent = `${greeting}, ${user.nome}! Bem-vindo(a) ao painel operacional.`;
    }
  }

  /**
   * Renderiza métricas
   */
  renderMetrics(data) {
    // Submissões
    const metricSubmissions = document.getElementById('metricSubmissions');
    if (metricSubmissions) {
      metricSubmissions.textContent = data.totalSubmissions;
    }

    const metricSubmissionsMeta = document.getElementById('metricSubmissionsMeta');
    if (metricSubmissionsMeta) {
      metricSubmissionsMeta.textContent =
        data.totalSubmissions === 0
          ? 'Nenhuma submissão ainda'
          : `${data.totalSubmissions} form${data.totalSubmissions !== 1 ? 'ulário' : ''}`;
    }

    // Pendentes
    const metricPending = document.getElementById('metricPending');
    if (metricPending) {
      metricPending.textContent = data.pendingAnalysis;
    }

    const metricPendingMeta = document.getElementById('metricPendingMeta');
    if (metricPendingMeta) {
      metricPendingMeta.textContent =
        data.pendingAnalysis === 0
          ? 'Tudo processado'
          : `${data.pendingAnalysis} aguardando análise`;
    }

    // Completas
    const metricCompleted = document.getElementById('metricCompleted');
    if (metricCompleted) {
      metricCompleted.textContent = data.completedAnalysis;
    }

    const metricCompletedMeta = document.getElementById('metricCompletedMeta');
    if (metricCompletedMeta) {
      metricCompletedMeta.textContent =
        data.completedAnalysis === 0
          ? 'Relatórios não liberados'
          : `${data.completedAnalysis} análise${data.completedAnalysis !== 1 ? 's' : ''} concluída${data.completedAnalysis !== 1 ? 's' : ''}`;
    }

    // Equipe
    const metricTeam = document.getElementById('metricTeam');
    if (metricTeam) {
      metricTeam.textContent = data.teamCount;
    }

    const metricTeamLabel = document.getElementById('metricTeamLabel');
    if (metricTeamLabel) {
      metricTeamLabel.textContent =
        data.teamCount === 0 ? 'Nenhum cadastro' : `Membro${data.teamCount !== 1 ? 's' : ''} da equipe`;
    }
  }

  /**
   * Renderiza seção herói com score
   */
  renderHeroSection(data) {
    const scoreNum = document.getElementById('scoreNum');
    const ringFill = document.getElementById('ringFill');
    const heroTitle = document.getElementById('dashboardHeroTitle');
    const heroDesc = document.getElementById('dashboardHeroDesc');
    const dashboardTags = document.getElementById('dashboardTags');

    if (data.latestScore !== null && scoreNum) {
      // Calcula porcentagem de preenchimento do anel
      const circumference = 2 * Math.PI * 55;
      const strokeDashoffset = circumference - (data.latestScore / 100) * circumference;

      scoreNum.textContent = data.latestScore;
      if (ringFill) {
        ringFill.style.strokeDashoffset = strokeDashoffset;
        ringFill.classList.add(UIUtils.getScoreClass(data.latestScore));
      }

      if (heroTitle) {
        heroTitle.textContent = this.getScoreFeedback(data.latestScore);
      }

      if (heroDesc) {
        heroDesc.textContent = 'Última análise realizada. Continue acompanhando sua evolução.';
      }

      // Renderiza tags de feedback
      if (dashboardTags) {
        dashboardTags.innerHTML = this.getScoreTags(data.latestScore);
      }
    } else {
      if (heroTitle) {
        heroTitle.textContent = 'Aguardando seu primeiro formulário';
      }

      if (heroDesc) {
        heroDesc.textContent = 'Complete um diagnóstico para começar a ver seus indicadores de ética e inclusão.';
      }

      if (scoreNum) {
        scoreNum.textContent = '--';
      }
    }
  }

  /**
   * Obtém feedback baseado no score
   */
  getScoreFeedback(score) {
    if (score >= 80) return 'Excelente desempenho!';
    if (score >= 60) return 'Bom trabalho!';
    if (score >= 40) return 'Continue se capacitando';
    return 'Oportunidades de melhoria';
  }

  /**
   * Gera tags com feedback de score
   */
  getScoreTags(score) {
    let tags = '';

    if (score >= 80) {
      tags += '<span class="badge badge--success">Liderança ética</span>';
      tags += '<span class="badge badge--success">Inclusivo</span>';
    } else if (score >= 60) {
      tags += '<span class="badge badge--accent">Bom percurso</span>';
      tags += '<span class="badge badge--accent">Potencial de crescimento</span>';
    } else {
      tags += '<span class="badge badge--dark">Necessário desenvolvimento</span>';
      tags += '<span class="badge badge--dark">Trilha recomendada</span>';
    }

    return tags;
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
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

  /**
   * Exibe erro
   */
  showError(message) {
    console.error(message);
    const alert = document.createElement('div');
    alert.className = 'error-banner';
    alert.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i><span>${message}</span>`;
    document.body.insertBefore(alert, document.body.firstChild);
  }
}

// Inicializa quando o DOM está pronto
document.addEventListener('DOMContentLoaded', () => {
  new DashboardPage();
});
