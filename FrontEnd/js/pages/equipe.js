/**
 * Script da página Equipe
 * Gerencia cadastro e visualização de membros da equipe
 */

class EquipePage {
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

      // Verifica se é líder
      if (!user.lider) {
        this.showNotLeaderMessage();
        return;
      }

      await this.loadTeamMembers();
      this.setupEventListeners();
    } catch (error) {
      console.error('Erro ao carregar equipe:', error);
      UIUtils.showError('Erro ao carregar equipe.');
    }
  }

  /**
   * Carrega membros da equipe
   */
  async loadTeamMembers() {
    try {
      const user = APIService.getStoredUser();
      const allUsers = await UserService.getAll();

      // Filtra apenas membros do mesmo departamento que não são líderes
      const teamMembers = allUsers.filter(
        u => u.departamento_id === user.departamento_id && !u.lider
      );

      this.renderTeamMembers(teamMembers);
    } catch (error) {
      console.error('Erro ao buscar membros:', error);
      UIUtils.showError('Erro ao carregar membros da equipe.');
    }
  }

  /**
   * Renderiza lista de membros
   */
  renderTeamMembers(members) {
    const membersList = document.getElementById('membersList') || 
                       document.querySelector('[data-members-list]') ||
                       document.querySelector('.members-list');

    if (!membersList) {
      console.warn('Container de membros não encontrado');
      return;
    }

    if (members.length === 0) {
      membersList.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-users"></i>
          <h3>Nenhum membro cadastrado</h3>
          <p>Comece a adicionar membros à sua equipe usando o formulário abaixo.</p>
        </div>
      `;
      return;
    }

    membersList.innerHTML = '';

    members.forEach((member, index) => {
      const card = document.createElement('article');
      card.className = 'panel member-card';
      card.innerHTML = `
        <div class="member-card__header">
          <div class="member-avatar">
            ${member.nome.charAt(0).toUpperCase()}
          </div>
          <div class="member-info">
            <h3 class="member-name">${member.nome}</h3>
            <p class="member-email">${member.email}</p>
            <p class="member-role">Cargo: ${member.role_id || '--'}</p>
          </div>
        </div>

        <div class="member-card__actions">
          <button class="btn btn-secondary btn--sm" data-view-member="${member.id}">
            <i class="fa-solid fa-eye"></i>
            Ver detalhes
          </button>
          <button class="btn btn-danger btn--sm" data-delete-member="${member.id}">
            <i class="fa-solid fa-trash"></i>
            Remover
          </button>
        </div>
      `;

      membersList.appendChild(card);
    });
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Form de novo membro
    const addMemberForm = document.getElementById('addMemberForm');
    if (addMemberForm) {
      addMemberForm.addEventListener('submit', (e) => this.handleAddMember(e));
    }

    // Botões de ação
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-view-member]')) {
        const memberId = e.target.dataset.viewMember;
        this.viewMemberDetails(memberId);
      }

      if (e.target.matches('[data-delete-member]')) {
        const memberId = e.target.dataset.deleteMember;
        this.deleteMember(memberId);
      }
    });
  }

  /**
   * Trata adição de novo membro
   */
  async handleAddMember(e) {
    e.preventDefault();

    const name = document.getElementById('memberName')?.value.trim();
    const email = document.getElementById('memberEmail')?.value.trim();
    const cpf = document.getElementById('memberCPF')?.value.trim();
    const password = document.getElementById('memberPassword')?.value;

    // Validações
    if (!name || !email || !cpf || !password) {
      UIUtils.showError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!UIUtils.isValidEmail(email)) {
      UIUtils.showError('E-mail inválido.');
      return;
    }

    if (!UIUtils.isValidCPF(cpf)) {
      UIUtils.showError('CPF inválido.');
      return;
    }

    try {
      UIUtils.setButtonLoading('addMemberButton', true);

      const user = APIService.getStoredUser();
      const newMember = {
        nome: name,
        email: email,
        cpf: cpf,
        senha: password,
        role_id: document.getElementById('memberRole')?.value || 1,
        departamento_id: user.departamento_id,
        lider: false
      };

      await UserService.create(newMember);

      UIUtils.showSuccess('Membro adicionado com sucesso!');
      
      // Limpa form
      UIUtils.clearForm('addMemberForm');

      // Recarrega lista
      await this.loadTeamMembers();
    } catch (error) {
      UIUtils.showError(`Erro ao adicionar membro: ${error.message}`);
    } finally {
      UIUtils.setButtonLoading('addMemberButton', false);
    }
  }

  /**
   * Visualiza detalhes do membro
   */
  async viewMemberDetails(memberId) {
    try {
      const member = await UserService.getById(memberId);
      const submissions = await FormService.getUserSubmissions(memberId);

      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal__content">
          <div class="modal__header">
            <h2>Detalhes do Membro</h2>
            <button class="modal__close" type="button">&times;</button>
          </div>
          <div class="modal__body">
            <div class="member-details">
              <div class="detail-row">
                <strong>Nome:</strong>
                <span>${member.nome}</span>
              </div>
              <div class="detail-row">
                <strong>E-mail:</strong>
                <span>${member.email}</span>
              </div>
              <div class="detail-row">
                <strong>CPF:</strong>
                <span>${member.cpf}</span>
              </div>
              <div class="detail-row">
                <strong>Submissões:</strong>
                <span>${submissions.length}</span>
              </div>
              ${submissions.length > 0 ? `
                <div class="detail-row">
                  <strong>Última Submissão:</strong>
                  <span>${UIUtils.formatDate(submissions[submissions.length - 1].data_submissao)}</span>
                </div>
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
    } catch (error) {
      UIUtils.showError('Erro ao carregar detalhes do membro.');
    }
  }

  /**
   * Deleta membro da equipe
   */
  async deleteMember(memberId) {
    if (!confirm('Tem certeza que deseja remover este membro?')) {
      return;
    }

    try {
      await UserService.delete(memberId);
      UIUtils.showSuccess('Membro removido com sucesso!');
      await this.loadTeamMembers();
    } catch (error) {
      UIUtils.showError(`Erro ao remover membro: ${error.message}`);
    }
  }

  /**
   * Mostra mensagem para não-líderes
   */
  showNotLeaderMessage() {
    const content = document.querySelector('main') || document.querySelector('.app-content');
    if (content) {
      content.innerHTML = `
        <div class="empty-state" style="margin-top: 3rem;">
          <i class="fa-solid fa-lock"></i>
          <h3>Acesso restrito</h3>
          <p>Apenas líderes podem gerenciar a equipe.</p>
        </div>
      `;
    }
  }
}

// Inicializa quando o DOM está pronto
document.addEventListener('DOMContentLoaded', () => {
  new EquipePage();
});
