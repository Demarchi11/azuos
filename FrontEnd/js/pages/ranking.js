/**
 * Script da página Ranking
 * Exibe ranking de usuários por desempenho
 */

class RankingPage {
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
      const rankingData = await DashboardService.getRankingData();
      this.renderRanking(rankingData);
      this.setupEventListeners();
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
      UIUtils.showError('Erro ao carregar ranking de usuários.');
    }
  }

  /**
   * Renderiza tabela de ranking
   */
  renderRanking(rankingData) {
    const rankingContainer = document.getElementById('rankingContainer') || 
                            document.querySelector('[data-ranking-list]') ||
                            document.querySelector('.ranking-list');

    if (!rankingContainer) {
      console.warn('Container de ranking não encontrado');
      return;
    }

    if (rankingData.length === 0) {
      rankingContainer.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-chart-line"></i>
          <h3>Sem dados de ranking</h3>
          <p>Complete formulários para aparecer no ranking.</p>
        </div>
      `;
      return;
    }

    // Cria tabela
    let html = `
      <table class="ranking-table">
        <thead>
          <tr>
            <th>Posição</th>
            <th>Usuário</th>
            <th>Departamento</th>
            <th>Pontuação Média</th>
            <th>Submissões</th>
            <th>Última Avaliação</th>
          </tr>
        </thead>
        <tbody>
    `;

    rankingData.forEach((item, index) => {
      const user = item.user;
      const medals = ['🥇', '🥈', '🥉'];
      const medal = medals[index] || '•';

      html += `
        <tr class="ranking-row ${index < 3 ? 'ranking-row--top' : ''}">
          <td class="ranking-position">
            <span class="medal">${medal}</span>
            <span class="position">#${index + 1}</span>
          </td>
          <td class="ranking-user">
            <strong>${user.nome}</strong>
            ${user.lider ? '<span class="badge badge--accent">Líder</span>' : ''}
          </td>
          <td>${user.departamento_id ? `Dept. ${user.departamento_id}` : '--'}</td>
          <td class="ranking-score">
            <div class="score-display ${UIUtils.getScoreClass(item.averageScore)}">
              ${item.averageScore}
            </div>
          </td>
          <td class="ranking-submissions">${item.submissions}</td>
          <td class="ranking-date">
            ${item.lastSubmission?.data_submissao 
              ? UIUtils.formatDate(item.lastSubmission.data_submissao) 
              : '--'}
          </td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    rankingContainer.innerHTML = html;
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Pode adicionar filtros, ordenação, etc.
  }
}

// Inicializa quando o DOM está pronto
document.addEventListener('DOMContentLoaded', () => {
  new RankingPage();
});
