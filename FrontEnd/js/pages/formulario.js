/**
 * Script da página Formulário
 * Gerencia carregamento, navegação e submissão de formulários
 */

class FormularioPage {
  constructor() {
    this.checkAuth();
    this.currentFormIndex = 0;
    this.currentForm = null;
    this.allForms = [];
    this.answers = {};
    
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
      // Carrega rascunho se houver
      const draft = FormService.loadDraft();
      if (draft) {
        this.answers = draft.answers || {};
      }

      // Carrega formulários
      await this.loadForms();

      if (this.allForms.length === 0) {
        this.showNoFormsMessage();
        return;
      }

      // Seleciona primeiro formulário
      this.currentFormIndex = 0;
      const firstFormId = this.allForms[0].id || this.allForms[0].formulario_id;
      await this.loadForm(firstFormId);

      // Configura listeners
      this.setupEventListeners();
    } catch (error) {
      console.error('Erro ao inicializar formulário:', error);
      UIUtils.showError(error.message, 'loginError');
    }
  }

  /**
   * Carrega lista de formulários disponíveis
   */
  async loadForms() {
    try {
      const user = APIService.getStoredUser();
      const roleId = APIService.getRoleId();

      // Se o usuário tem role_id, busca formulário específico
      if (roleId) {
        try {
          const formsByRole = await FormService.getByRole(roleId);
          this.allForms = Array.isArray(formsByRole) ? formsByRole : [formsByRole];
          return;
        } catch (error) {
          console.warn('Formulário por cargo não encontrado:', error);
        }
      }

      // Caso contrário, lista todos
      this.allForms = await FormService.getAll();
    } catch (error) {
      console.error('Erro ao carregar formulários:', error);
      this.allForms = [];
    }
  }

  /**
   * Carrega um formulário específico
   */
  async loadForm(formId) {
    try {
      this.currentForm = await FormService.getById(formId);
      this.renderForm();
      this.updateProgress();
      this.renderFormTabs();
      this.renderQuestionMap();
    } catch (error) {
      console.error('Erro ao carregar formulário:', error);
      UIUtils.showError('Erro ao carregar o formulário.');
    }
  }

  /**
   * Renderiza abas de formulários
   */
  renderFormTabs() {
    const formTabs = document.getElementById('formTabs');
    if (!formTabs) return;

    formTabs.innerHTML = '';

    this.allForms.forEach((form, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'form-tab' + (index === this.currentFormIndex ? ' form-tab--active' : '');
      button.textContent = form.titulo || `Formulário ${index + 1}`;
      button.dataset.formIndex = index;
      button.addEventListener('click', () => this.switchForm(index));

      formTabs.appendChild(button);
    });
  }

  /**
   * Muda entre formulários
   */
  async switchForm(index) {
    if (index !== this.currentFormIndex) {
      this.currentFormIndex = index;
      const targetFormId = this.allForms[index].id || this.allForms[index].formulario_id;
      await this.loadForm(targetFormId);
    }
  }

  /**
   * Renderiza mapa de perguntas (sidebar)
   */
  renderQuestionMap() {
    const questionMap = document.getElementById('questionMap');
    if (!questionMap || !this.currentForm) return;

    questionMap.innerHTML = '';

    this.currentForm.perguntas?.forEach((question, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'question-btn';
      button.textContent = `${index + 1}`;
      
      const questionId = question.id || question.pergunta_id;
      // Marca como respondida se houver resposta
      if (this.answers[questionId]) {
        button.classList.add('question-btn--answered');
      }

      button.addEventListener('click', () => this.goToQuestion(index));
      questionMap.appendChild(button);
    });
  }

  /**
   * Renderiza pergunta atual
   */
  renderForm() {
    if (!this.currentForm || !this.currentForm.perguntas || this.currentForm.perguntas.length === 0) {
      UIUtils.showError('Formulário sem perguntas.');
      return;
    }

    const questions = this.currentForm.perguntas;
    const currentQuestion = questions[this.currentFormIndex];

    // Atualiza cabeçalho
    document.getElementById('sectionLabel').textContent = this.currentForm.titulo;
    document.getElementById('questionTitle').textContent = currentQuestion.pergunta || 'Pergunta sem título';
    document.getElementById('questionContext').textContent = currentQuestion.contexto || '';
    document.getElementById('currentQuestion').textContent = this.currentFormIndex + 1;
    document.getElementById('currentTotal').textContent = questions.length;

    // Renderiza campo de resposta
    const answersList = document.getElementById('answersList');
    answersList.innerHTML = '';

    const questionId = currentQuestion.id || currentQuestion.pergunta_id;
    const textarea = document.createElement('textarea');
    textarea.id = `answer-${questionId}`;
    textarea.className = 'question-textarea';
    textarea.placeholder = 'Digite sua resposta aqui...';
    textarea.value = this.answers[questionId] || '';
    textarea.addEventListener('input', (e) => this.saveAnswer(questionId, e.target.value));

    answersList.appendChild(textarea);

    // Habilita/desabilita botões de navegação
    document.getElementById('previousQuestion').disabled = this.currentFormIndex === 0;

    const nextBtn = document.getElementById('nextQuestion');
    if (nextBtn) {
      nextBtn.disabled = this.currentFormIndex >= questions.length - 1;
    }
  }

  /**
   * Vai para uma pergunta específica
   */
  goToQuestion(index) {
    if (index >= 0 && index < this.currentForm.perguntas.length) {
      this.currentFormIndex = index;
      this.renderForm();
      this.updateProgress();
    }
  }

  /**
   * Salva resposta
   */
  saveAnswer(questionId, answer) {
    this.answers[questionId] = answer;
    
    // Salva rascunho
    const formId = this.currentForm.id || this.currentForm.formulario_id;
    FormService.saveDraft(formId, this.answers);

    // Atualiza mapa de perguntas
    this.renderQuestionMap();

    // Atualiza progresso
    this.updateProgress();
  }

  /**
   * Limpa resposta atual
   */
  clearCurrentAnswer() {
    const questions = this.currentForm.perguntas;
    const currentQuestion = questions[this.currentFormIndex];
    
    const questionId = currentQuestion.id || currentQuestion.pergunta_id;
    if (confirm('Tem certeza que deseja limpar esta resposta?')) {
      this.answers[questionId] = '';
      const textarea = document.getElementById(`answer-${questionId}`);
      if (textarea) textarea.value = '';
      
      this.renderQuestionMap();
      this.updateProgress();
      const formId = this.currentForm.id || this.currentForm.formulario_id;
      FormService.saveDraft(formId, this.answers);
    }
  }

  /**
   * Atualiza barra de progresso
   */
  updateProgress() {
    const totalQuestions = this.currentForm.perguntas?.length || 0;
    const answeredQuestions = Object.keys(this.answers).filter(
      id => this.answers[id] && this.answers[id].trim() !== ''
    ).length;

    const percentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

    // Atualiza label de progresso
    const progressLabel = document.getElementById('progressLabel');
    if (progressLabel) {
      progressLabel.textContent = `${percentage}%`;
    }

    // Atualiza barra de progresso
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }

    // Atualiza contadores
    document.getElementById('totalQuestions').textContent = totalQuestions;
    document.getElementById('answeredQuestions').textContent = answeredQuestions;
    document.getElementById('pendingQuestions').textContent = totalQuestions - answeredQuestions;
  }

  /**
   * Submete o formulário
   */
  async submitForm() {
    const questions = this.currentForm.perguntas;
    const unanswered = questions.filter(q => {
      const qId = q.id || q.pergunta_id;
      return !this.answers[qId] || this.answers[qId].trim() === '';
    });

    if (unanswered.length > 0) {
      const confirm_submit = confirm(
        `Há ${unanswered.length} pergunta(s) sem resposta. Deseja enviar mesmo assim?`
      );

      if (!confirm_submit) return;
    }

    try {
      UIUtils.setButtonLoading('submitButton', true);

      // Formata respostas
      const respostas = questions.map(q => {
        const qId = q.id || q.pergunta_id;
        return {
          pergunta_id: qId,
          resposta: this.answers[qId] || ''
        };
      });

      const userId = APIService.getUserId();
      const formId = this.currentForm.id || this.currentForm.formulario_id;
      const result = await FormService.submitForm(userId, formId, respostas);

      // Limpa rascunho
      FormService.clearDraft();

      UIUtils.showSuccess('Formulário enviado com sucesso!');
      UIUtils.redirect('historico.html', 1500);
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      UIUtils.showError(error.message);
    } finally {
      UIUtils.setButtonLoading('submitButton', false);
    }
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    const nextBtn = document.getElementById('nextQuestion');
    const prevBtn = document.getElementById('previousQuestion');
    const clearBtn = document.getElementById('clearCurrent');
    const submitBtn = document.getElementById('submitButton');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.goToQuestion(this.currentFormIndex + 1));
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.goToQuestion(this.currentFormIndex - 1));
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearCurrentAnswer());
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitForm());
    }
  }

  /**
   * Mostra mensagem quando não há formulários
   */
  showNoFormsMessage() {
    const formularioApp = document.getElementById('formularioApp');
    if (formularioApp) {
      formularioApp.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-inbox"></i>
          <h3>Nenhum formulário disponível</h3>
          <p>Aguarde enquanto novos formulários são configurados.</p>
        </div>
      `;
    }
  }
}

// Inicializa quando o DOM está pronto
document.addEventListener('DOMContentLoaded', () => {
  new FormularioPage();
});
