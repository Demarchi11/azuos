from datetime import datetime

from flask import abort, request


def get_json_payload() -> dict:
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        abort(400, description="Envie um JSON valido no corpo da requisicao.")
    return payload


def parse_boolean(value):
    if isinstance(value, bool):
        return value

    normalized = str(value).strip().lower()
    if normalized in {"true", "1", "yes", "y", "on"}:
        return True
    if normalized in {"false", "0", "no", "n", "off"}:
        return False
    raise ValueError("Booleano invalido.")


def parse_datetime(value):
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        return datetime.fromisoformat(value)
    raise ValueError("Data invalida.")


def apply_data(
    instance,
    payload: dict,
    field_parsers: dict,
    partial: bool,
    required_fields: set[str] | None = None,
) -> None:
    missing_fields = []
    required_fields = required_fields or set()

    for field_name, parser in field_parsers.items():
        if field_name not in payload:
            if not partial and field_name in required_fields:
                missing_fields.append(field_name)
            continue

        raw_value = payload[field_name]
        value = parser(raw_value) if parser else raw_value
        setattr(instance, field_name, value)

    if missing_fields:
        abort(
            400,
            description=(
                "Campos obrigatorios ausentes: " + ", ".join(sorted(missing_fields))
            ),
        )


def get_pagination() -> tuple[int, int]:
    limit = request.args.get("limit", default=50, type=int)
    offset = request.args.get("offset", default=0, type=int)

    if limit < 1 or limit > 200:
        abort(400, description="O parametro limit deve estar entre 1 e 200.")
    if offset < 0:
        abort(400, description="O parametro offset deve ser maior ou igual a zero.")

    return limit, offset
