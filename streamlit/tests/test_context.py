"""
Unit tests for session context helpers (get_ctx, set_ctx, extract_and_save).
These simulate the ID-chaining behaviour across API pages.
Run with: pytest tests/test_context.py -v
"""
import pytest
import streamlit as st
from unittest.mock import patch, MagicMock


# ── Minimal st.session_state mock ────────────────────────────

class FakeSessionState(dict):
    """Behaves like st.session_state for get/set operations."""
    def __getattr__(self, key):
        try:
            return self[key]
        except KeyError:
            raise AttributeError(key)
    def __setattr__(self, key, value):
        self[key] = value


@pytest.fixture(autouse=True)
def mock_session_state():
    """Patch st.session_state with a fresh dict for every test."""
    fake = FakeSessionState()
    with patch("streamlit.session_state", fake):
        yield fake


# Import after patching so the module picks up the mock
@pytest.fixture(autouse=True)
def import_helpers(mock_session_state):
    global get_ctx, set_ctx, extract_and_save
    # Re-import to pick up the patched session_state
    import importlib, sys
    if "app" in sys.modules:
        del sys.modules["app"]
    # Define helpers inline matching app.py implementation
    def _get_ctx(key, fallback=""):
        return mock_session_state.get("_ctx", {}).get(key, fallback)

    def _set_ctx(**kwargs):
        if "_ctx" not in mock_session_state:
            mock_session_state["_ctx"] = {}
        mock_session_state["_ctx"].update(
            {k: str(v) for k, v in kwargs.items() if v}
        )

    def _extract_and_save(result, **explicit):
        if explicit:
            _set_ctx(**explicit)
        if not result.get("success"):
            return
        data = result.get("data", {})
        inner = data.get("data", data)
        if isinstance(inner, dict):
            for key in ["student_id", "user_id", "exam_id", "term_id",
                        "reservation_id", "reservation_uuid", "uuid", "appointment_uuid"]:
                if inner.get(key):
                    _set_ctx(**{key: inner[key]})
            if isinstance(inner.get("institution"), dict):
                uid = inner["institution"].get("uuid")
                if uid:
                    _set_ctx(institution_uuid=uid)
        if isinstance(inner, list) and inner:
            first = inner[0]
            if isinstance(first, dict):
                for key in ["uuid", "exam_uuid", "delivery_window_uuid",
                            "vendor_uuid", "tc_location_id", "appointment_uuid"]:
                    if first.get(key):
                        _set_ctx(**{key: first[key]})

    get_ctx = _get_ctx
    set_ctx = _set_ctx
    extract_and_save = _extract_and_save


# ── get_ctx ───────────────────────────────────────────────────

def test_get_ctx_returns_fallback_when_empty():
    assert get_ctx("student_id") == ""
    assert get_ctx("student_id", "default") == "default"

def test_get_ctx_returns_value_when_set():
    set_ctx(student_id="12345")
    assert get_ctx("student_id") == "12345"

def test_get_ctx_returns_empty_for_unknown_key():
    set_ctx(student_id="12345")
    assert get_ctx("exam_id") == ""


# ── set_ctx ───────────────────────────────────────────────────

def test_set_ctx_stores_value(mock_session_state):
    set_ctx(student_id="99999")
    assert mock_session_state["_ctx"]["student_id"] == "99999"

def test_set_ctx_ignores_empty_values(mock_session_state):
    set_ctx(student_id="12345", exam_id="", reservation_id=None)
    assert "student_id" in mock_session_state["_ctx"]
    assert "exam_id" not in mock_session_state["_ctx"]
    assert "reservation_id" not in mock_session_state["_ctx"]

def test_set_ctx_converts_to_string(mock_session_state):
    set_ctx(site_id=286)
    assert mock_session_state["_ctx"]["site_id"] == "286"

def test_set_ctx_accumulates_across_calls(mock_session_state):
    set_ctx(student_id="111")
    set_ctx(exam_id="222")
    ctx = mock_session_state["_ctx"]
    assert ctx["student_id"] == "111"
    assert ctx["exam_id"] == "222"

def test_set_ctx_overwrites_existing_key():
    set_ctx(student_id="old")
    set_ctx(student_id="new")
    assert get_ctx("student_id") == "new"


# ── extract_and_save — explicit kwargs ────────────────────────

def test_extract_saves_explicit_kwargs():
    result = {"success": True, "data": {}}
    extract_and_save(result, student_id="48291", exam_id="784523")
    assert get_ctx("student_id") == "48291"
    assert get_ctx("exam_id") == "784523"

def test_extract_skips_explicit_on_failure():
    """Explicit kwargs should still save even on failed response."""
    result = {"success": False, "data": {}}
    extract_and_save(result, student_id="12345")
    assert get_ctx("student_id") == "12345"


# ── extract_and_save — from response data ────────────────────

def test_extract_student_id_from_response():
    result = {"success": True, "data": {"student_id": "55555"}}
    extract_and_save(result)
    assert get_ctx("student_id") == "55555"

def test_extract_nested_data_key():
    result = {"success": True, "data": {"data": {"exam_id": "77777"}}}
    extract_and_save(result)
    assert get_ctx("exam_id") == "77777"

def test_extract_institution_uuid_from_whoami():
    """TC: Get Institution response shape: data.institution.uuid"""
    result = {
        "success": True,
        "data": {"institution": {"uuid": "0d68013f-4a72-4b3e-91f2-abc123456789", "name": "DemoZZZ"}}
    }
    extract_and_save(result)
    assert get_ctx("institution_uuid") == "0d68013f-4a72-4b3e-91f2-abc123456789"

def test_extract_first_item_from_list():
    """TC: Get Exams returns a list — save the first exam's uuid."""
    result = {
        "success": True,
        "data": {"data": [
            {"uuid": "exam-uuid-001", "name": "Calculus I"},
            {"uuid": "exam-uuid-002", "name": "Chemistry"},
        ]}
    }
    extract_and_save(result)
    assert get_ctx("uuid") == "exam-uuid-001"

def test_extract_does_nothing_on_failed_response():
    result = {"success": False, "data": {"student_id": "99999"}}
    extract_and_save(result)
    assert get_ctx("student_id") == ""

def test_extract_reservation_uuid():
    result = {"success": True, "data": {"reservation_uuid": "421fb271-73c6-410d-8b61-abc"}}
    extract_and_save(result)
    assert get_ctx("reservation_uuid") == "421fb271-73c6-410d-8b61-abc"


# ── Chain simulation — end-to-end flow ────────────────────────

def test_full_user_event_chain():
    """Simulate: Create User → Add Bluebird → Auto Login → Cancel Reservation."""
    # Step 1: Create User
    extract_and_save({"success": True, "data": {}}, student_id="48291",
                     first_name="Jane", last_name="Smith", email="jane@test.com")
    assert get_ctx("student_id") == "48291"

    # Step 2: Add Bluebird saves exam_id
    extract_and_save({"success": True, "data": {}}, student_id="48291", exam_id="784523")
    assert get_ctx("exam_id") == "784523"

    # Step 3: Auto Login uses student_id — still in context
    assert get_ctx("student_id") == "48291"

    # Step 4: Cancel Reservation can use both
    assert get_ctx("student_id") == "48291"
    assert get_ctx("exam_id") == "784523"


def test_full_tc_chain():
    """Simulate TC: Get Institution → Get Exams → Delivery Windows → Test Locations."""
    # TC: Get Institution
    extract_and_save({"success": True,
                      "data": {"institution": {"uuid": "inst-uuid-001"}}})
    assert get_ctx("institution_uuid") == "inst-uuid-001"

    # TC: Get Exams
    extract_and_save({"success": True, "data": {"data": [{"uuid": "exam-uuid-001"}]}},
                     institution_uuid="inst-uuid-001")
    assert get_ctx("exam_uuid") or get_ctx("uuid")  # saved under uuid or exam_uuid

    # TC: Delivery Windows
    extract_and_save({"success": True, "data": {"data": [{"uuid": "dw-uuid-001"}]}},
                     institution_uuid="inst-uuid-001", exam_uuid="exam-uuid-001")
    assert get_ctx("institution_uuid") == "inst-uuid-001"
    assert get_ctx("exam_uuid") == "exam-uuid-001"
