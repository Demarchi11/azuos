/**
 * Serviço de Dashboard
 * Gerencia operações relacionadas ao painel de controle
 */

class DashboardService {
  /**
   * Carrega dados do dashboard do usuário
   * @returns {Promise} Objeto com dados agregados
   */
  static async loadDashboardData() {
    const userId = APIService.getUserId();
    const user = APIService.getStoredUser();

    try {
      // Busca todas as submissões do usuário
      const submissions = await FormService.getUserSubmissions(userId);
      
      // Calcula métricas
      const totalSubmissions = submissions.length || 0;
      
      // Processa submissões para contar pendentes e completas
      let pendingAnalysis = 0;
      let completedAnalysis = 0;
      let latestScore = null;
      let allReports = [];

      // Busca relatórios para cada submissão
      for (const submission of submissions) {
        try {
          const report = await FormService.getReport(submission.id);
          if (report) {
            completedAnalysis++;
            allReports.push(report);
            // Pega a pontuação mais recente
            if (!latestScore || submission.id > allReports[allReports.length - 2]?.submissao_id) {
              latestScore = submission.pontuacao;
            }
          } else {
            pendingAnalysis++;
          }
        } catch (error) {
          pendingAnalysis++;
        }
      }

      // Busca usuários da equipe (se for líder)
      let teamCount = 0;
      if (user.lider) {
        try {
          const allUsers = await UserService.getAll();
          // Conta usuários do mesmo departamento
          teamCount = allUsers.filter(u => u.departamento_id === user.departamento_id && !u.lider).length;
        } catch (error) {
          console.warn('Erro ao buscar equipe:', error);
        }
      }

      return {
        user,
        submissions,
        totalSubmissions,
        pendingAnalysis,
        completedAnalysis,
        latestScore,
        teamCount,
        allReports
      };
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      throw error;
    }
  }

  /**
   * Busca dados para o ranking
   * @returns {Promise} Dados de ranking dos usuários
   */
  static async getRankingData() {
    try {
      const users = await UserService.getAll();
      const rankingData = [];

      for (const user of users) {
        try {
          const submissions = await FormService.getUserSubmissions(user.id);
          if (submissions.length > 0) {
            const avgScore = submissions.reduce((sum, sub) => sum + (sub.pontuacao || 0), 0) / submissions.length;
            rankingData.push({
              user,
              submissions: submissions.length,
              averageScore: Math.round(avgScore),
              lastSubmission: submissions[submissions.length - 1]
            });
          }
        } catch (error) {
          console.warn(`Erro ao buscar dados do usuário ${user.id}:`, error);
        }
      }

      // Ordena por pontuação decrescente
      return rankingData.sort((a, b) => b.averageScore - a.averageScore);
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
      throw error;
    }
  }

  /**
   * Busca histórico detalhado de submissões
   * @returns {Promise} Histórico com relatórios
   */
  static async getDetailedHistory() {
    const userId = APIService.getUserId();
    
    try {
      const submissions = await FormService.getUserSubmissions(userId);
      const history = [];

      for (const submission of submissions) {
        try {
          const report = await FormService.getReport(submission.id);
          history.push({
            submission,
            report
          });
        } catch (error) {
          history.push({
            submission,
            report: null
          });
        }
      }

      // Ordena por data decrescente
      return history.sort((a, b) => {
        const dateA = new Date(a.submission.data_submissao || 0);
        const dateB = new Date(b.submission.data_submissao || 0);
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      throw error;
    }
  }
}
