from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from app.extensions import db
from app.models.usuario import Usuario

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("senha"):
        return jsonify({"error": "Email e senha são obrigatórios"}), 400
    usuario = Usuario.query.filter_by(email=data["email"]).first()
    if not usuario or not check_password_hash(usuario.senha, data["senha"]):
        return jsonify({"error": "Credenciais inválidas"}), 401
    return jsonify({"message": "Login realizado com sucesso", "usuario": usuario.to_dict()}), 200
