"""
Layout prototype — 3-panel design preview.
Run with: streamlit run prototype.py
No real API calls, just the shell.
"""
import streamlit as st
import json

st.set_page_config(
    page_title="Layout Prototype",
    page_icon="🔬",
    layout="wide",
)

st.markdown("""
<style>
  [data-testid="stSidebar"] { background: #1e293b; }
  [data-testid="stSidebar"] * { color: #e2e8f0 !important; }
  [data-testid="stSidebar"] hr { border-color: #334155 !important; }

  /* Right panel card */
  .ctx-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 14px 16px;
  }
  .ctx-section { font-size: 10px; font-weight: 700; color: #94a3b8;
                 text-transform: uppercase; letter-spacing: 0.08em; margin: 12px 0 6px; }
  .ctx-row { display: flex; justify-content: space-between; align-items: center;
             padding: 5px 8px; border-radius: 5px; margin-bottom: 3px; background: white;
             border: 1px solid #f1f5f9; }
  .ctx-key   { font-size: 11px; color: #64748b; font-family: monospace; }
  .ctx-value { font-size: 11px; color: #0f172a; font-family: monospace; font-weight: 600; }
  .ctx-empty { font-size: 11px; color: #cbd5e1; font-family: monospace; }
  .ctx-badge { font-size: 10px; background: #dcfce7; color: #166534;
               padding: 1px 6px; border-radius: 10px; font-weight: 600; }
</style>
""", unsafe_allow_html=True)

# ── Sidebar ───────────────────────────────────────────────────
with st.sidebar:
    st.markdown("### 🔬 API Playground")
    st.markdown("---")
    selection = st.radio(
        "nav",
        ["── User Events ──", "Create User", "Auto Login", "Add Bluebird",
         "Record+", "Get Terms", "Get Reservations", "Cancel Reservation",
         "── Test Center API ──", "TC: Get Institution", "TC: Get Exams"],
        label_visibility="collapsed",
        format_func=lambda x: f"  {x}" if x.startswith("──") else x,
    )

# ── Fake session context (simulates what gets populated after calls) ──
# Toggle this to see empty vs. populated states
SIMULATE_FILLED = st.sidebar.checkbox("Simulate: session has data", value=True)

fake_ctx = {}
if SIMULATE_FILLED:
    fake_ctx = {
        "student_id":          "48291",
        "exam_id":             "784523",
        "reservation_id":      "456456456",
        "reservation_uuid":    "421fb271-73c6-410d-8b61-2cdd91404e0e",
        "institution_uuid":    "0d68013f-4a72-4b3e-91f2-abc123456789",
        "exam_uuid":           "",
        "delivery_window_uuid":"",
        "vendor_uuid":         "",
        "tc_location_id":      "",
        "appointment_uuid":    "",
    }

# ── Main 2-column split (middle + right) ─────────────────────
main_col, ctx_col = st.columns([3, 1], gap="large")

# ══════════════════════════════
# MIDDLE — API form area
# ══════════════════════════════
with main_col:
    # Page header
    st.markdown("**`POST`** `api.proctoru.com/api/autoLogin/`")
    st.title("Auto Login")
    st.caption("Generates a one-time SSO login URL for a student.")

    # Show a hint if student_id is in context
    sid_from_ctx = fake_ctx.get("student_id", "")
    if sid_from_ctx:
        st.info(f"💡 **student_id `{sid_from_ctx}`** is available from a previous call — pre-filled below.")

    with st.form("auto_login_demo"):
        c1, c2 = st.columns(2)
        student_id = c1.text_input(
            "student_id",
            value=sid_from_ctx,                   # ← from context, not random
            placeholder="Run Create User first",
        )
        email = c2.text_input("email", value="jane.smith4829@yopmail.com")
        c3, c4 = st.columns(2)
        first_name = c3.text_input("first_name", value="Jane")
        last_name  = c4.text_input("last_name",  value="Smith")
        submitted  = st.form_submit_button("⚡ Send Request", use_container_width=True)

    if submitted:
        st.success("✅ 200 OK  (demo — no real call made)")
        st.json({"response_code": 1, "message": "success",
                 "data": {"url": "https://go.proctoru.com/students/sso?token=abc123"}})

    st.divider()

    # Show what the response viewer looks like
    st.markdown("##### Response preview")
    tab1, tab2 = st.tabs(["📨 Response", "📤 Request Details"])
    with tab1:
        st.success("✅ 200 OK")
        st.json({"response_code": 1, "message": "success",
                 "data": {"url": "https://go.proctoru.com/students/sso?token=demo_token_xyz"}})
    with tab2:
        c1, c2, c3 = st.columns(3)
        c1.metric("Method", "POST")
        c2.metric("Content-Type", "form-encoded")
        c3.metric("Status", "200")
        st.code("https://api.proctoru.com/api/autoLogin/", language="text")
        st.json({"student_id": student_id, "email": email,
                 "first_name": first_name, "last_name": last_name})

# ══════════════════════════════
# RIGHT — Session context panel
# ══════════════════════════════
with ctx_col:
    st.markdown("#### 📋 Session Data")
    st.caption("IDs captured from successful calls this session.")

    if not any(fake_ctx.values()):
        st.markdown(
            "<div class='ctx-card'><span style='font-size:12px;color:#94a3b8'>"
            "No data yet — make an API call to start populating this panel.</span></div>",
            unsafe_allow_html=True,
        )
    else:
        # Student section
        student_keys = ["student_id", "reservation_id", "reservation_uuid"]
        exam_keys    = ["exam_id"]
        tc_keys      = ["institution_uuid", "exam_uuid", "delivery_window_uuid",
                        "vendor_uuid", "tc_location_id", "appointment_uuid"]

        def render_ctx_section(title, keys):
            st.markdown(f"<div class='ctx-section'>{title}</div>", unsafe_allow_html=True)
            for k in keys:
                v = fake_ctx.get(k, "")
                if v:
                    st.markdown(
                        f"<div class='ctx-row'>"
                        f"<span class='ctx-key'>{k}</span>"
                        f"<span class='ctx-value'>{v[:12]}{'…' if len(v)>12 else ''}</span>"
                        f"</div>",
                        unsafe_allow_html=True,
                    )
                else:
                    st.markdown(
                        f"<div class='ctx-row'>"
                        f"<span class='ctx-key'>{k}</span>"
                        f"<span class='ctx-empty'>—</span>"
                        f"</div>",
                        unsafe_allow_html=True,
                    )

        with st.container(border=True):
            render_ctx_section("Student / Reservation", student_keys)
            render_ctx_section("Exam", exam_keys)
            render_ctx_section("Test Center Chain", tc_keys)

        st.markdown("")
        if st.button("🗑 Clear session data", use_container_width=True):
            st.session_state["_ctx"] = {}
            st.rerun()

    # Show which page feeds which
    st.markdown("---")
    st.markdown("##### How data flows")
    st.markdown("""
<div style='font-size:11px; color:#64748b; line-height:1.8'>
🟢 <b>Create User</b> → student_id<br>
🟢 <b>Add Bluebird</b> → exam_id<br>
🟢 <b>Record+</b> → reservation_uuid<br>
🟢 <b>Get Terms</b> → term_id<br>
🟢 <b>TC: Get Institution</b> → institution_uuid<br>
🟢 <b>TC: Get Exams</b> → exam_uuid<br>
🟢 <b>TC: Delivery Windows</b> → delivery_window_uuid<br>
🟢 <b>TC: Test Locations</b> → vendor_uuid, tc_location_id<br>
🟢 <b>TC: Post Appointment</b> → appointment_uuid
</div>
""", unsafe_allow_html=True)
