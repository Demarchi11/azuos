import requests
import json

# ==========================================
# CONFIGURAÇÕES
# ==========================================
# Substitua pela URL onde seu agente está rodando
AGENT_URL = "http://127.0.0.1:8000"
APP_NAME = "azuos_compliance_beta"
USER_ID = "u_2"
SESSION_ID = "s_2"

print(f"🔄 Conectando em: {AGENT_URL}")

# 1. CRIAR SESSÃO
session_url = f"{AGENT_URL}/apps/{APP_NAME}/users/{USER_ID}/sessions/{SESSION_ID}"
try:
    print("\n1️⃣ Criando Sessão...")
    resp_session = requests.post(session_url)
    resp_session.raise_for_status()
    print("✅ Sessão criada com sucesso!")
except Exception as e:
    print(f"❌ Erro ao criar sessão: {e}")
    # Dependendo da API, ela pode nem precisar criar sessão primeiro, então continuamos

# 2. MANDAR A MSG (O RUN)
run_url = f"{AGENT_URL}/run"

# Texto formatado usando aspas triplas para lidar com quebras de linha com perfeição
texto_payload = """Avalie a seguinte submissão de formulário e gere um relatório de perfil ético.

Usuário: João Silva (ID: 1)
Formulário: Avaliação Ética Básica
Pontuação Total: 18

Respostas:
- Pergunta: Como você reage sob pressão?
  Resposta: Eu tento manter a calma e peço ajuda da equipe quando necessário. (Pontos: 10)

- Pergunta: Como você lida com atrasos nas entregas?
  Resposta: Informo a gerência imediatamente e evito mentir sobre os prazos. (Pontos: 8)"""

payload = {
    "appName": APP_NAME,
    "userId": USER_ID,
    "sessionId": SESSION_ID,
    "newMessage": {
        "role": "user",
        "parts": [{"text": texto_payload}]
    }
}

print("\n2️⃣ Enviando mensagem para a IA...")
try:
    resp_run = requests.post(run_url, json=payload)
    resp_run.raise_for_status()
    print("✅ Sucesso! Resposta da IA:")
    
    # Imprime o JSON de resposta formatado bonitinho no terminal
    print("\n" + "="*40)
    print(json.dumps(resp_run.json(), indent=2, ensure_ascii=False))
    print("="*40)
except Exception as e:
    print(f"❌ Erro na execução: {e}")
    if 'resp_run' in locals():
        print(f"Retorno cru: {resp_run.text}")
