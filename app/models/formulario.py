from app.extensions import db


class Formulario(db.Model):
    __tablename__ = "formulario"
    formulario_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    titulo = db.Column(db.Text, nullable=False)
    role_id = db.Column(db.BigInteger, db.ForeignKey("cargo.cargo_id"), nullable=False)
    perguntas = db.relationship("Pergunta", backref="formulario", lazy="dynamic")
    submissoes = db.relationship("Submissao", backref="formulario", lazy="dynamic")

    def to_dict(self, include_perguntas=False):
        data = {"formulario_id": self.formulario_id, "titulo": self.titulo, "role_id": self.role_id}
        if include_perguntas:
            data["perguntas"] = [p.to_dict() for p in self.perguntas]
        return data
