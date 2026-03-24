from flask import Blueprint, abort, jsonify

from .crud import apply_data, get_json_payload, get_pagination, parse_boolean, parse_datetime
from .db import get_session
from .models import Departamento, Formulario, Pergunta, Relatorio, RespostaUsuario, Usuario
from .serializers import (
    serialize_departamento,
    serialize_formulario,
    serialize_pergunta,
    serialize_relatorio,
    serialize_resposta_usuario,
    serialize_usuario,
)


api_bp = Blueprint("api", __name__)


def get_or_404(model, item_id, label: str):
    session = get_session()
    item = session.get(model, item_id)
    if item is None:
        abort(404, description=f"{label} nao encontrado(a).")
    return item


def list_entities(model, serializer):
    session = get_session()
    limit, offset = get_pagination()
    items = session.query(model).limit(limit).offset(offset).all()
    return jsonify([serializer(item) for item in items])


def create_entity(model, serializer, field_parsers, required_fields):
    session = get_session()
    payload = get_json_payload()
    item = model()
    apply_data(
        item,
        payload,
        field_parsers,
        partial=False,
        required_fields=required_fields,
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return jsonify(serializer(item)), 201


def update_entity(model, item_id, label, serializer, field_parsers, partial, required_fields):
    session = get_session()
    item = get_or_404(model, item_id, label)
    payload = get_json_payload()
    apply_data(
        item,
        payload,
        field_parsers,
        partial=partial,
        required_fields=required_fields,
    )
    session.commit()
    session.refresh(item)
    return jsonify(serializer(item))


def delete_entity(model, item_id, label):
    session = get_session()
    item = get_or_404(model, item_id, label)
    session.delete(item)
    session.commit()
    return jsonify({"message": f"{label} removido(a) com sucesso."})


DEPARTAMENTO_FIELDS = {
    "nome": str,
}
DEPARTAMENTO_REQUIRED_FIELDS = {"nome"}

USUARIO_FIELDS = {
    "nome": str,
    "cpf": str,
    "email": str,
    "registro": str,
    "role": str,
    "senha": str,
    "lider": parse_boolean,
    "departamento_id": int,
}
USUARIO_REQUIRED_FIELDS = set(USUARIO_FIELDS.keys())

FORMULARIO_FIELDS = {
    "titulo": str,
    "role": str,
}
FORMULARIO_REQUIRED_FIELDS = set(FORMULARIO_FIELDS.keys())

PERGUNTA_FIELDS = {
    "pergunta": str,
    "formulario_id": int,
}
PERGUNTA_REQUIRED_FIELDS = set(PERGUNTA_FIELDS.keys())

RELATORIO_FIELDS = {
    "documento": str,
    "data_de_criacao": parse_datetime,
}
RELATORIO_REQUIRED_FIELDS = {"documento"}

RESPOSTA_USUARIO_FIELDS = {
    "usuario_id": int,
    "pergunta_id": int,
    "relatorio_id": int,
    "resposta": str,
}
RESPOSTA_USUARIO_REQUIRED_FIELDS = set(RESPOSTA_USUARIO_FIELDS.keys())


@api_bp.get("/")
def api_index():
    return jsonify(
        {
            "resources": [
                "departamentos",
                "usuarios",
                "formularios",
                "perguntas",
                "relatorios",
                "respostas-usuario",
            ]
        }
    )


@api_bp.get("/departamentos")
def list_departamentos():
    return list_entities(Departamento, serialize_departamento)


@api_bp.post("/departamentos")
def create_departamento():
    return create_entity(
        Departamento,
        serialize_departamento,
        DEPARTAMENTO_FIELDS,
        DEPARTAMENTO_REQUIRED_FIELDS,
    )


@api_bp.get("/departamentos/<int:departamento_id>")
def get_departamento(departamento_id: int):
    item = get_or_404(Departamento, departamento_id, "Departamento")
    return jsonify(serialize_departamento(item))


@api_bp.put("/departamentos/<int:departamento_id>")
def replace_departamento(departamento_id: int):
    return update_entity(
        Departamento,
        departamento_id,
        "Departamento",
        serialize_departamento,
        DEPARTAMENTO_FIELDS,
        partial=False,
        required_fields=DEPARTAMENTO_REQUIRED_FIELDS,
    )


@api_bp.patch("/departamentos/<int:departamento_id>")
def update_departamento(departamento_id: int):
    return update_entity(
        Departamento,
        departamento_id,
        "Departamento",
        serialize_departamento,
        DEPARTAMENTO_FIELDS,
        partial=True,
        required_fields=DEPARTAMENTO_REQUIRED_FIELDS,
    )


@api_bp.delete("/departamentos/<int:departamento_id>")
def delete_departamento(departamento_id: int):
    return delete_entity(Departamento, departamento_id, "Departamento")


@api_bp.get("/usuarios")
def list_usuarios():
    return list_entities(Usuario, serialize_usuario)


@api_bp.post("/usuarios")
def create_usuario():
    return create_entity(
        Usuario,
        serialize_usuario,
        USUARIO_FIELDS,
        USUARIO_REQUIRED_FIELDS,
    )


@api_bp.get("/usuarios/<int:usuario_id>")
def get_usuario(usuario_id: int):
    item = get_or_404(Usuario, usuario_id, "Usuario")
    return jsonify(serialize_usuario(item))


@api_bp.put("/usuarios/<int:usuario_id>")
def replace_usuario(usuario_id: int):
    return update_entity(
        Usuario,
        usuario_id,
        "Usuario",
        serialize_usuario,
        USUARIO_FIELDS,
        partial=False,
        required_fields=USUARIO_REQUIRED_FIELDS,
    )


@api_bp.patch("/usuarios/<int:usuario_id>")
def update_usuario(usuario_id: int):
    return update_entity(
        Usuario,
        usuario_id,
        "Usuario",
        serialize_usuario,
        USUARIO_FIELDS,
        partial=True,
        required_fields=USUARIO_REQUIRED_FIELDS,
    )


@api_bp.delete("/usuarios/<int:usuario_id>")
def delete_usuario(usuario_id: int):
    return delete_entity(Usuario, usuario_id, "Usuario")


@api_bp.get("/formularios")
def list_formularios():
    return list_entities(Formulario, serialize_formulario)


@api_bp.post("/formularios")
def create_formulario():
    return create_entity(
        Formulario,
        serialize_formulario,
        FORMULARIO_FIELDS,
        FORMULARIO_REQUIRED_FIELDS,
    )


@api_bp.get("/formularios/<int:formulario_id>")
def get_formulario(formulario_id: int):
    item = get_or_404(Formulario, formulario_id, "Formulario")
    return jsonify(serialize_formulario(item))


@api_bp.put("/formularios/<int:formulario_id>")
def replace_formulario(formulario_id: int):
    return update_entity(
        Formulario,
        formulario_id,
        "Formulario",
        serialize_formulario,
        FORMULARIO_FIELDS,
        partial=False,
        required_fields=FORMULARIO_REQUIRED_FIELDS,
    )


@api_bp.patch("/formularios/<int:formulario_id>")
def update_formulario(formulario_id: int):
    return update_entity(
        Formulario,
        formulario_id,
        "Formulario",
        serialize_formulario,
        FORMULARIO_FIELDS,
        partial=True,
        required_fields=FORMULARIO_REQUIRED_FIELDS,
    )


@api_bp.delete("/formularios/<int:formulario_id>")
def delete_formulario(formulario_id: int):
    return delete_entity(Formulario, formulario_id, "Formulario")


@api_bp.get("/perguntas")
def list_perguntas():
    return list_entities(Pergunta, serialize_pergunta)


@api_bp.post("/perguntas")
def create_pergunta():
    return create_entity(
        Pergunta,
        serialize_pergunta,
        PERGUNTA_FIELDS,
        PERGUNTA_REQUIRED_FIELDS,
    )


@api_bp.get("/perguntas/<int:pergunta_id>")
def get_pergunta(pergunta_id: int):
    item = get_or_404(Pergunta, pergunta_id, "Pergunta")
    return jsonify(serialize_pergunta(item))


@api_bp.put("/perguntas/<int:pergunta_id>")
def replace_pergunta(pergunta_id: int):
    return update_entity(
        Pergunta,
        pergunta_id,
        "Pergunta",
        serialize_pergunta,
        PERGUNTA_FIELDS,
        partial=False,
        required_fields=PERGUNTA_REQUIRED_FIELDS,
    )


@api_bp.patch("/perguntas/<int:pergunta_id>")
def update_pergunta(pergunta_id: int):
    return update_entity(
        Pergunta,
        pergunta_id,
        "Pergunta",
        serialize_pergunta,
        PERGUNTA_FIELDS,
        partial=True,
        required_fields=PERGUNTA_REQUIRED_FIELDS,
    )


@api_bp.delete("/perguntas/<int:pergunta_id>")
def delete_pergunta(pergunta_id: int):
    return delete_entity(Pergunta, pergunta_id, "Pergunta")


@api_bp.get("/relatorios")
def list_relatorios():
    return list_entities(Relatorio, serialize_relatorio)


@api_bp.post("/relatorios")
def create_relatorio():
    return create_entity(
        Relatorio,
        serialize_relatorio,
        RELATORIO_FIELDS,
        RELATORIO_REQUIRED_FIELDS,
    )


@api_bp.get("/relatorios/<int:relatorio_id>")
def get_relatorio(relatorio_id: int):
    item = get_or_404(Relatorio, relatorio_id, "Relatorio")
    return jsonify(serialize_relatorio(item))


@api_bp.put("/relatorios/<int:relatorio_id>")
def replace_relatorio(relatorio_id: int):
    return update_entity(
        Relatorio,
        relatorio_id,
        "Relatorio",
        serialize_relatorio,
        RELATORIO_FIELDS,
        partial=False,
        required_fields=RELATORIO_REQUIRED_FIELDS,
    )


@api_bp.patch("/relatorios/<int:relatorio_id>")
def update_relatorio(relatorio_id: int):
    return update_entity(
        Relatorio,
        relatorio_id,
        "Relatorio",
        serialize_relatorio,
        RELATORIO_FIELDS,
        partial=True,
        required_fields=RELATORIO_REQUIRED_FIELDS,
    )


@api_bp.delete("/relatorios/<int:relatorio_id>")
def delete_relatorio(relatorio_id: int):
    return delete_entity(Relatorio, relatorio_id, "Relatorio")


@api_bp.get("/respostas-usuario")
def list_respostas_usuario():
    return list_entities(RespostaUsuario, serialize_resposta_usuario)


@api_bp.post("/respostas-usuario")
def create_resposta_usuario():
    return create_entity(
        RespostaUsuario,
        serialize_resposta_usuario,
        RESPOSTA_USUARIO_FIELDS,
        RESPOSTA_USUARIO_REQUIRED_FIELDS,
    )


@api_bp.get("/respostas-usuario/<int:resposta_usuario_id>")
def get_resposta_usuario(resposta_usuario_id: int):
    item = get_or_404(RespostaUsuario, resposta_usuario_id, "Resposta do usuario")
    return jsonify(serialize_resposta_usuario(item))


@api_bp.put("/respostas-usuario/<int:resposta_usuario_id>")
def replace_resposta_usuario(resposta_usuario_id: int):
    return update_entity(
        RespostaUsuario,
        resposta_usuario_id,
        "Resposta do usuario",
        serialize_resposta_usuario,
        RESPOSTA_USUARIO_FIELDS,
        partial=False,
        required_fields=RESPOSTA_USUARIO_REQUIRED_FIELDS,
    )


@api_bp.patch("/respostas-usuario/<int:resposta_usuario_id>")
def update_resposta_usuario(resposta_usuario_id: int):
    return update_entity(
        RespostaUsuario,
        resposta_usuario_id,
        "Resposta do usuario",
        serialize_resposta_usuario,
        RESPOSTA_USUARIO_FIELDS,
        partial=True,
        required_fields=RESPOSTA_USUARIO_REQUIRED_FIELDS,
    )


@api_bp.delete("/respostas-usuario/<int:resposta_usuario_id>")
def delete_resposta_usuario(resposta_usuario_id: int):
    return delete_entity(RespostaUsuario, resposta_usuario_id, "Resposta do usuario")
