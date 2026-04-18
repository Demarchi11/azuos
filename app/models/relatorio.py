from datetime import date
from app.extensions import db


class Relatorio(db.Model):
    __tablename__ = "relatorio"
    relatorio_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    conteudo = db.Column(db.Text, nullable=False)
    data_criacao = db.Column(db.Date, default=date.today)
    submissao_id = db.Column(db.BigInteger, db.ForeignKey("submissao.submissao_id"), nullable=False, unique=True)

    def to_dict(self):
        return {
            "relatorio_id": self.relatorio_id, "conteudo": self.conteudo,
            "data_criacao": self.data_criacao.isoformat() if self.data_criacao else None,
            "submissao_id": self.submissao_id,
        }
