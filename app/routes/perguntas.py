from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.pergunta import Pergunta

perguntas_bp = Blueprint("perguntas", __name__)


@perguntas_bp.route("", methods=["GET"])
def listar():
    formulario_id = request.args.get("formulario_id", type=int)
    query = Pergunta.query
    if formulario_id:
        query = query.filter_by(formulario_id=formulario_id)
    return jsonify([p.to_dict() for p in query.all()]), 200


@perguntas_bp.route("/<int:id>", methods=["GET"])
def obter(id):
    p = db.session.get(Pergunta, id)
    if not p:
        return jsonify({"error": "Pergunta não encontrada"}), 404
    return jsonify(p.to_dict()), 200


@perguntas_bp.route("", methods=["POST"])
def criar():
    data = request.get_json()
    if not data or not data.get("pergunta") or not data.get("formulario_id"):
        return jsonify({"error": "Campos 'pergunta' e 'formulario_id' são obrigatórios"}), 400
    p = Pergunta(pergunta=data["pergunta"], formulario_id=data["formulario_id"], pontuacao=data.get("pontuacao"))
    db.session.add(p)
    db.session.commit()
    return jsonify(p.to_dict()), 201


@perguntas_bp.route("/<int:id>", methods=["PUT"])
def atualizar(id):
    p = db.session.get(Pergunta, id)
    if not p:
        return jsonify({"error": "Pergunta não encontrada"}), 404
    data = request.get_json()
    if data.get("pergunta"): p.pergunta = data["pergunta"]
    if data.get("formulario_id"): p.formulario_id = data["formulario_id"]
    if "pontuacao" in data: p.pontuacao = data["pontuacao"]
    db.session.commit()
    return jsonify(p.to_dict()), 200


@perguntas_bp.route("/<int:id>", methods=["DELETE"])
def deletar(id):
    p = db.session.get(Pergunta, id)
    if not p:
        return jsonify({"error": "Pergunta não encontrada"}), 404
    db.session.delete(p)
    db.session.commit()
    return jsonify({"message": "Pergunta removida"}), 200
