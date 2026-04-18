from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.resposta_usuario import RespostaUsuario

respostas_bp = Blueprint("respostas", __name__)


@respostas_bp.route("", methods=["GET"])
def listar():
    submissao_id = request.args.get("submissao_id", type=int)
    query = RespostaUsuario.query
    if submissao_id:
        query = query.filter_by(submissao_id=submissao_id)
    return jsonify([r.to_dict() for r in query.all()]), 200


@respostas_bp.route("/<int:id>", methods=["GET"])
def obter(id):
    r = db.session.get(RespostaUsuario, id)
    if not r:
        return jsonify({"error": "Resposta não encontrada"}), 404
    return jsonify(r.to_dict()), 200


@respostas_bp.route("", methods=["POST"])
def criar():
    data = request.get_json()
    for campo in ["resposta", "pergunta_id", "submissao_id"]:
        if not data or not data.get(campo):
            return jsonify({"error": f"Campo '{campo}' é obrigatório"}), 400
    r = RespostaUsuario(resposta=data["resposta"], pergunta_id=data["pergunta_id"], submissao_id=data["submissao_id"])
    db.session.add(r)
    db.session.commit()
    return jsonify(r.to_dict()), 201


@respostas_bp.route("/<int:id>", methods=["PUT"])
def atualizar(id):
    r = db.session.get(RespostaUsuario, id)
    if not r:
        return jsonify({"error": "Resposta não encontrada"}), 404
    data = request.get_json()
    if data.get("resposta"): r.resposta = data["resposta"]
    if data.get("pergunta_id"): r.pergunta_id = data["pergunta_id"]
    if data.get("submissao_id"): r.submissao_id = data["submissao_id"]
    db.session.commit()
    return jsonify(r.to_dict()), 200


@respostas_bp.route("/<int:id>", methods=["DELETE"])
def deletar(id):
    r = db.session.get(RespostaUsuario, id)
    if not r:
        return jsonify({"error": "Resposta não encontrada"}), 404
    db.session.delete(r)
    db.session.commit()
    return jsonify({"message": "Resposta removida"}), 200
