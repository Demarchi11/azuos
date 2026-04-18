import logging
from datetime import date

import requests
from flask import current_app

from app.extensions import db
from app.models.relatorio import Relatorio

logger = logging.getLogger(__name__)


def gerar_relatorio_ia(submissao):
    """Envia dados da submissão para o agente ADK e salva o relatório gerado."""
    ai_url = current_app.config.get("AI_AGENT_URL")

    respostas_payload = []
    for resp in submissao.respostas:
        pergunta_obj = resp.pergunta
        respostas_payload.append({
            "pergunta": pergunta_obj.pergunta,
            "resposta": resp.resposta,
            "pontuacao": pergunta_obj.pontuacao,
        })

    payload = {
        "submissao_id": submissao.submissao_id,
        "usuario": submissao.usuario.to_dict(),
        "formulario": submissao.formulario.to_dict(),
        "respostas": respostas_payload,
        "pontuacao_total": submissao.pontuacao,
    }

    try:
        response = requests.post(ai_url, json=payload, timeout=60)
        response.raise_for_status()
        resultado = response.json()
        conteudo = resultado.get("relatorio", resultado.get("conteudo", ""))
    except requests.exceptions.RequestException as e:
        logger.warning(f"Agente de IA indisponível ({e}). Usando placeholder.")
        conteudo = (
            f"[PLACEHOLDER] Relatório de perfil ético para submissão "
            f"#{submissao.submissao_id}. Pontuação: {submissao.pontuacao}. "
            f"Aguardando processamento pelo agente de IA."
        )

    relatorio = Relatorio(
        conteudo=conteudo, data_criacao=date.today(),
        submissao_id=submissao.submissao_id,
    )
    db.session.add(relatorio)
    db.session.commit()
    return relatorio
