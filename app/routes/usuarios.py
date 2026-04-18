from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from app.extensions import db
from app.models.usuario import Usuario

usuarios_bp = Blueprint("usuarios", __name__)


@usuarios_bp.route("", methods=["GET"])
def listar():
    return jsonify([u.to_dict() for u in Usuario.query.all()]), 200


@usuarios_bp.route("/<int:id>", methods=["GET"])
def obter(id):
    usuario = db.session.get(Usuario, id)
    if not usuario:
        return jsonify({"error": "Usuário não encontrado"}), 404
    return jsonify(usuario.to_dict()), 200


@usuarios_bp.route("", methods=["POST"])
def criar():
    data = request.get_json()
    for campo in ["nome", "cpf", "email", "role_id", "senha"]:
        if not data or not data.get(campo):
            return jsonify({"error": f"Campo '{campo}' é obrigatório"}), 400
    if Usuario.query.filter_by(cpf=data["cpf"]).first():
        return jsonify({"error": "CPF já cadastrado"}), 409
    if Usuario.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email já cadastrado"}), 409
    usuario = Usuario(
        nome=data["nome"], cpf=data["cpf"], email=data["email"],
        role_id=data["role_id"], senha=generate_password_hash(data["senha"]),
        lider=data.get("lider", False), departamento_id=data.get("departamento_id"),
    )
    db.session.add(usuario)
    db.session.commit()
    return jsonify(usuario.to_dict()), 201


@usuarios_bp.route("/<int:id>", methods=["PUT"])
def atualizar(id):
    usuario = db.session.get(Usuario, id)
    if not usuario:
        return jsonify({"error": "Usuário não encontrado"}), 404
    data = request.get_json()
    if data.get("nome"): usuario.nome = data["nome"]
    if data.get("cpf"): usuario.cpf = data["cpf"]
    if data.get("email"): usuario.email = data["email"]
    if data.get("role_id"): usuario.role_id = data["role_id"]
    if data.get("senha"): usuario.senha = generate_password_hash(data["senha"])
    if "lider" in data: usuario.lider = data["lider"]
    if "departamento_id" in data: usuario.departamento_id = data["departamento_id"]
    db.session.commit()
    return jsonify(usuario.to_dict()), 200


@usuarios_bp.route("/<int:id>", methods=["DELETE"])
def deletar(id):
    usuario = db.session.get(Usuario, id)
    if not usuario:
        return jsonify({"error": "Usuário não encontrado"}), 404
    db.session.delete(usuario)
    db.session.commit()
    return jsonify({"message": "Usuário removido"}), 200
