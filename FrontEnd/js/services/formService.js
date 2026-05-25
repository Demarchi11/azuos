/**
 * Serviço de formulários
 * Gerencia operações relacionadas a formulários, perguntas e submissões
 */

class FormService {
  /**
   * Lista todos os formulários
   * @returns {Promise} Lista de formulários
   */
  static async getAll() {
    return APIService.get(APP_CONFIG.ENDPOINTS.FORMS);
  }

  /**
   * Obtém um formulário completo com suas perguntas
   * @param {number} formId - ID do formulário
   * @returns {Promise} Dados do formulário com perguntas
   */
  static async getById(formId) {
    return APIService.get(APP_CONFIG.ENDPOINTS.FORM_BY_ID(formId));
  }

  /**
   * Obtém formulário pelo cargo do usuário
   * @param {number} roleId - ID do cargo
   * @returns {Promise} Dados do formulário
   */
  static async getByRole(roleId) {
    return APIService.get(APP_CONFIG.ENDPOINTS.FORM_BY_ROLE(roleId));
  }

  /**
   * Cria um novo formulário
   * @param {object} formData - Dados do formulário { titulo, role_id }
   * @returns {Promise} Dados do formulário criado
   */
  static async create(formData) {
    return APIService.post(APP_CONFIG.ENDPOINTS.FORMS, formData);
  }

  /**
   * Atualiza um formulário
   * @param {number} formId - ID do formulário
   * @param {object} formData - Dados atualizados
   * @returns {Promise} Dados do formulário atualizado
   */
  static async update(formId, formData) {
    return APIService.put(APP_CONFIG.ENDPOINTS.FORM_BY_ID(formId), formData);
  }

  /**
   * Deleta um formulário
   * @param {number} formId - ID do formulário
   * @returns {Promise} Confirmação de deleção
   */
  static async delete(formId) {
    return APIService.delete(APP_CONFIG.ENDPOINTS.FORM_BY_ID(formId));
  }

  /**
   * Cria uma pergunta para um formulário
   * @param {object} questionData - Dados da pergunta { pergunta, formulario_id, pontuacao }
   * @returns {Promise} Dados da pergunta criada
   */
  static async createQuestion(questionData) {
    return APIService.post(APP_CONFIG.ENDPOINTS.QUESTIONS, questionData);
  }

  /**
   * Envia uma submissão de formulário com as respostas
   * @param {number} usuarioId - ID do usuário
   * @param {number} formularioId - ID do formulário
   * @param {Array} respostas - Array de respostas { pergunta_id, resposta }
   * @returns {Promise} Dados da submissão com resultado
   */
  static async submitForm(usuarioId, formularioId, respostas) {
    const payload = {
      usuario_id: usuarioId,
      formulario_id: formularioId,
      respostas: respostas
    };

    return APIService.post(APP_CONFIG.ENDPOINTS.SUBMISSIONS, payload);
  }

  /**
   * Obtém histórico de submissões do usuário
   * @param {number} usuarioId - ID do usuário
   * @returns {Promise} Lista de submissões
   */
  static async getUserSubmissions(usuarioId) {
    return APIService.get(APP_CONFIG.ENDPOINTS.USER_SUBMISSIONS(usuarioId));
  }

  /**
   * Obtém relatório de uma submissão
   * @param {number} submissaoId - ID da submissão
   * @returns {Promise} Dados do relatório
   */
  static async getReport(submissaoId) {
    return APIService.get(APP_CONFIG.ENDPOINTS.REPORT_BY_SUBMISSION(submissaoId));
  }

  /**
   * Salva rascunho do formulário localmente
   * @param {number} formId - ID do formulário
   * @param {Array} answers - Respostas do usuário
   */
  static saveDraft(formId, answers) {
    const draft = {
      formId,
      answers,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.FORM_DRAFT, JSON.stringify(draft));
  }

  /**
   * Carrega rascunho do formulário
   * @returns {object} Dados do rascunho ou null
   */
  static loadDraft() {
    const draft = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.FORM_DRAFT);
    return draft ? JSON.parse(draft) : null;
  }

  /**
   * Limpa rascunho do formulário
   */
  static clearDraft() {
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.FORM_DRAFT);
  }
}
