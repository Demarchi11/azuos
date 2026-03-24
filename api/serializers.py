from datetime import datetime

from .models import Departamento, Formulario, Pergunta, Relatorio, RespostaUsuario, Usuario


def serialize_departamento(departamento: Departamento) -> dict:
    return {
        "departamento_id": departamento.departamento_id,
        "nome": departamento.nome,
    }


def serialize_usuario(usuario: Usuario) -> dict:
    return {
        "usuario_id": usuario.usuario_id,
        "nome": usuario.nome,
        "cpf": usuario.cpf,
        "email": usuario.email,
        "registro": usuario.registro,
        "role": usuario.role,
        "senha": usuario.senha,
        "lider": usuario.lider,
        "departamento_id": usuario.departamento_id,
    }


def serialize_formulario(formulario: Formulario) -> dict:
    return {
        "formulario_id": formulario.formulario_id,
        "titulo": formulario.titulo,
        "role": formulario.role,
    }


def serialize_pergunta(pergunta: Pergunta) -> dict:
    return {
        "pergunta_id": pergunta.pergunta_id,
        "pergunta": pergunta.pergunta,
        "formulario_id": pergunta.formulario_id,
    }


def serialize_relatorio(relatorio: Relatorio) -> dict:
    created_at = relatorio.data_de_criacao
    if isinstance(created_at, datetime):
        created_at = created_at.isoformat()

    return {
        "relatorio_id": relatorio.relatorio_id,
        "documento": relatorio.documento,
        "data_de_criacao": created_at,
    }


def serialize_resposta_usuario(resposta_usuario: RespostaUsuario) -> dict:
    return {
        "resposta_usuario_id": resposta_usuario.resposta_usuario_id,
        "usuario_id": resposta_usuario.usuario_id,
        "pergunta_id": resposta_usuario.pergunta_id,
        "relatorio_id": resposta_usuario.relatorio_id,
        "resposta": resposta_usuario.resposta,
    }
