from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.formulario import Formulario

formularios_bp = Blueprint("formularios", __name__)


@formularios_bp.route("", methods=["GET"])
def listar():
    return jsonify([f.to_dict() for f in Formulario.query.all()]), 200


@formularios_bp.route("/<int:id>", methods=["GET"])
def obter(id):
    form = db.session.get(Formulario, id)
    if not form:
        return jsonify({"error": "Formulário não encontrado"}), 404
    return jsonify(form.to_dict(include_perguntas=True)), 200


@formularios_bp.route("/por-cargo/<int:role_id>", methods=["GET"])
def por_cargo(role_id):
    forms = Formulario.query.filter_by(role_id=role_id).all()
    return jsonify([f.to_dict(include_perguntas=True) for f in forms]), 200


@formularios_bp.route("", methods=["POST"])
def criar():
    data = request.get_json()
    if not data or not data.get("titulo") or not data.get("role_id"):
        return jsonify({"error": "Campos 'titulo' e 'role_id' são obrigatórios"}), 400
    form = Formulario(titulo=data["titulo"], role_id=data["role_id"])
    db.session.add(form)
    db.session.commit()
    return jsonify(form.to_dict()), 201


@formularios_bp.route("/<int:id>", methods=["PUT"])
def atualizar(id):
    form = db.session.get(Formulario, id)
    if not form:
        return jsonify({"error": "Formulário não encontrado"}), 404
    data = request.get_json()
    if data.get("titulo"): form.titulo = data["titulo"]
    if data.get("role_id"): form.role_id = data["role_id"]
    db.session.commit()
    return jsonify(form.to_dict()), 200


@formularios_bp.route("/<int:id>", methods=["DELETE"])
def deletar(id):
    form = db.session.get(Formulario, id)
    if not form:
        return jsonify({"error": "Formulário não encontrado"}), 404
    db.session.delete(form)
    db.session.commit()
    return jsonify({"message": "Formulário removido"}), 200
