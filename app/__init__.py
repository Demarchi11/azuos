from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db, ma


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Inicializar extensões
    db.init_app(app)
    ma.init_app(app)
    CORS(app)

    # Registrar blueprints
    from app.routes.auth import auth_bp
    from app.routes.cargos import cargos_bp
    from app.routes.departamentos import departamentos_bp
    from app.routes.usuarios import usuarios_bp
    from app.routes.formularios import formularios_bp
    from app.routes.submissoes import submissoes_bp
    from app.routes.relatorios import relatorios_bp
    from app.routes.perguntas import perguntas_bp
    from app.routes.respostas import respostas_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(cargos_bp, url_prefix="/api/cargos")
    app.register_blueprint(departamentos_bp, url_prefix="/api/departamentos")
    app.register_blueprint(usuarios_bp, url_prefix="/api/usuarios")
    app.register_blueprint(formularios_bp, url_prefix="/api/formularios")
    app.register_blueprint(submissoes_bp, url_prefix="/api/submissoes")
    app.register_blueprint(relatorios_bp, url_prefix="/api/relatorios")
    app.register_blueprint(perguntas_bp, url_prefix="/api/perguntas")
    app.register_blueprint(respostas_bp, url_prefix="/api/respostas")

    # Health check
    @app.route("/api/health")
    def health():
        return {"status": "ok"}

    return app
