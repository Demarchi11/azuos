from datetime import date
from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.submissao import Submissao
from app.models.resposta_usuario import RespostaUsuario
from app.services.ai_agent import gerar_relatorio_ia

submissoes_bp = Blueprint("submissoes", __name__)


@submissoes_bp.route("", methods=["GET"])
def listar():
    return jsonify([s.to_dict() for s in Submissao.query.all()]), 200


@submissoes_bp.route("/<int:id>", methods=["GET"])
def obter(id):
    s = db.session.get(Submissao, id)
    if not s:
        return jsonify({"error": "Submissão não encontrada"}), 404
    return jsonify(s.to_dict(include_respostas=True)), 200


@submissoes_bp.route("/usuario/<int:usuario_id>", methods=["GET"])
def por_usuario(usuario_id):
    return jsonify([s.to_dict() for s in Submissao.query.filter_by(usuario_id=usuario_id).all()]), 200


@submissoes_bp.route("", methods=["POST"])
def criar():
    """Cria submissão + respostas + dispara geração de relatório pela IA."""
    data = request.get_json()
    if not data or not data.get("usuario_id") or not data.get("formulario_id"):
        return jsonify({"error": "Campos 'usuario_id' e 'formulario_id' são obrigatórios"}), 400
    respostas_data = data.get("respostas", [])
    if not respostas_data:
        return jsonify({"error": "É necessário enviar ao menos uma resposta"}), 400

    submissao = Submissao(
        usuario_id=data["usuario_id"], formulario_id=data["formulario_id"],
        data_inicio=date.today(), data_fim=date.today(), pontuacao=0,
    )
    db.session.add(submissao)
    db.session.flush()

    for rd in respostas_data:
        db.session.add(RespostaUsuario(
            resposta=rd["resposta"], pergunta_id=rd["pergunta_id"],
            submissao_id=submissao.submissao_id,
        ))

    db.session.flush()
    submissao.pontuacao = sum(r.pergunta.pontuacao or 0 for r in submissao.respostas)
    db.session.commit()

    relatorio = gerar_relatorio_ia(submissao)
    resultado = submissao.to_dict(include_respostas=True)
    if relatorio:
        resultado["relatorio"] = relatorio.to_dict()
    return jsonify(resultado), 201


@submissoes_bp.route("/<int:id>", methods=["PUT"])
def atualizar(id):
    s = db.session.get(Submissao, id)
    if not s:
        return jsonify({"error": "Submissão não encontrada"}), 404
    data = request.get_json()
    if data.get("usuario_id"): s.usuario_id = data["usuario_id"]
    if data.get("formulario_id"): s.formulario_id = data["formulario_id"]
    if data.get("data_inicio"): s.data_inicio = data["data_inicio"]
    if data.get("data_fim"): s.data_fim = data["data_fim"]
    if "pontuacao" in data: s.pontuacao = data["pontuacao"]
    db.session.commit()
    return jsonify(s.to_dict()), 200


@submissoes_bp.route("/<int:id>", methods=["DELETE"])
def deletar(id):
    s = db.session.get(Submissao, id)
    if not s:
        return jsonify({"error": "Submissão não encontrada"}), 404
    db.session.delete(s)
    db.session.commit()
    return jsonify({"message": "Submissão removida"}), 200
