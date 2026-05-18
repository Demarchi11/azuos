from __future__ import annotations

import json
import mimetypes
import secrets
from copy import deepcopy
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Lock
from urllib.parse import urlparse
from uuid import uuid4


BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "FrontEnd"
STORE_PATH = Path(__file__).resolve().parent / "app_data.json"
STORE_LOCK = Lock()

STORE_TEMPLATE = {
    "users": [],
    "sessions": [],
    "submissions": [],
}

ROLE_LABELS = {
    "lider": "Lider",
    "funcionario": "Funcionario",
}

ANALYSIS_STATUS_LABELS = {
    "pending": "Aguardando analise",
    "completed": "Analise pronta",
}

SECTION_ROLE_RULES = {
    "dilemas": "lider",
    "liderados": "funcionario",
}


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def ensure_store() -> None:
    if STORE_PATH.exists():
        return

    STORE_PATH.write_text(
        json.dumps(STORE_TEMPLATE, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def read_store() -> dict:
    ensure_store()
    with STORE_LOCK:
        return json.loads(STORE_PATH.read_text(encoding="utf-8"))


def mutate_store(callback):
    ensure_store()
    with STORE_LOCK:
        data = json.loads(STORE_PATH.read_text(encoding="utf-8"))
        result = callback(data)
        STORE_PATH.write_text(
            json.dumps(data, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        return result


def sanitize_user(user: dict | None) -> dict | None:
    if not user:
        return None

    return {
        "id": user["id"],
        "name": user["name"],
        "username": user["username"],
        "role": user["role"],
        "role_label": ROLE_LABELS.get(user["role"], "Usuario"),
        "department": user.get("department", ""),
        "position": user.get("position", ""),
        "leader_id": user.get("leader_id"),
        "created_at": user.get("created_at"),
    }


def get_user_initials(name: str) -> str:
    parts = [part for part in (name or "").split() if part]
    if not parts:
        return "--"
    return "".join(part[0] for part in parts[:2]).upper()


def find_user_by_username(data: dict, username: str):
    username_key = (username or "").strip().lower()
    for user in data["users"]:
        if user["username"].strip().lower() == username_key:
            return user
    return None


def get_user_lookup(data: dict) -> dict:
    return {user["id"]: user for user in data["users"]}


def create_session(data: dict, user_id: str) -> str:
    token = secrets.token_urlsafe(32)
    data["sessions"] = [
        session for session in data["sessions"] if session["user_id"] != user_id
    ]
    data["sessions"].append(
        {
            "token": token,
            "user_id": user_id,
            "created_at": utc_now_iso(),
        }
    )
    return token


def get_current_user(headers) -> dict | None:
    token = ""
    authorization = (headers.get("Authorization") or "").strip()
    if authorization.lower().startswith("bearer "):
        token = authorization[7:].strip()
    else:
        token = (headers.get("X-Auth-Token") or "").strip()

    if not token:
        return None

    data = read_store()
    session = next(
        (item for item in data["sessions"] if item["token"] == token),
        None,
    )
    if not session:
        return None

    return next(
        (item for item in data["users"] if item["id"] == session["user_id"]),
        None,
    )


def create_user_record(payload: dict, role: str, leader_id=None) -> dict:
    return {
        "id": str(uuid4()),
        "name": payload["name"].strip(),
        "username": payload["username"].strip(),
        "password": payload["password"],
        "role": role,
        "department": payload.get("department", "").strip(),
        "position": payload.get("position", "").strip(),
        "leader_id": leader_id,
        "created_at": utc_now_iso(),
    }


def create_submission_record(user: dict, payload: dict) -> dict:
    section_id = (payload.get("section_id") or "").strip()
    section_title = (payload.get("section_title") or "").strip()
    responses = payload.get("responses") or []
    total_questions = int(payload.get("total_questions") or len(responses))

    target_user_id = user["id"]
    if user.get("role") == "funcionario" and section_id == "liderados":
        target_user_id = user.get("leader_id") or user["id"]

    return {
        "id": str(uuid4()),
        "section_id": section_id,
        "section_title": section_title or "Formulario",
        "submitted_by_user_id": user["id"],
        "target_user_id": target_user_id,
        "submitted_at": utc_now_iso(),
        "answered_count": len(responses),
        "total_questions": total_questions,
        "analysis_status": "pending",
        "score": None,
        "analysis_summary": None,
        "responses": deepcopy(responses),
    }


def serialize_submission(submission: dict | None, user_lookup: dict) -> dict | None:
    if not submission:
        return None

    submitted_by = user_lookup.get(submission["submitted_by_user_id"])
    target_user = user_lookup.get(submission.get("target_user_id"))

    return {
        "id": submission["id"],
        "section_id": submission["section_id"],
        "section_title": submission["section_title"],
        "submitted_at": submission["submitted_at"],
        "answered_count": submission["answered_count"],
        "total_questions": submission["total_questions"],
        "analysis_status": submission["analysis_status"],
        "analysis_status_label": ANALYSIS_STATUS_LABELS.get(
            submission["analysis_status"],
            submission["analysis_status"],
        ),
        "score": submission.get("score"),
        "analysis_summary": submission.get("analysis_summary"),
        "report_status": "available"
        if submission.get("analysis_status") == "completed"
        else "pending",
        "submitted_by": sanitize_user(submitted_by),
        "target_user": sanitize_user(target_user),
    }


def get_score_status(score):
    if score is None:
        return None
    if score >= 85:
        return "acima"
    if score >= 65:
        return "dentro"
    if score >= 50:
        return "abaixo"
    return "critico"


def get_group_user_ids(user: dict, users: list[dict]) -> set[str]:
    if user["role"] == "lider":
        return {
            item["id"]
            for item in users
            if item["id"] == user["id"] or item.get("leader_id") == user["id"]
        }

    leader_id = user.get("leader_id")
    if not leader_id:
        return {user["id"]}

    return {
        item["id"]
        for item in users
        if item["id"] == leader_id or item.get("leader_id") == leader_id
    }


def response(status: int, payload: dict):
    return status, payload


def error_response(message: str, status: int = 400):
    return response(status, {"message": message})


def health_check():
    data = read_store()
    return response(
        200,
        {
            "status": "ok",
            "bootstrap_required": not any(
                user["role"] == "lider" for user in data["users"]
            ),
        },
    )


def bootstrap_status():
    data = read_store()
    bootstrap_required = not any(
        user["role"] == "lider" for user in data["users"]
    )
    return response(200, {"bootstrap_required": bootstrap_required})


def bootstrap_leader(payload):
    if not isinstance(payload, dict):
        return error_response("Envie os dados da lideranca inicial.")

    required_fields = ["name", "username", "password"]
    if any(not payload.get(field) for field in required_fields):
        return error_response("Preencha nome, usuario e senha para continuar.")

    def action(data):
        if any(user["role"] == "lider" for user in data["users"]):
            raise ValueError("A lideranca inicial ja foi criada.")

        if find_user_by_username(data, payload["username"]):
            raise KeyError("Ja existe um usuario com esse login.")

        user = create_user_record(payload, "lider")
        data["users"].append(user)
        token = create_session(data, user["id"])
        return user, token

    try:
        user, token = mutate_store(action)
    except ValueError as error:
        return error_response(str(error), 409)
    except KeyError as error:
        return error_response(str(error), 409)

    return response(
        200,
        {
            "token": token,
            "name": user["name"],
            "role": user["role"],
            "user": sanitize_user(user),
        },
    )


def login(payload):
    if not isinstance(payload, dict):
        return error_response("Envie usuario e senha para entrar.")

    username = (payload.get("username") or "").strip()
    password = payload.get("password") or ""
    if not username or not password:
        return error_response("Usuario e senha sao obrigatorios.")

    def action(data):
        user = find_user_by_username(data, username)
        if not user or user["password"] != password:
            raise ValueError("Usuario ou senha invalidos.")
        token = create_session(data, user["id"])
        return user, token

    try:
        user, token = mutate_store(action)
    except ValueError as error:
        return error_response(str(error), 401)

    return response(
        200,
        {
            "token": token,
            "name": user["name"],
            "role": user["role"],
            "user": sanitize_user(user),
        },
    )


def dashboard_me(user):
    data = read_store()
    user_lookup = get_user_lookup(data)
    own_submissions = [
        submission
        for submission in data["submissions"]
        if submission["submitted_by_user_id"] == user["id"]
    ]
    own_submissions.sort(key=lambda item: item["submitted_at"], reverse=True)

    latest_completed = next(
        (
            submission
            for submission in own_submissions
            if submission["analysis_status"] == "completed"
        ),
        None,
    )

    team_members = []
    for member in data["users"]:
        if member.get("leader_id") != user["id"]:
            continue

        member_submissions = [
            submission
            for submission in data["submissions"]
            if submission["submitted_by_user_id"] == member["id"]
        ]
        member_submissions.sort(
            key=lambda item: item["submitted_at"],
            reverse=True,
        )

        serialized_member = sanitize_user(member)
        serialized_member["submission_count"] = len(member_submissions)
        serialized_member["latest_submission"] = serialize_submission(
            member_submissions[0] if member_submissions else None,
            user_lookup,
        )
        team_members.append(serialized_member)

    return response(
        200,
        {
            "user": sanitize_user(user),
            "metrics": {
                "total_submissions": len(own_submissions),
                "pending_analyses": sum(
                    1
                    for submission in own_submissions
                    if submission["analysis_status"] == "pending"
                ),
                "completed_analyses": sum(
                    1
                    for submission in own_submissions
                    if submission["analysis_status"] == "completed"
                ),
                "team_members_count": len(team_members),
            },
            "latest_analysis": serialize_submission(latest_completed, user_lookup),
            "recent_submissions": [
                serialize_submission(submission, user_lookup)
                for submission in own_submissions[:5]
            ],
            "team_members": team_members[:5],
        },
    )


def list_team_members(user):
    data = read_store()
    user_lookup = get_user_lookup(data)

    if user["role"] == "lider":
        members = [
            item for item in data["users"] if item.get("leader_id") == user["id"]
        ]
        leader = user
    else:
        leader = user_lookup.get(user.get("leader_id"))
        members = []
        if leader:
            members = [
                item
                for item in data["users"]
                if item.get("leader_id") == leader["id"]
            ]

    submissions_by_user = {}
    for submission in data["submissions"]:
        submissions_by_user.setdefault(
            submission["submitted_by_user_id"], []
        ).append(submission)

    serialized_members = []
    for member in members:
        member_submissions = sorted(
            submissions_by_user.get(member["id"], []),
            key=lambda item: item["submitted_at"],
            reverse=True,
        )
        serialized = sanitize_user(member)
        serialized["submission_count"] = len(member_submissions)
        serialized["latest_submission"] = serialize_submission(
            member_submissions[0] if member_submissions else None,
            user_lookup,
        )
        serialized_members.append(serialized)

    return response(
        200,
        {
            "can_manage": user["role"] == "lider",
            "leader": sanitize_user(leader),
            "members": serialized_members,
        },
    )


def create_team_member(user, payload):
    if user.get("role") != "lider":
        return error_response("Apenas lideres podem acessar este recurso.", 403)

    if not isinstance(payload, dict):
        return error_response("Envie os dados do funcionario.")

    required_fields = ["name", "username", "password"]
    if any(not payload.get(field) for field in required_fields):
        return error_response("Preencha nome, usuario e senha do funcionario.")

    def action(data):
        if find_user_by_username(data, payload["username"]):
            raise ValueError("Ja existe um usuario com esse login.")

        member = create_user_record(payload, "funcionario", leader_id=user["id"])
        data["users"].append(member)
        return member

    try:
        member = mutate_store(action)
    except ValueError as error:
        return error_response(str(error), 409)

    return response(201, {"member": sanitize_user(member)})


def list_my_submissions(user):
    data = read_store()
    user_lookup = get_user_lookup(data)
    items = [
        submission
        for submission in data["submissions"]
        if submission["submitted_by_user_id"] == user["id"]
    ]
    items.sort(key=lambda item: item["submitted_at"], reverse=True)
    return response(
        200,
        {
            "items": [
                serialize_submission(submission, user_lookup)
                for submission in items
            ]
        },
    )


def create_submission(user, payload):
    if not isinstance(payload, dict):
        return error_response("Envie as respostas do formulario.")

    responses = payload.get("responses")
    if not isinstance(responses, list) or not responses:
        return error_response("Nenhuma resposta foi enviada.")

    section_id = (payload.get("section_id") or "").strip()
    section_title = (payload.get("section_title") or "").strip()
    if not section_id or not section_title:
        return error_response("Informe o bloco do formulario enviado.")

    expected_role = SECTION_ROLE_RULES.get(section_id)
    if expected_role and user.get("role") != expected_role:
        return error_response(
            "Este bloco nao esta liberado para o perfil atual.",
            403,
        )

    submission = create_submission_record(user, payload)

    def action(data):
        data["submissions"].append(submission)
        return submission, get_user_lookup(data)

    created_submission, user_lookup = mutate_store(action)
    return response(
        201,
        {
            "message": "Respostas recebidas. A analise sera preenchida pelo backend.",
            "submission": serialize_submission(created_submission, user_lookup),
        },
    )


def ranking(user):
    data = read_store()
    users = data["users"]
    group_user_ids = get_group_user_ids(user, users)
    user_lookup = get_user_lookup(data)
    latest_scores = {}

    completed_submissions = [
        submission
        for submission in data["submissions"]
        if submission["analysis_status"] == "completed"
        and submission.get("target_user_id") in group_user_ids
        and submission.get("score") is not None
    ]
    completed_submissions.sort(key=lambda item: item["submitted_at"], reverse=True)

    for submission in completed_submissions:
        subject_id = submission.get("target_user_id")
        if subject_id not in latest_scores:
            latest_scores[subject_id] = submission

    items = []
    for subject_id, submission in latest_scores.items():
        subject = user_lookup.get(subject_id)
        if not subject:
            continue
        score = submission.get("score")
        items.append(
            {
                "user_id": subject["id"],
                "name": subject["name"],
                "initials": get_user_initials(subject["name"]),
                "dept": subject.get("department", ""),
                "position": subject.get("position", ""),
                "score": score,
                "status": get_score_status(score),
                "section_title": submission["section_title"],
                "submitted_at": submission["submitted_at"],
            }
        )

    items.sort(key=lambda item: item["score"], reverse=True)
    return response(200, {"items": items})


class AppHandler(BaseHTTPRequestHandler):
    server_version = "AzuosHTTP/1.0"

    def do_GET(self):
        path = urlparse(self.path).path

        if path == "/api/health":
            self.send_json(*health_check())
            return

        if path == "/api/auth/bootstrap-status":
            self.send_json(*bootstrap_status())
            return

        if path == "/api/dashboard/me":
            user = get_current_user(self.headers)
            if not user:
                self.send_json(*error_response("Sessao invalida ou expirada.", 401))
                return
            self.send_json(*dashboard_me(user))
            return

        if path == "/api/team/members":
            user = get_current_user(self.headers)
            if not user:
                self.send_json(*error_response("Sessao invalida ou expirada.", 401))
                return
            self.send_json(*list_team_members(user))
            return

        if path == "/api/forms/submissions/me":
            user = get_current_user(self.headers)
            if not user:
                self.send_json(*error_response("Sessao invalida ou expirada.", 401))
                return
            self.send_json(*list_my_submissions(user))
            return

        if path == "/api/ranking":
            user = get_current_user(self.headers)
            if not user:
                self.send_json(*error_response("Sessao invalida ou expirada.", 401))
                return
            self.send_json(*ranking(user))
            return

        self.serve_static(path)

    def do_POST(self):
        path = urlparse(self.path).path
        payload = self.read_json_body()

        if path == "/api/auth/bootstrap":
            self.send_json(*bootstrap_leader(payload))
            return

        if path == "/api/auth/login":
            self.send_json(*login(payload))
            return

        if path == "/api/team/members":
            user = get_current_user(self.headers)
            if not user:
                self.send_json(*error_response("Sessao invalida ou expirada.", 401))
                return
            self.send_json(*create_team_member(user, payload))
            return

        if path == "/api/forms/submissions":
            user = get_current_user(self.headers)
            if not user:
                self.send_json(*error_response("Sessao invalida ou expirada.", 401))
                return
            self.send_json(*create_submission(user, payload))
            return

        self.send_json(*error_response("Recurso nao encontrado.", 404))

    def log_message(self, _format, *_args):
        return

    def read_json_body(self):
        content_length = int(self.headers.get("Content-Length") or 0)
        if content_length <= 0:
            return None

        raw = self.rfile.read(content_length).decode("utf-8")
        if not raw:
            return None

        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return None

    def send_json(self, status: int, payload: dict):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def serve_static(self, raw_path: str):
        relative_path = raw_path.lstrip("/") or "index.html"
        candidate = (FRONTEND_DIR / relative_path).resolve()

        if not str(candidate).startswith(str(FRONTEND_DIR.resolve())):
            self.send_json(*error_response("Recurso nao encontrado.", 404))
            return

        if candidate.is_dir():
            candidate = candidate / "index.html"

        if not candidate.exists() or not candidate.is_file():
            candidate = FRONTEND_DIR / "index.html"

        content = candidate.read_bytes()
        content_type = mimetypes.guess_type(str(candidate))[0] or "text/plain"

        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)


def run_server():
    ensure_store()
    server = ThreadingHTTPServer(("127.0.0.1", 5000), AppHandler)
    print("Servidor Azuos ativo em http://127.0.0.1:5000")
    server.serve_forever()


if __name__ == "__main__":
    run_server()
