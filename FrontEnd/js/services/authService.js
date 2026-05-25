/**
 * Serviço de autenticação
 * Gerencia login, registro e autenticação de usuários
 */

class AuthService {
  /**
   * Faz login do usuário
   * @param {string} email - Email do usuário
   * @param {string} senha - Senha do usuário
   * @returns {Promise} Dados do usuário autenticado
   */
  static async login(email, senha) {
    const payload = { email, senha };
    
    const response = await APIService.post(
      APP_CONFIG.ENDPOINTS.LOGIN,
      payload,
      false // Não requer autenticação
    );

    // Armazena o token e dados do usuário
    if (response.token) {
      APIService.setAuth(response.token, response.user || response);
    }

    return response;
  }

  /**
   * Registra um novo usuário
   * @param {object} userData - Dados do usuário
   * @returns {Promise} Dados do usuário criado
   */
  static async register(userData) {
    // Bootstrap - primeiro usuário (não requer token)
    const response = await APIService.post(
      APP_CONFIG.ENDPOINTS.REGISTER,
      userData,
      false // Não requer autenticação para o primeiro registro
    );

    return response;
  }

  /**
   * Registra um novo usuário (com autenticação - para membros da equipe)
   * @param {object} userData - Dados do usuário
   * @returns {Promise} Dados do usuário criado
   */
  static async registerWithAuth(userData) {
    const response = await APIService.post(
      APP_CONFIG.ENDPOINTS.REGISTER,
      userData,
      true // Requer autenticação
    );

    return response;
  }

  /**
   * Faz logout
   */
  static logout() {
    APIService.clearAuth();
    window.location.href = 'login.html';
  }

  /**
   * Verifica se há usuário autenticado
   */
  static isLoggedIn() {
    return APIService.isAuthenticated();
  }

  /**
   * Obtém usuário autenticado
   */
  static getCurrentUser() {
    return APIService.getStoredUser();
  }
}
