"""
Shared API client — mirrors the Node proxy helper functions.
Auth tokens are loaded from .env and never exposed to the UI.
"""
import os
import requests
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

# ── Base URLs ─────────────────────────────────────────────────
API_BASE    = os.getenv("PROCTORU_API_BASE",  "https://api.proctoru.com/api")
DEMO_BASE   = os.getenv("PROCTORU_DEMO_BASE", "https://demo.proctoru.com/api")
GO_BASE     = os.getenv("PROCTORU_GO_BASE",   "https://go.proctoru.com/api")
TC_BASE     = os.getenv("TC_API_BASE",        "https://api.proctoru.com/api/v2")
TC_GO_BASE  = os.getenv("TC_GO_BASE",         "https://go.proctoru.com/api/v2")
MEAZURE_BASE = os.getenv("MEAZURE_API_BASE",  "https://api.ysasecure.com/v2")

AUTH_TOKEN    = os.getenv("PROCTORU_AUTH_TOKEN", "")
MEAZURE_TOKEN = os.getenv("MEAZURE_TOKEN", "")


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _auth_headers(content_type: str = "application/json") -> dict:
    return {"Authorization-Token": AUTH_TOKEN, "Content-Type": content_type}


def _wrap(resp: requests.Response, meta: dict) -> dict:
    try:
        data = resp.json()
    except Exception:
        data = {"raw": resp.text}
    return {"success": resp.ok, "status": resp.status_code, "data": data, "_request": meta}


def _err(e: Exception, meta: dict) -> dict:
    msg = str(e)
    if hasattr(e, "response") and e.response is not None:
        try:
            data = e.response.json()
        except Exception:
            data = {"raw": e.response.text}
        return {"success": False, "status": e.response.status_code, "data": data, "_request": meta}
    return {"success": False, "status": 0, "data": {"error": msg}, "_request": meta}


# ── Helpers ───────────────────────────────────────────────────

def post_json(url: str, body: dict) -> dict:
    meta = {"url": url, "method": "POST", "contentType": "application/json", "body": body}
    try:
        r = requests.post(url, json=body, headers=_auth_headers(), timeout=30)
        return _wrap(r, meta)
    except Exception as e:
        return _err(e, meta)


def post_form(url: str, body: dict) -> dict:
    clean = {k: str(v) for k, v in body.items() if v is not None and v != ""}
    meta = {"url": url, "method": "POST", "contentType": "application/x-www-form-urlencoded", "body": clean}
    try:
        r = requests.post(url, data=clean, headers=_auth_headers("application/x-www-form-urlencoded"), timeout=30)
        return _wrap(r, meta)
    except Exception as e:
        return _err(e, meta)


def get_params(url: str, params: dict) -> dict:
    clean = {k: v for k, v in params.items() if v is not None and v != ""}
    meta = {"url": url, "method": "GET", "params": clean}
    try:
        r = requests.get(url, params=clean, headers=_auth_headers(), timeout=30)
        return _wrap(r, meta)
    except Exception as e:
        return _err(e, meta)


def post_with_query(url: str, query_params: dict, body: dict | None = None) -> dict:
    clean_q = {k: v for k, v in query_params.items() if v is not None and v != ""}
    meta = {"url": url, "method": "POST", "queryParams": clean_q, "body": body}
    try:
        r = requests.post(url, json=body, params=clean_q, headers=_auth_headers(), timeout=30)
        return _wrap(r, meta)
    except Exception as e:
        return _err(e, meta)


def delete_req(url: str) -> dict:
    meta = {"url": url, "method": "DELETE"}
    try:
        r = requests.delete(url, headers=_auth_headers(), timeout=30)
        return _wrap(r, meta)
    except Exception as e:
        return _err(e, meta)


def post_external(url: str, body: dict) -> dict:
    """No Authorization-Token header — auth is embedded in the body (Meazure)."""
    meta = {"url": url, "method": "POST", "contentType": "application/json", "body": body}
    try:
        r = requests.post(url, json=body, headers={"Content-Type": "application/json"}, timeout=30)
        return _wrap(r, meta)
    except Exception as e:
        return _err(e, meta)
