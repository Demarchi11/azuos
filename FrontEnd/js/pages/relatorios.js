/**
 * Script da página Relatórios
 * Exibe relatórios consolidados e análises
 */

class RelatoriosPage {
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
      const user = APIService.getStoredUser();

      // Se for líder, mostra relatórios consolidados da equipe
      if (user.lider) {
        await this.loadTeamReports();
      } else {
        await this.loadPersonalReports();
      }

      this.setupEventListeners();
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      UIUtils.showError('Erro ao carregar relatórios.');
    }
  }

  /**
   * Carrega relatórios pessoais
   */
  async loadPersonalReports() {
    try {
      const history = await DashboardService.getDetailedHistory();
      this.renderPersonalReports(history);
    } catch (error) {
      console.error('Erro ao carregar relatórios pessoais:', error);
      UIUtils.showError('Erro ao carregar relatórios.');
    }
  }

  /**
   * Carrega relatórios da equipe
   */
  async loadTeamReports() {
    try {
      const user = APIService.getStoredUser();
      const allUsers = await UserService.getAll();

      // Filtra membros do departamento
      const teamMembers = allUsers.filter(
        u => u.departamento_id === user.departamento_id && !u.lider
      );

      const teamReports = [];
      for (const member of teamMembers) {
        try {
          const submissions = await FormService.getUserSubmissions(member.id);
          if (submissions.length > 0) {
            const lastSubmission = submissions[submissions.length - 1];
            try {
              const report = await FormService.getReport(lastSubmission.id);
              teamReports.push({
                member,
                submission: lastSubmission,
                report
              });
            } catch (e) {
              teamReports.push({
                member,
                submission: lastSubmission,
                report: null
              });
            }
          }
        } catch (error) {
          console.warn(`Erro ao buscar relatórios de ${member.nome}:`, error);
        }
      }

      this.renderTeamReports(teamReports);
    } catch (error) {
      console.error('Erro ao carregar relatórios da equipe:', error);
      UIUtils.showError('Erro ao carregar relatórios da equipe.');
    }
  }

  /**
   * Renderiza relatórios pessoais
   */
  renderPersonalReports(history) {
    const container = document.getElementById('reportsContainer') || 
                     document.querySelector('[data-reports-list]') ||
                     document.querySelector('.reports-list');

    if (!container) {
      console.warn('Container de relatórios não encontrado');
      return;
    }

    if (history.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-file-lines"></i>
          <h3>Sem relatórios</h3>
          <p>Complete um formulário para gerar seus relatórios.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';

    history.forEach((item, index) => {
      const { submission, report } = item;

      if (report) {
        const card = document.createElement('article');
        card.className = 'panel report-card';
        card.innerHTML = `
          <div class="report-card__header">
            <h3 class="report-card__title">
              Relatório #${history.length - index}
            </h3>
            <span class="badge ${UIUtils.getScoreClass(submission.pontuacao)}">
              ${submission.pontuacao}%
            </span>
          </div>

          <div class="report-card__content">
            <div class="report-section">
              <strong>Data:</strong>
              <p>${UIUtils.formatDate(submission.data_submissao)}</p>
            </div>

            ${report.resumo ? `
              <div class="report-section">
                <strong>Resumo:</strong>
                <p>${report.resumo}</p>
              </div>
            ` : ''}

            ${report.pontos_fortes ? `
              <div class="report-section">
                <strong>Pontos Fortes:</strong>
                <ul>
                  ${report.pontos_fortes.split(',').map(p => `<li>${p.trim()}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>

          <button class="btn btn-secondary btn--sm" data-expand-report="${submission.id}">
            <i class="fa-solid fa-expand"></i>
            Ver completo
          </button>
        `;

        container.appendChild(card);
      }
    });
  }

  /**
   * Renderiza relatórios da equipe
   */
  renderTeamReports(teamReports) {
    const container = document.getElementById('reportsContainer') || 
                     document.querySelector('[data-reports-list]') ||
                     document.querySelector('.reports-list');

    if (!container) {
      console.warn('Container de relatórios não encontrado');
      return;
    }

    if (teamReports.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-chart-line"></i>
          <h3>Sem relatórios da equipe</h3>
          <p>Aguarde enquanto sua equipe completa os formulários.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';

    teamReports.forEach((item) => {
      const { member, submission, report } = item;

      const card = document.createElement('article');
      card.className = 'panel team-report-card';
      card.innerHTML = `
        <div class="team-report-card__header">
          <div>
            <h3 class="team-report-card__member">${member.nome}</h3>
            <p class="team-report-card__date">
              ${UIUtils.formatDate(submission.data_submissao)}
            </p>
          </div>
          <div class="score-badge ${UIUtils.getScoreClass(submission.pontuacao)}">
            ${submission.pontuacao}%
          </div>
        </div>

        ${report ? `
          <div class="team-report-card__content">
            ${report.resumo ? `<p>${report.resumo}</p>` : ''}
          </div>

          <button class="btn btn-secondary btn--sm" data-view-team-report="${member.id}">
            Ver relatório completo
          </button>
        ` : `
          <div class="team-report-card__pending">
            <i class="fa-solid fa-hourglass-half"></i>
            <p>Relatório em processamento...</p>
          </div>
        `}
      `;

      container.appendChild(card);
    });
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-expand-report]')) {
        const submissaoId = e.target.dataset.expandReport;
        this.expandReport(submissaoId);
      }

      if (e.target.matches('[data-view-team-report]')) {
        const memberId = e.target.dataset.viewTeamReport;
        this.viewTeamReport(memberId);
      }
    });
  }

  /**
   * Expande relatório pessoal
   */
  async expandReport(submissaoId) {
    try {
      const report = await FormService.getReport(submissaoId);
      this.showReportModal(report);
    } catch (error) {
      UIUtils.showError('Erro ao carregar relatório completo.');
    }
  }

  /**
   * Visualiza relatório da equipe
   */
  async viewTeamReport(memberId) {
    try {
      const submissions = await FormService.getUserSubmissions(memberId);
      if (submissions.length > 0) {
        const lastSubmission = submissions[submissions.length - 1];
        const report = await FormService.getReport(lastSubmission.id);
        this.showReportModal(report);
      }
    } catch (error) {
      UIUtils.showError('Erro ao carregar relatório.');
    }
  }

  /**
   * Exibe modal com relatório completo
   */
  showReportModal(report) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal__content modal__content--large">
        <div class="modal__header">
          <h2>Relatório Completo</h2>
          <button class="modal__close" type="button">&times;</button>
        </div>
        <div class="modal__body">
          <div class="report-full">
            ${report.resumo ? `
              <section class="report-section">
                <h3>Resumo Executivo</h3>
                <p>${report.resumo}</p>
              </section>
            ` : ''}

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
                <h3>Recomendações Personalizadas</h3>
                <p>${report.recomendacoes}</p>
              </section>
            ` : ''}

            ${report.trilha_recomendada ? `
              <section class="report-section">
                <h3>Trilha de Capacitação Recomendada</h3>
                <p>${report.trilha_recomendada}</p>
              </section>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('.modal__close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }
}

// Inicializa quando o DOM está pronto
document.addEventListener('DOMContentLoaded', () => {
  new RelatoriosPage();
});
