from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from .db import remove_session
from .routes import api_bp


def create_app() -> Flask:
    app = Flask(__name__)
    app.register_blueprint(api_bp, url_prefix="/api")

    @app.get("/health")
    def healthcheck():
        return jsonify({"status": "ok"})

    @app.teardown_appcontext
    def shutdown_session(_exception=None):
        remove_session()

    @app.errorhandler(IntegrityError)
    def handle_integrity_error(error):
        remove_session()
        return (
            jsonify(
                {
                    "error": "Violacao de integridade no banco de dados.",
                    "details": str(error.orig),
                }
            ),
            409,
        )

    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        return (
            jsonify(
                {
                    "error": error.name,
                    "details": error.description,
                }
            ),
            error.code,
        )

    @app.errorhandler(SQLAlchemyError)
    def handle_database_error(error):
        remove_session()
        return (
            jsonify(
                {
                    "error": "Erro ao acessar o banco de dados.",
                    "details": str(error),
                }
            ),
            500,
        )

    return app
