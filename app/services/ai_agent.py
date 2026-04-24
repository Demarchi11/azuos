import logging
from datetime import date

import requests
from flask import current_app

from app.extensions import db
from app.models.relatorio import Relatorio

logger = logging.getLogger(__name__)


def _gerar_placeholder(submissao):
    """Gera um relatório realista pré-programado ("mock") para a equipe de Front-End trabalhar."""
    return (
        "# Pontos Fortes:\n"
        "- **Reação sob pressão:** O candidato demonstra uma abordagem equilibrada ao tentar manter a calma e, crucialmente, valorizar a colaboração com a equipe. Isso indica autoconsciência e reconhecimento da força coletiva, características essenciais para uma liderança eficaz e ética.\n"
        "- **Lidar com atrasos:** A postura de informar a gerência imediatamente reflete um alto nível de transparência, honestidade e responsabilidade. Essas qualidades são fundamentais para construir confiança.\n\n"
        "# Pontos Fracos:\n"
        "- Nenhum ponto fraco significativo ou área de risco foi identificada com base nas respostas fornecidas.\n\n"
        "# Conclusão:\n"
        f"O candidato demonstrou um perfil ético robusto e promissor. A pontuação total de {submissao.pontuacao}, aliada à qualidade das respostas, sugere que o candidato está bem alinhado com os princípios éticos esperados e apto para assumir responsabilidades que demandem integridade e liderança colaborativa.\n\n"
        "*⚠️ NOTA: Este é um relatório simulado fixo, pois a API da verdadeira Inteligência Artificial está sob desenvolvimento e temporariamente desativada.*"
    )


def gerar_relatorio_ia(submissao):
    """
    Simula a geração de relatório para o front-end poder trabalhar.
    As chamadas HTTP para o agente estão 100% desativadas para evitar timeouts até que o desenvolvimento no ADK seja concluído.
    """
    logger.info("Modo de Teste: Agente de IA desativado via código. Gerando placeholder realista.")
    conteudo = _gerar_placeholder(submissao)

    relatorio = Relatorio(
        conteudo=conteudo, data_criacao=date.today(),
        submissao_id=submissao.submissao_id,
    )
    db.session.add(relatorio)
    db.session.commit()
    return relatorio
