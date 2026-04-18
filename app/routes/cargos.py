from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.cargo import Cargo

cargos_bp = Blueprint("cargos", __name__)


@cargos_bp.route("", methods=["GET"])
def listar():
    return jsonify([c.to_dict() for c in Cargo.query.all()]), 200


@cargos_bp.route("/<int:id>", methods=["GET"])
def obter(id):
    cargo = db.session.get(Cargo, id)
    if not cargo:
        return jsonify({"error": "Cargo não encontrado"}), 404
    return jsonify(cargo.to_dict()), 200


@cargos_bp.route("", methods=["POST"])
def criar():
    data = request.get_json()
    if not data or "nome" not in data:
        return jsonify({"error": "Campo 'nome' é obrigatório"}), 400
    cargo = Cargo(nome=data["nome"])
    db.session.add(cargo)
    db.session.commit()
    return jsonify(cargo.to_dict()), 201


@cargos_bp.route("/<int:id>", methods=["PUT"])
def atualizar(id):
    cargo = db.session.get(Cargo, id)
    if not cargo:
        return jsonify({"error": "Cargo não encontrado"}), 404
    data = request.get_json()
    if "nome" in data:
        cargo.nome = data["nome"]
    db.session.commit()
    return jsonify(cargo.to_dict()), 200


@cargos_bp.route("/<int:id>", methods=["DELETE"])
def deletar(id):
    cargo = db.session.get(Cargo, id)
    if not cargo:
        return jsonify({"error": "Cargo não encontrado"}), 404
    db.session.delete(cargo)
    db.session.commit()
    return jsonify({"message": "Cargo removido"}), 200
