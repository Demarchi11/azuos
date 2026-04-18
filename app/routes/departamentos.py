from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.departamento import Departamento

departamentos_bp = Blueprint("departamentos", __name__)


@departamentos_bp.route("", methods=["GET"])
def listar():
    return jsonify([d.to_dict() for d in Departamento.query.all()]), 200


@departamentos_bp.route("/<int:id>", methods=["GET"])
def obter(id):
    dept = db.session.get(Departamento, id)
    if not dept:
        return jsonify({"error": "Departamento não encontrado"}), 404
    return jsonify(dept.to_dict()), 200


@departamentos_bp.route("", methods=["POST"])
def criar():
    data = request.get_json()
    if not data or not data.get("nome"):
        return jsonify({"error": "Campo 'nome' é obrigatório"}), 400
    dept = Departamento(nome=data["nome"])
    db.session.add(dept)
    db.session.commit()
    return jsonify(dept.to_dict()), 201


@departamentos_bp.route("/<int:id>", methods=["PUT"])
def atualizar(id):
    dept = db.session.get(Departamento, id)
    if not dept:
        return jsonify({"error": "Departamento não encontrado"}), 404
    data = request.get_json()
    if data.get("nome"):
        dept.nome = data["nome"]
    db.session.commit()
    return jsonify(dept.to_dict()), 200


@departamentos_bp.route("/<int:id>", methods=["DELETE"])
def deletar(id):
    dept = db.session.get(Departamento, id)
    if not dept:
        return jsonify({"error": "Departamento não encontrado"}), 404
    db.session.delete(dept)
    db.session.commit()
    return jsonify({"message": "Departamento removido"}), 200
