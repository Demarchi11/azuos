from app.extensions import db


class Usuario(db.Model):
    __tablename__ = "usuario"
    usuario_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    nome = db.Column(db.String, nullable=False)
    cpf = db.Column(db.String, nullable=False, unique=True)
    email = db.Column(db.Text, nullable=False, unique=True)
    role_id = db.Column(db.BigInteger, db.ForeignKey("cargo.cargo_id"), nullable=False)
    senha = db.Column(db.String, nullable=False)
    lider = db.Column(db.Boolean, default=False)
    departamento_id = db.Column(db.BigInteger, db.ForeignKey("departamento.departamento_id"), nullable=True)
    submissoes = db.relationship("Submissao", backref="usuario", lazy="dynamic")

    def to_dict(self, include_senha=False):
        data = {
            "usuario_id": self.usuario_id, "nome": self.nome, "cpf": self.cpf,
            "email": self.email, "role_id": self.role_id, "lider": self.lider,
            "departamento_id": self.departamento_id,
        }
        if include_senha:
            data["senha"] = self.senha
        return data
