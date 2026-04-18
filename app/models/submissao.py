from app.extensions import db


class Submissao(db.Model):
    __tablename__ = "submissao"
    submissao_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    usuario_id = db.Column(db.BigInteger, db.ForeignKey("usuario.usuario_id"), nullable=False)
    formulario_id = db.Column(db.BigInteger, db.ForeignKey("formulario.formulario_id"), nullable=False)
    data_inicio = db.Column(db.Date, nullable=True)
    data_fim = db.Column(db.Date, nullable=True)
    pontuacao = db.Column(db.BigInteger, nullable=True)
    respostas = db.relationship("RespostaUsuario", backref="submissao", lazy="dynamic")
    relatorio = db.relationship("Relatorio", backref="submissao", uselist=False)

    def to_dict(self, include_respostas=False):
        data = {
            "submissao_id": self.submissao_id, "usuario_id": self.usuario_id,
            "formulario_id": self.formulario_id,
            "data_inicio": self.data_inicio.isoformat() if self.data_inicio else None,
            "data_fim": self.data_fim.isoformat() if self.data_fim else None,
            "pontuacao": self.pontuacao,
        }
        if include_respostas:
            data["respostas"] = [r.to_dict() for r in self.respostas]
        return data
