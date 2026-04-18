from app.extensions import db


class Cargo(db.Model):
    __tablename__ = "cargo"
    cargo_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    nome = db.Column(db.BigInteger, nullable=False)
    usuarios = db.relationship("Usuario", backref="cargo", lazy="dynamic")
    formularios = db.relationship("Formulario", backref="cargo", lazy="dynamic")

    def to_dict(self):
        return {"cargo_id": self.cargo_id, "nome": self.nome}
