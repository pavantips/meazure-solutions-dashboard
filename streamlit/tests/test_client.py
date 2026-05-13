"""
Unit tests for api/client.py
Tests cover helper functions, URL construction, auth headers, and error handling.
Run with: pytest tests/test_client.py -v
"""
import pytest
import responses
import requests
from unittest.mock import patch, MagicMock
from api.client import (
    _auth_headers, _wrap, _err, now_iso,
    post_json, post_form, get_params, post_with_query, delete_req, post_external,
    API_BASE, DEMO_BASE, GO_BASE, TC_BASE, TC_GO_BASE, MEAZURE_BASE,
)


# ── Fixtures ──────────────────────────────────────────────────

FAKE_TOKEN = "test-token-abc123"
FAKE_URL   = "https://api.proctoru.com/api/testEndpoint"


@pytest.fixture(autouse=True)
def patch_auth_token():
    """Replace the real auth token with a test value for all tests."""
    with patch("api.client.AUTH_TOKEN", FAKE_TOKEN):
        yield


# ── now_iso ───────────────────────────────────────────────────

def test_now_iso_format():
    ts = now_iso()
    assert ts.endswith("Z"), "Timestamp must end with Z (UTC)"
    assert "T" in ts, "Timestamp must be ISO 8601 with T separator"
    assert len(ts) == 20, f"Expected 20 chars, got {len(ts)}: {ts}"


# ── _auth_headers ─────────────────────────────────────────────

def test_auth_headers_default():
    h = _auth_headers()
    assert h["Authorization-Token"] == FAKE_TOKEN
    assert h["Content-Type"] == "application/json"

def test_auth_headers_form_encoded():
    h = _auth_headers("application/x-www-form-urlencoded")
    assert h["Authorization-Token"] == FAKE_TOKEN
    assert h["Content-Type"] == "application/x-www-form-urlencoded"

def test_auth_headers_no_bearer_prefix():
    """Token must NOT use Bearer prefix — ProctorU uses raw token."""
    h = _auth_headers()
    assert not h["Authorization-Token"].startswith("Bearer")


# ── _wrap ─────────────────────────────────────────────────────

def test_wrap_success():
    mock_resp = MagicMock()
    mock_resp.ok = True
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"response_code": 1, "message": "success"}
    meta = {"url": FAKE_URL, "method": "POST"}
    result = _wrap(mock_resp, meta)
    assert result["success"] is True
    assert result["status"] == 200
    assert result["data"]["response_code"] == 1
    assert result["_request"] == meta

def test_wrap_failure():
    mock_resp = MagicMock()
    mock_resp.ok = False
    mock_resp.status_code = 401
    mock_resp.json.return_value = {"message": "Unauthorized"}
    result = _wrap(mock_resp, {})
    assert result["success"] is False
    assert result["status"] == 401

def test_wrap_business_error_response_code_2():
    """HTTP 200 with response_code=2 must be treated as failure (e.g. 'no available slots')."""
    mock_resp = MagicMock()
    mock_resp.ok = True
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "response_code": 2,
        "message": "no available slots : Error count 0 of 50",
        "data": {},
    }
    result = _wrap(mock_resp, {})
    assert result["success"] is False, "response_code=2 must set success=False even on HTTP 200"
    assert result["status"] == 200

def test_wrap_no_response_code_treated_as_success():
    """TC API responses have no response_code — absence should not fail the call."""
    mock_resp = MagicMock()
    mock_resp.ok = True
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"institution": {"uuid": "abc-123"}}
    result = _wrap(mock_resp, {})
    assert result["success"] is True

def test_wrap_non_json_response():
    mock_resp = MagicMock()
    mock_resp.ok = True
    mock_resp.status_code = 200
    mock_resp.json.side_effect = ValueError("No JSON")
    mock_resp.text = "plain text response"
    result = _wrap(mock_resp, {})
    assert result["data"] == {"raw": "plain text response"}


# ── _err ──────────────────────────────────────────────────────

def test_err_network_error():
    exc = Exception("Connection refused")
    result = _err(exc, {"url": FAKE_URL})
    assert result["success"] is False
    assert result["status"] == 0
    assert "Connection refused" in result["data"]["error"]

def test_err_http_error_with_response():
    mock_resp = MagicMock()
    mock_resp.status_code = 404
    mock_resp.json.return_value = {"message": "Not found"}
    exc = MagicMock()
    exc.response = mock_resp
    exc.__str__ = lambda self: "404"
    result = _err(exc, {})
    assert result["status"] == 404
    assert result["success"] is False


# ── post_json ─────────────────────────────────────────────────

@responses.activate
def test_post_json_success():
    responses.add(responses.POST, FAKE_URL,
                  json={"response_code": 1}, status=200)
    result = post_json(FAKE_URL, {"student_id": "12345"})
    assert result["success"] is True
    assert result["status"] == 200
    assert result["_request"]["method"] == "POST"
    assert result["_request"]["contentType"] == "application/json"
    assert result["_request"]["body"]["student_id"] == "12345"

@responses.activate
def test_post_json_sends_auth_header():
    responses.add(responses.POST, FAKE_URL, json={}, status=200)
    post_json(FAKE_URL, {})
    assert responses.calls[0].request.headers["Authorization-Token"] == FAKE_TOKEN

@responses.activate
def test_post_json_error_response():
    responses.add(responses.POST, FAKE_URL,
                  json={"message": "Bad Request"}, status=400)
    result = post_json(FAKE_URL, {})
    assert result["success"] is False
    assert result["status"] == 400


# ── post_form ─────────────────────────────────────────────────

@responses.activate
def test_post_form_success():
    responses.add(responses.POST, FAKE_URL,
                  json={"response_code": 1}, status=200)
    result = post_form(FAKE_URL, {"student_id": "12345", "email": "test@test.com"})
    assert result["success"] is True
    assert result["_request"]["contentType"] == "application/x-www-form-urlencoded"

@responses.activate
def test_post_form_skips_empty_values():
    responses.add(responses.POST, FAKE_URL, json={}, status=200)
    post_form(FAKE_URL, {"student_id": "12345", "notes": "", "empty": None})
    body = responses.calls[0].request.body
    assert "student_id=12345" in body
    assert "notes" not in body
    assert "empty" not in body

@responses.activate
def test_post_form_sends_auth_header():
    responses.add(responses.POST, FAKE_URL, json={}, status=200)
    post_form(FAKE_URL, {"key": "val"})
    assert responses.calls[0].request.headers["Authorization-Token"] == FAKE_TOKEN
    assert "x-www-form-urlencoded" in responses.calls[0].request.headers["Content-Type"]


# ── get_params ────────────────────────────────────────────────

@responses.activate
def test_get_params_success():
    responses.add(responses.GET, FAKE_URL,
                  json={"data": [{"id": 1}]}, status=200)
    result = get_params(FAKE_URL, {"term_id": "42", "time_sent": "2026-01-01T00:00:00Z"})
    assert result["success"] is True
    assert result["_request"]["method"] == "GET"

@responses.activate
def test_get_params_skips_empty():
    responses.add(responses.GET, FAKE_URL, json={}, status=200)
    get_params(FAKE_URL, {"term_id": "42", "empty": "", "none_val": None})
    qs = responses.calls[0].request.url
    assert "term_id=42" in qs
    assert "empty" not in qs
    assert "none_val" not in qs

@responses.activate
def test_get_params_sends_auth_header():
    responses.add(responses.GET, FAKE_URL, json={}, status=200)
    get_params(FAKE_URL, {})
    assert responses.calls[0].request.headers["Authorization-Token"] == FAKE_TOKEN


# ── post_with_query ───────────────────────────────────────────

@responses.activate
def test_post_with_query_combines_params_and_body():
    responses.add(responses.POST, FAKE_URL, json={}, status=200)
    post_with_query(FAKE_URL,
                    {"time_sent": "2026-01-01T00:00:00Z", "duration": "60"},
                    {"student_id": "99"})
    req = responses.calls[0].request
    assert "time_sent" in req.url
    assert "duration=60" in req.url

@responses.activate
def test_post_with_query_none_body():
    """Slots endpoint sends POST with query params but no body."""
    responses.add(responses.POST, FAKE_URL, json={}, status=200)
    result = post_with_query(FAKE_URL, {"isadhoc": "Y", "duration": "60"}, None)
    assert result["success"] is True


# ── delete_req ────────────────────────────────────────────────

@responses.activate
def test_delete_req_success():
    responses.add(responses.DELETE, FAKE_URL, json={}, status=200)
    result = delete_req(FAKE_URL)
    assert result["success"] is True
    assert result["_request"]["method"] == "DELETE"

@responses.activate
def test_delete_req_sends_auth_header():
    responses.add(responses.DELETE, FAKE_URL, json={}, status=200)
    delete_req(FAKE_URL)
    assert responses.calls[0].request.headers["Authorization-Token"] == FAKE_TOKEN


# ── post_external ─────────────────────────────────────────────

@responses.activate
def test_post_external_no_auth_header():
    """Meazure endpoint must NOT receive Authorization-Token header."""
    responses.add(responses.POST, FAKE_URL, json={}, status=200)
    post_external(FAKE_URL, {"token": "meazure-token", "user": {}})
    headers = responses.calls[0].request.headers
    assert "Authorization-Token" not in headers

@responses.activate
def test_post_external_sends_json():
    responses.add(responses.POST, FAKE_URL, json={"id": 1}, status=201)
    result = post_external(FAKE_URL, {"token": "abc", "user": {"email": "x@x.com"}})
    assert result["success"] is True
    assert result["status"] == 201


# ── Base URL constants ────────────────────────────────────────

def test_base_urls_are_set():
    assert API_BASE.startswith("https://")
    assert DEMO_BASE.startswith("https://")
    assert GO_BASE.startswith("https://")
    assert TC_BASE.startswith("https://")
    assert TC_GO_BASE.startswith("https://")
    assert MEAZURE_BASE.startswith("https://")

def test_all_user_events_use_api_base():
    """All User Event endpoints must route through api.proctoru.com."""
    assert "api.proctoru.com" in API_BASE

def test_tc_base_uses_v2():
    assert "/v2" in TC_BASE
    assert "/v2" in TC_GO_BASE


# ── Report endpoints (form-encoded POST to api.proctoru.com) ──

@responses.activate
def test_bluebird_client_activity_uses_api_base():
    """bluebirdclientActivityReport must POST to api.proctoru.com, not go.proctoru.com."""
    url = f"{API_BASE}/bluebirdclientActivityReport/"
    responses.add(responses.POST, url, json={"response_code": 1}, status=200)
    result = post_form(url, {"student_id": "365", "start_date": "2017-11-29",
                             "end_date": "2020-11-30", "time_sent": "2026-01-01T00:00:00Z"})
    assert result["success"] is True
    assert "api.proctoru.com" in responses.calls[0].request.url

@responses.activate
def test_bluebird_client_activity_form_encoded():
    """bluebirdclientActivityReport must use application/x-www-form-urlencoded."""
    url = f"{API_BASE}/bluebirdclientActivityReport/"
    responses.add(responses.POST, url, json={}, status=200)
    post_form(url, {"student_id": "365", "start_date": "2017-11-29", "end_date": "2020-11-30"})
    assert "x-www-form-urlencoded" in responses.calls[0].request.headers["Content-Type"]

@responses.activate
def test_client_activity_report_uses_api_base():
    """clientActivityReport must POST to api.proctoru.com."""
    url = f"{API_BASE}/clientActivityReport/"
    responses.add(responses.POST, url, json={"response_code": 1}, status=200)
    result = post_form(url, {"student_id": "365", "start_date": "2018-08-30",
                             "end_date": "2018-08-30", "time_sent": "2026-01-01T00:00:00Z"})
    assert result["success"] is True
    assert "api.proctoru.com" in responses.calls[0].request.url

@responses.activate
def test_client_activity_report_form_encoded():
    url = f"{API_BASE}/clientActivityReport/"
    responses.add(responses.POST, url, json={}, status=200)
    post_form(url, {"student_id": "365", "start_date": "2018-08-30", "end_date": "2018-08-30"})
    assert "x-www-form-urlencoded" in responses.calls[0].request.headers["Content-Type"]

@responses.activate
def test_pending_exam_report_uses_api_base():
    """pendingExamReport must POST to api.proctoru.com."""
    url = f"{API_BASE}/pendingExamReport/"
    responses.add(responses.POST, url, json={"response_code": 1}, status=200)
    result = post_form(url, {"student_id": "365", "start_date": "2014-08-29",
                             "end_date": "2021-08-29", "time_sent": "2026-01-01T00:00:00Z"})
    assert result["success"] is True
    assert "api.proctoru.com" in responses.calls[0].request.url

@responses.activate
def test_pending_exam_report_form_encoded():
    url = f"{API_BASE}/pendingExamReport/"
    responses.add(responses.POST, url, json={}, status=200)
    post_form(url, {"student_id": "365", "start_date": "2014-08-29", "end_date": "2021-08-29"})
    assert "x-www-form-urlencoded" in responses.calls[0].request.headers["Content-Type"]

@responses.activate
def test_report_sends_auth_header():
    """All 3 report endpoints must include Authorization-Token header."""
    for endpoint in ["bluebirdclientActivityReport", "clientActivityReport", "pendingExamReport"]:
        url = f"{API_BASE}/{endpoint}/"
        responses.add(responses.POST, url, json={}, status=200)
        post_form(url, {"student_id": "365"})
    for call in responses.calls:
        assert call.request.headers["Authorization-Token"] == FAKE_TOKEN

@responses.activate
def test_report_skips_empty_params():
    """Reports must not forward empty/None params in form body."""
    url = f"{API_BASE}/clientActivityReport/"
    responses.add(responses.POST, url, json={}, status=200)
    post_form(url, {"student_id": "365", "start_date": "", "end_date": None})
    body = responses.calls[0].request.body
    assert "student_id=365" in body
    assert "start_date" not in body
    assert "end_date" not in body
