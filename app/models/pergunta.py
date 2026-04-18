from app.extensions import db


class Pergunta(db.Model):
    __tablename__ = "pergunta"
    pergunta_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    pergunta = db.Column(db.String, nullable=False)
    formulario_id = db.Column(db.BigInteger, db.ForeignKey("formulario.formulario_id"), nullable=False)
    pontuacao = db.Column(db.Integer, nullable=True)
    respostas = db.relationship("RespostaUsuario", backref="pergunta", lazy="dynamic")

    def to_dict(self):
        return {
            "pergunta_id": self.pergunta_id, "pergunta": self.pergunta,
            "formulario_id": self.formulario_id, "pontuacao": self.pontuacao,
        }
