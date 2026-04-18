# Documentação da API - Sistema de Perfil Ético (AzuOS)

Bem-vindos ao Front-End! Aqui estão as instruções de todos os endpoints e o fluxo principal para usar a nossa API construída em Flask.

A URL base local é padrão: `http://localhost:5000/api`

---

## 🧭 O Fluxo Principal (Como as tabelas se conectam)

Como é um banco de dados relacional, existe uma **ordem obrigatória** para criar os dados:

1. Você precisa criar um **Cargo** primeiro.
2. Você precisa criar um **Departamento** (opcional, mas recomendado).
3. Uma vez com Cargo e Departamento, você pode criar o **Usuário**.
4. Uma vez com o Cargo, você pode criar um **Formulário** para aquele Cargo.
5. Uma vez com o Formulário, você pode criar as **Perguntas** ligadas a ele.
6. Finalmente, com o **Usuário** e o **Formulário** prontos, o front-end pode enviar a **Submissão** com as respostas. Assim que submetida, a API calcula automaticamente os pontos e chama a IA para gerar o **Relatório**.

---

## 📡 Endpoints Principais

A API segue padrões RESTful de CRUD:
- `GET /recurso` (Listar todos)
- `GET /recurso/<id>` (Obter um)
- `POST /recurso` (Criar)
- `PUT /recurso/<id>` (Atualizar)
- `DELETE /recurso/<id>` (Deletar)

### 1. Cargos
- **URL**: `/cargos`
- **POST Body Exemplo**:
```json
{ "nome": 1 }
```
*(Nota: No banco atual, a coluna nome de cargo está como número, não texto)*

### 2. Departamentos
- **URL**: `/departamentos`
- **POST Body Exemplo**:
```json
{ "nome": "Vendas" }
```

### 3. Autenticação & Usuários
- **Criar Usuário (Registro)** - `POST /usuarios`
```json
{
  "nome": "João Dev",
  "cpf": "12345678900",
  "email": "joao@email.com",
  "senha": "senhaforte", 
  "role_id": 1,
  "departamento_id": 1, 
  "lider": false
}
```
- **Login** - `POST /auth/login`
```json
{
  "email": "joao@email.com",
  "senha": "senhaforte"
}
```

### 4. Formulários & Perguntas
- **Criar Formulário** - `POST /formularios`
```json
{
  "titulo": "Avaliação Ética Básica",
  "role_id": 1
}
```
- **Criar Pergunta** - `POST /perguntas`
```json
{
  "pergunta": "Como você reage sob pressão?",
  "formulario_id": 1,
  "pontuacao": 10
}
```
- **⭐ Buscar Formulário Completo** - `GET /formularios/<id>`
Ele já vai vir recheado de perguntas num array (otimizado para o Front-End carregar a tela sem fazer N requisições). O Front-End deve carregar através deste endpoint para desenhar a UI de perguntas.
- **Buscar Formulário pelo Cargo** - `GET /formularios/por-cargo/<role_id>`

### 5. O Fluxo de Avaliação (Submissão)
- **A Submissão Final** - `POST /submissoes`
O usuário do front respondeu todas as perguntas em tela. Envie tudo de uma vez para fazer a magia acontecer:
```json
{
  "usuario_id": 1,
  "formulario_id": 1,
  "respostas": [
    {
       "pergunta_id": 1,
       "resposta": "Eu tento manter a calma e peço ajuda."
    },
    {
       "pergunta_id": 2,
       "resposta": "Resolvo no dia seguinte de manhã."
    }
  ]
}
```
Isso vai:
1. Criar a Submissão.
2. Anexar as respostas.
3. Calcular a `pontuacao` automaticamente somando o valor das perguntas.
4. Enviar um POST JSON oculto para a API de Inteligência Artificial para gerar o Relatório e atrelar a esta submissão.
5. Retornar um grande JSON contendo TODAS essas informações para que o Front exiba o resultado para o usuário.

- **Listar Histórico do Usuário** - `GET /submissoes/usuario/<usuario_id>`

### 6. Relatórios
- **Buscar Relatório de uma Submissão** - `GET /relatorios/submissao/<submissao_id>`

---

## 🛠 Códigos de Erro (Status Codes)
O código tem respostas HTTP bem descritivas.
- `200` e `201`: Sucesso. Tudo ocorreu bem.
- `400`: Você enviou o payload errado. A API vai retornar em string qual campo está faltando.
- `401`: O email ou a senha no Login estão incorretos.
- `404`: O registro que você tentou consultar / editar / deletar não existe no banco.
- `409`: Você tentou cadastrar um Usuário que o CPF ou o Email já existem no banco.
