from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class Departamento(Base):
    __tablename__ = "departamento"

    departamento_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nome: Mapped[str] = mapped_column(String(255), nullable=False)

    usuarios: Mapped[list["Usuario"]] = relationship("Usuario", back_populates="departamento")


class Usuario(Base):
    __tablename__ = "usuario"

    usuario_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nome: Mapped[str] = mapped_column(String(255), nullable=False)
    cpf: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    registro: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[str] = mapped_column(String(100), nullable=False)
    senha: Mapped[str] = mapped_column(String(255), nullable=False)
    lider: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    departamento_id: Mapped[int] = mapped_column(
        ForeignKey("departamento.departamento_id"),
        nullable=False,
    )

    departamento: Mapped["Departamento"] = relationship("Departamento", back_populates="usuarios")
    respostas: Mapped[list["RespostaUsuario"]] = relationship("RespostaUsuario", back_populates="usuario")


class Formulario(Base):
    __tablename__ = "formulario"

    formulario_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    titulo: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(100), nullable=False)

    perguntas: Mapped[list["Pergunta"]] = relationship("Pergunta", back_populates="formulario")


class Pergunta(Base):
    __tablename__ = "pergunta"

    pergunta_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    pergunta: Mapped[str] = mapped_column(Text, nullable=False)
    formulario_id: Mapped[int] = mapped_column(
        ForeignKey("formulario.formulario_id"),
        nullable=False,
    )

    formulario: Mapped["Formulario"] = relationship("Formulario", back_populates="perguntas")
    respostas: Mapped[list["RespostaUsuario"]] = relationship("RespostaUsuario", back_populates="pergunta_rel")


class Relatorio(Base):
    __tablename__ = "relatorio"

    relatorio_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    documento: Mapped[str] = mapped_column(Text, nullable=False)
    data_de_criacao: Mapped[DateTime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

    respostas: Mapped[list["RespostaUsuario"]] = relationship("RespostaUsuario", back_populates="relatorio")


class RespostaUsuario(Base):
    __tablename__ = "resposta_usuario"

    resposta_usuario_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuario.usuario_id"), nullable=False)
    pergunta_id: Mapped[int] = mapped_column(ForeignKey("pergunta.pergunta_id"), nullable=False)
    relatorio_id: Mapped[int] = mapped_column(ForeignKey("relatorio.relatorio_id"), nullable=False)
    resposta: Mapped[str] = mapped_column(Text, nullable=False)

    usuario: Mapped["Usuario"] = relationship("Usuario", back_populates="respostas")
    pergunta_rel: Mapped["Pergunta"] = relationship("Pergunta", back_populates="respostas")
    relatorio: Mapped["Relatorio"] = relationship("Relatorio", back_populates="respostas")
