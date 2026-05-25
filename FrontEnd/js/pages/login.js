/**
 * Script da página de Login
 * Gerencia login de usuários e bootstrap do primeiro usuário
 */

class LoginPage {
  constructor() {
    this.bootstrapForm = document.getElementById('bootstrapForm');
    this.loginForm = document.getElementById('loginForm');
    this.bootstrapInfo = document.getElementById('bootstrapInfo');
    this.loginError = document.getElementById('loginError');
    this.loginErrorText = document.getElementById('loginErrorText');
    
    this.init();
  }

  async init() {
    // Redireciona se já está autenticado
    if (AuthService.isLoggedIn()) {
      window.location.href = 'dashboard.html';
      return;
    }

    // Verifica se precisa fazer bootstrap (primeiro usuário)
    await this.checkBootstrapState();

    // Configura listeners
    this.setupEventListeners();
  }

  /**
   * Verifica se é necessário fazer bootstrap
   */
  async checkBootstrapState() {
    try {
      // Tenta buscar usuários para ver se há algum cadastrado
      const response = await fetch(`${APP_CONFIG.API_BASE_URL}${APP_CONFIG.ENDPOINTS.USERS}`);
      
      // Se retorna 200 e há usuários, mostra login normal
      if (response.ok) {
        const users = await response.json();
        if (users.length > 0) {
          this.showLoginForm();
          return;
        }
      }
      
      // Se não há usuários, mostra bootstrap
      this.showBootstrapForm();
    } catch (error) {
      // Em caso de erro, mostra login normal
      this.showLoginForm();
    }
  }

  /**
   * Mostra formulário de bootstrap
   */
  showBootstrapForm() {
    this.bootstrapInfo.classList.remove('hidden');
    this.bootstrapForm.classList.remove('hidden');
    this.loginForm.classList.add('hidden');
    
    document.getElementById('loginModeLabel').textContent = 'Primeiros passos';
    document.getElementById('loginTitle').textContent = 'Crie sua liderança';
    document.getElementById('loginDescription').textContent =
      'Você será o primeiro usuário. Preencha os dados para iniciar a plataforma.';
  }

  /**
   * Mostra formulário de login
   */
  showLoginForm() {
    this.bootstrapInfo.classList.add('hidden');
    this.bootstrapForm.classList.add('hidden');
    this.loginForm.classList.remove('hidden');
    
    document.getElementById('loginModeLabel').textContent = 'Acesso';
    document.getElementById('loginTitle').textContent = 'Entrar na conta';
    document.getElementById('loginDescription').textContent =
      'Informe suas credenciais para acessar a plataforma.';
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Bootstrap form
    if (this.bootstrapForm) {
      this.bootstrapForm.addEventListener('submit', (e) => this.handleBootstrapSubmit(e));
    }

    // Login form
    if (this.loginForm) {
      this.loginForm.addEventListener('submit', (e) => this.handleLoginSubmit(e));
    }

    // Toggle de visibilidade de senha
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
      togglePassword.addEventListener('click', (e) => this.togglePasswordVisibility(e));
    }
  }

  /**
   * Trata submissão do bootstrap
   */
  async handleBootstrapSubmit(e) {
    e.preventDefault();
    this.hideError();

    const name = document.getElementById('bootstrapName').value.trim();
    const email = document.getElementById('bootstrapUsername').value.trim();
    const department = document.getElementById('bootstrapDepartment').value.trim();
    const position = document.getElementById('bootstrapPosition').value.trim();
    const password = document.getElementById('bootstrapPassword').value;

    // Validações básicas
    if (!name || !email || !password) {
      this.showError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!UIUtils.isValidEmail(email)) {
      this.showError('E-mail inválido.');
      return;
    }

    if (!UIUtils.isValidPassword(password)) {
      this.showError('Senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      UIUtils.setButtonLoading('bootstrapButton', true);

      // Cria cargo se necessário
      let roleId = 1;
      if (position) {
        try {
          const role = await UserService.createRole({ nome: position });
          roleId = role.id || 1;
        } catch (error) {
          console.warn('Erro ao criar cargo, usando padrão:', error);
        }
      }

      // Cria departamento se necessário
      let deptId = null;
      if (department) {
        try {
          const dept = await UserService.createDepartment({ nome: department });
          deptId = dept.id;
        } catch (error) {
          console.warn('Erro ao criar departamento:', error);
        }
      }

      // Cria usuário
      const userData = {
        nome: name,
        email: email,
        cpf: '00000000000', // CPF temporário para bootstrap
        senha: password,
        role_id: roleId,
        departamento_id: deptId,
        lider: true // Primeiro usuário é líder
      };

      const result = await AuthService.register(userData);

      if (result && result.id) {
        // Se o backend retorna token após registro
        if (result.token) {
          APIService.setAuth(result.token, result);
        }

        UIUtils.redirect('dashboard.html', 1500);
      } else {
        this.showError('Erro ao criar liderança. Tente novamente.');
      }
    } catch (error) {
      this.showError(error.message);
    } finally {
      UIUtils.setButtonLoading('bootstrapButton', false);
    }
  }

  /**
   * Trata submissão de login
   */
  async handleLoginSubmit(e) {
    e.preventDefault();
    this.hideError();

    const email = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      this.showError('E-mail e senha são obrigatórios.');
      return;
    }

    try {
      UIUtils.setButtonLoading('loginButton', true);

      const result = await AuthService.login(email, password);

      if (result && result.token) {
        UIUtils.redirect('dashboard.html', 1000);
      } else if (result && result.usuario) {
        APIService.setAuth('session_token', result.usuario);
        UIUtils.redirect('dashboard.html', 1000);
      } else if (result && (result.id || result.usuario_id)) {
        // Alguns endpoints retornam o usuário sem token
        APIService.setAuth('session_token', result);
        UIUtils.redirect('dashboard.html', 1000);
      } else {
        this.showError('Erro ao fazer login. Verifique as credenciais.');
      }
    } catch (error) {
      this.showError(error.message);
    } finally {
      UIUtils.setButtonLoading('loginButton', false);
    }
  }

  /**
   * Togla visibilidade de senha
   */
  togglePasswordVisibility(e) {
    e.preventDefault();
    const passwordInput = document.getElementById('password');
    const icon = document.getElementById('passwordToggleIcon');

    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  }

  /**
   * Exibe erro
   */
  showError(message) {
    this.loginErrorText.textContent = message;
    this.loginError.classList.remove('hidden');
  }

  /**
   * Oculta erro
   */
  hideError() {
    this.loginError.classList.add('hidden');
  }
}

// Inicializa quando o DOM está pronto
document.addEventListener('DOMContentLoaded', () => {
  new LoginPage();
});
