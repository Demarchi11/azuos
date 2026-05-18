# Desenvolvimento da aplicacao

## Como executar

1. Inicie o servidor Flask:
   `python BackEnd/app.py`
2. Abra no navegador:
   `http://127.0.0.1:5000/pages/login.html`

## Fluxo atual

- O primeiro acesso cria a lideranca inicial da plataforma.
- A lideranca cadastra funcionarios na pagina `Equipe`.
- Lideres respondem o bloco `Dilemas industriais`.
- Funcionarios respondem o bloco `Avaliacao do lider`.
- O formulario envia respostas ao backend e o front nao calcula score localmente.
- Dashboard, historico e ranking mostram apenas dados retornados pelo servidor.

## Persistencia

- O backend salva dados locais em `BackEnd/app_data.json`.
- Nao existem usuarios, funcionarios, rankings ou resultados predefinidos.

## Endpoints principais

- `GET /api/auth/bootstrap-status`
- `POST /api/auth/bootstrap`
- `POST /api/auth/login`
- `GET /api/dashboard/me`
- `GET /api/team/members`
- `POST /api/team/members`
- `GET /api/forms/submissions/me`
- `POST /api/forms/submissions`
- `GET /api/ranking`

## Ponto de integracao para banco e IA

- Troque a leitura e escrita de `BackEnd/app_data.json` pela camada real de persistencia.
- Preencha `analysis_status`, `score` e `analysis_summary` das submissoes quando a analise da IA estiver pronta.
- O ranking depende de submissoes com `analysis_status = completed` e `score` numerico.
