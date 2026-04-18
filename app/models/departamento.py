from app.extensions import db


class Departamento(db.Model):
    __tablename__ = "departamento"
    departamento_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    nome = db.Column(db.String, nullable=False)
    usuarios = db.relationship("Usuario", backref="departamento", lazy="dynamic")

    def to_dict(self):
        return {"departamento_id": self.departamento_id, "nome": self.nome}
