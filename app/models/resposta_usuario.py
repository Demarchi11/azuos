from app.extensions import db


class RespostaUsuario(db.Model):
    __tablename__ = "resposta_usuario"
    resposta_usuario_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    resposta = db.Column(db.String, nullable=False)
    pergunta_id = db.Column(db.BigInteger, db.ForeignKey("pergunta.pergunta_id"), nullable=False)
    submissao_id = db.Column(db.BigInteger, db.ForeignKey("submissao.submissao_id"), nullable=False)

    def to_dict(self):
        return {
            "resposta_usuario_id": self.resposta_usuario_id, "resposta": self.resposta,
            "pergunta_id": self.pergunta_id, "submissao_id": self.submissao_id,
        }
