from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.relatorio import Relatorio

relatorios_bp = Blueprint("relatorios", __name__)


@relatorios_bp.route("", methods=["GET"])
def listar():
    return jsonify([r.to_dict() for r in Relatorio.query.all()]), 200


@relatorios_bp.route("/<int:id>", methods=["GET"])
def obter(id):
    r = db.session.get(Relatorio, id)
    if not r:
        return jsonify({"error": "Relatório não encontrado"}), 404
    return jsonify(r.to_dict()), 200


@relatorios_bp.route("/submissao/<int:submissao_id>", methods=["GET"])
def por_submissao(submissao_id):
    r = Relatorio.query.filter_by(submissao_id=submissao_id).first()
    if not r:
        return jsonify({"error": "Relatório não encontrado para esta submissão"}), 404
    return jsonify(r.to_dict()), 200


@relatorios_bp.route("", methods=["POST"])
def criar():
    data = request.get_json()
    if not data or not data.get("conteudo") or not data.get("submissao_id"):
        return jsonify({"error": "Campos 'conteudo' e 'submissao_id' são obrigatórios"}), 400
    r = Relatorio(conteudo=data["conteudo"], submissao_id=data["submissao_id"])
    db.session.add(r)
    db.session.commit()
    return jsonify(r.to_dict()), 201


@relatorios_bp.route("/<int:id>", methods=["PUT"])
def atualizar(id):
    r = db.session.get(Relatorio, id)
    if not r:
        return jsonify({"error": "Relatório não encontrado"}), 404
    data = request.get_json()
    if data.get("conteudo"): r.conteudo = data["conteudo"]
    if data.get("submissao_id"): r.submissao_id = data["submissao_id"]
    db.session.commit()
    return jsonify(r.to_dict()), 200


@relatorios_bp.route("/<int:id>", methods=["DELETE"])
def deletar(id):
    r = db.session.get(Relatorio, id)
    if not r:
        return jsonify({"error": "Relatório não encontrado"}), 404
    db.session.delete(r)
    db.session.commit()
    return jsonify({"message": "Relatório removido"}), 200
