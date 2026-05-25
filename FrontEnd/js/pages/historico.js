/**
 * Script da página Histórico
 * Exibe histórico de submissões e relatórios do usuário
 */

class HistoricoPage {
  constructor() {
    this.checkAuth();
    this.init();
  }

  checkAuth() {
    if (!AuthService.isLoggedIn()) {
      window.location.href = 'login.html';
      return;
    }
  }

  async init() {
    try {
      const history = await DashboardService.getDetailedHistory();
      this.renderHistory(history);
      this.setupEventListeners();
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      UIUtils.showError('Erro ao carregar histórico de submissões.');
    }
  }

  /**
   * Renderiza histórico de submissões
   */
  renderHistory(history) {
    const historyContainer = document.getElementById('historyContainer') || 
                             document.querySelector('[data-history-list]') ||
                             document.querySelector('.submissions-list');

    if (!historyContainer) {
      console.warn('Container de histórico não encontrado');
      return;
    }

    if (history.length === 0) {
      historyContainer.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-inbox"></i>
          <h3>Sem histórico</h3>
          <p>Complete um formulário para ver seu histórico de submissões.</p>
        </div>
      `;
      return;
    }

    historyContainer.innerHTML = '';

    history.forEach((item, index) => {
      const submission = item.submission;
      const report = item.report;

      const card = document.createElement('article');
      card.className = 'panel submission-card';
      card.innerHTML = `
        <div class="submission-card__header">
          <div>
            <h3 class="submission-card__title">
              Submissão #${history.length - index}
            </h3>
            <p class="submission-card__date">
              <i class="fa-solid fa-calendar"></i>
              ${UIUtils.formatDate(submission.data_submissao)}
            </p>
          </div>
          <div class="submission-card__status">
            <div class="score-badge ${UIUtils.getScoreClass(submission.pontuacao || 0)}">
              ${submission.pontuacao !== null ? submission.pontuacao : '--'}
            </div>
          </div>
        </div>

        <div class="submission-card__content">
          ${report ? this.renderReport(report) : this.renderPendingReport()}
        </div>

        <div class="submission-card__actions">
          ${report ? `
            <button class="btn btn-secondary btn--sm" data-view-report="${submission.id}">
              <i class="fa-solid fa-file-pdf"></i>
              Ver relatório completo
            </button>
          ` : `
            <span class="badge badge--accent">Análise em processamento</span>
          `}
        </div>
      `;

      historyContainer.appendChild(card);
    });
  }

  /**
   * Renderiza relatório
   */
  renderReport(report) {
    return `
      <div class="report-summary">
        <p class="report-summary__text">
          ${report.resumo || report.feedback || 'Relatório disponível'}
        </p>
        ${report.recomendacoes ? `
          <div class="report-recommendations">
            <strong>Recomendações:</strong>
            <p>${report.recomendacoes}</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Renderiza estado de relatório pendente
   */
  renderPendingReport() {
    return `
      <div class="report-pending">
        <div class="spinner"></div>
        <p>Aguardando análise da IA...</p>
      </div>
    `;
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    document.addEventListener('click', (e) => {
      const viewBtn = e.target.closest('[data-view-report]');
      if (viewBtn) {
        const submissaoId = viewBtn.dataset.viewReport;
        this.viewDetailedReport(submissaoId);
      }
    });
  }

  /**
   * Exibe relatório detalhado
   */
  async viewDetailedReport(submissaoId) {
    try {
      const report = await FormService.getReport(submissaoId);
      
      // Cria modal ou página de visualização
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal__content">
          <div class="modal__header">
            <h2>Relatório Detalhado</h2>
            <button class="modal__close" type="button">&times;</button>
          </div>
          <div class="modal__body">
            ${this.formatDetailedReport(report)}
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      modal.querySelector('.modal__close').addEventListener('click', () => modal.remove());
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
      });
    } catch (error) {
      UIUtils.showError('Erro ao carregar relatório detalhado.');
    }
  }

  /**
   * Formata relatório detalhado
   */
  formatDetailedReport(report) {
    return `
      <div class="report-detail">
        <section class="report-section">
          <h3>Resumo</h3>
          <p>${report.resumo || 'Não disponível'}</p>
        </section>

        ${report.pontos_fortes ? `
          <section class="report-section">
            <h3>Pontos Fortes</h3>
            <ul>
              ${report.pontos_fortes.split(',').map(p => `<li>${p.trim()}</li>`).join('')}
            </ul>
          </section>
        ` : ''}

        ${report.pontos_atencao ? `
          <section class="report-section">
            <h3>Pontos de Atenção</h3>
            <ul>
              ${report.pontos_atencao.split(',').map(p => `<li>${p.trim()}</li>`).join('')}
            </ul>
          </section>
        ` : ''}

        ${report.recomendacoes ? `
          <section class="report-section">
            <h3>Recomendações</h3>
            <p>${report.recomendacoes}</p>
          </section>
        ` : ''}
      </div>
    `;
  }
}

// Inicializa quando o DOM está pronto
document.addEventListener('DOMContentLoaded', () => {
  new HistoricoPage();
});
