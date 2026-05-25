/**
 * Serviço de usuários
 * Gerencia operações relacionadas a usuários
 */

class UserService {
  /**
   * Lista todos os usuários
   * @returns {Promise} Lista de usuários
   */
  static async getAll() {
    return APIService.get(APP_CONFIG.ENDPOINTS.USERS);
  }

  /**
   * Obtém um usuário por ID
   * @param {number} userId - ID do usuário
   * @returns {Promise} Dados do usuário
   */
  static async getById(userId) {
    return APIService.get(APP_CONFIG.ENDPOINTS.USER_BY_ID(userId));
  }

  /**
   * Cria um novo usuário
   * @param {object} userData - Dados do usuário
   * @returns {Promise} Dados do usuário criado
   */
  static async create(userData) {
    return APIService.post(APP_CONFIG.ENDPOINTS.REGISTER, userData);
  }

  /**
   * Atualiza um usuário
   * @param {number} userId - ID do usuário
   * @param {object} userData - Dados atualizados
   * @returns {Promise} Dados do usuário atualizado
   */
  static async update(userId, userData) {
    return APIService.put(APP_CONFIG.ENDPOINTS.USER_BY_ID(userId), userData);
  }

  /**
   * Deleta um usuário
   * @param {number} userId - ID do usuário
   * @returns {Promise} Confirmação de deleção
   */
  static async delete(userId) {
    return APIService.delete(APP_CONFIG.ENDPOINTS.USER_BY_ID(userId));
  }

  /**
   * Lista todos os cargos
   * @returns {Promise} Lista de cargos
   */
  static async getRoles() {
    return APIService.get(APP_CONFIG.ENDPOINTS.ROLES, false);
  }

  /**
   * Lista todos os departamentos
   * @returns {Promise} Lista de departamentos
   */
  static async getDepartments() {
    return APIService.get(APP_CONFIG.ENDPOINTS.DEPARTMENTS, false);
  }

  /**
   * Cria um novo cargo
   * @param {object} roleData - Dados do cargo
   * @returns {Promise} Dados do cargo criado
   */
  static async createRole(roleData) {
    return APIService.post(APP_CONFIG.ENDPOINTS.ROLES, roleData);
  }

  /**
   * Cria um novo departamento
   * @param {object} deptData - Dados do departamento
   * @returns {Promise} Dados do departamento criado
   */
  static async createDepartment(deptData) {
    return APIService.post(APP_CONFIG.ENDPOINTS.DEPARTMENTS, deptData);
  }
}
