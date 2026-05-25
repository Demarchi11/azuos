/**
 * Utilitários de UI
 * Funções para feedback visual ao usuário (loading, erros, sucessos)
 */

class UIUtils {
  /**
   * Exibe um erro para o usuário
   * @param {string} message - Mensagem de erro
   * @param {string} elementId - ID do elemento onde exibir (opcional)
   */
  static showError(message, elementId = null) {
    console.error('Erro:', message);
    
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.textContent = message;
        element.classList.remove('hidden');
      }
    } else {
      alert(`Erro: ${message}`);
    }
  }

  /**
   * Exibe mensagem de sucesso
   * @param {string} message - Mensagem de sucesso
   * @param {string} elementId - ID do elemento onde exibir (opcional)
   */
  static showSuccess(message, elementId = null) {
    console.log('Sucesso:', message);
    
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.textContent = message;
        element.classList.remove('hidden');
        setTimeout(() => {
          element.classList.add('hidden');
        }, 3000);
      }
    } else {
      alert(`Sucesso: ${message}`);
    }
  }

  /**
   * Habilita/desabilita um botão e mostra spinner
   * @param {string} buttonId - ID do botão
   * @param {boolean} isLoading - Se está carregando
   */
  static setButtonLoading(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    button.disabled = isLoading;
    
    const spinner = button.querySelector('.spinner');
    if (spinner) {
      spinner.style.display = isLoading ? 'inline-block' : 'none';
    }
  }

  /**
   * Formata data para exibição
   * @param {string} dateString - String de data ISO
   * @returns {string} Data formatada
   */
  static formatDate(dateString) {
    if (!dateString) return '--';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Valida e-mail
   * @param {string} email - E-mail a validar
   * @returns {boolean} Email válido
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida CPF (básico)
   * @param {string} cpf - CPF a validar
   * @returns {boolean} CPF válido
   */
  static isValidCPF(cpf) {
    // Remove caracteres especiais
    const cleanCPF = cpf.replace(/\D/g, '');
    return cleanCPF.length === 11 && cleanCPF !== cleanCPF[0].repeat(11);
  }

  /**
   * Valida senha
   * @param {string} password - Senha a validar
   * @returns {boolean} Senha válida (mín. 6 caracteres)
   */
  static isValidPassword(password) {
    return password.length >= 6;
  }

  /**
   * Cria classe CSS baseada em valor de score
   * @param {number} score - Pontuação (0-100)
   * @returns {string} Classe CSS
   */
  static getScoreClass(score) {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-fair';
    return 'score-poor';
  }

  /**
   * Formata número como porcentagem
   * @param {number} value - Valor
   * @param {number} total - Total
   * @returns {number} Porcentagem
   */
  static calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  /**
   * Limpa campos de um formulário
   * @param {string} formId - ID do formulário
   */
  static clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
      form.reset();
    }
  }

  /**
   * Obtém valores de um formulário como objeto
   * @param {string} formId - ID do formulário
   * @returns {object} Dados do formulário
   */
  static getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return {};

    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }

    return data;
  }

  /**
   * Mostra/oculta elemento
   * @param {string} elementId - ID do elemento
   * @param {boolean} show - Se deve mostrar
   */
  static toggleElement(elementId, show) {
    const element = document.getElementById(elementId);
    if (element) {
      if (show) {
        element.classList.remove('hidden');
      } else {
        element.classList.add('hidden');
      }
    }
  }

  /**
   * Redireciona com delay
   * @param {string} url - URL de destino
   * @param {number} delay - Delay em ms
   */
  static redirect(url, delay = 0) {
    if (delay > 0) {
      setTimeout(() => {
        window.location.href = url;
      }, delay);
    } else {
      window.location.href = url;
    }
  }
}
