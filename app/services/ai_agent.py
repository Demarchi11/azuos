import logging
from datetime import date

import requests
from flask import current_app

from app.extensions import db
from app.models.relatorio import Relatorio

logger = logging.getLogger(__name__)


def _gerar_placeholder(submissao):
    """Gera um relatório placeholder quando a IA não está disponível."""
    respostas_resumo = []
    for resp in submissao.respostas:
        respostas_resumo.append(
            f"- {resp.pergunta.pergunta}: {resp.resposta}"
        )
    resumo = "\n".join(respostas_resumo)

    return (
        f"[PLACEHOLDER] Relatório de perfil ético\n"
        f"Submissão #{submissao.submissao_id}\n"
        f"Pontuação total: {submissao.pontuacao}\n\n"
        f"Respostas:\n{resumo}\n\n"
        f"⏳ Aguardando processamento pelo agente de IA."
    )


def gerar_relatorio_ia(submissao):
    """
    Envia dados da submissão para o agente ADK e salva o relatório gerado.
    Se AI_AGENT_URL não estiver configurada, gera um placeholder imediatamente.
    """
    ai_url = current_app.config.get("AI_AGENT_URL", "")

    # Se a IA não está configurada, gera placeholder sem tentar conexão
    if not ai_url or "localhost:8080" in ai_url:
        logger.info("Agente de IA não configurado. Gerando placeholder.")
        conteudo = _gerar_placeholder(submissao)
    else:
        # Montar payload para o agente
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
            conteudo = _gerar_placeholder(submissao)

    relatorio = Relatorio(
        conteudo=conteudo, data_criacao=date.today(),
        submissao_id=submissao.submissao_id,
    )
    db.session.add(relatorio)
    db.session.commit()
    return relatorio
