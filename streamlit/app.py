"""
Meazure Solutions — API Integration Playground (Streamlit)
3-panel layout: sidebar nav | API form + response | session context
"""
import uuid
import random
import streamlit as st
from datetime import datetime, timezone, timedelta
from api.client import (
    API_BASE, DEMO_BASE, GO_BASE, TC_BASE, TC_GO_BASE, MEAZURE_BASE, MEAZURE_TOKEN,
    now_iso, post_json, post_form, get_params, post_with_query, delete_req, post_external,
)

st.set_page_config(page_title="Customer LMS or CMS application", page_icon="🔬", layout="wide")

st.markdown("""
<style>
  [data-testid="stSidebar"] { background: #1e293b; }
  [data-testid="stSidebar"] * { color: #e2e8f0 !important; }
  .ctx-section { font-size: 10px; font-weight: 700; color: #94a3b8;
                 text-transform: uppercase; letter-spacing: 0.08em; margin: 10px 0 5px; }
  .ctx-row { display: flex; justify-content: space-between; align-items: center;
             padding: 5px 8px; border-radius: 5px; margin-bottom: 3px;
             background: white; border: 1px solid #f1f5f9; }
  .ctx-key   { font-size: 11px; color: #64748b; font-family: monospace; }
  .ctx-value { font-size: 11px; color: #0f172a; font-family: monospace; font-weight: 600; }
  .ctx-empty { font-size: 11px; color: #cbd5e1; font-family: monospace; }
</style>
""", unsafe_allow_html=True)


# ══════════════════════════════════════════════════════════════
# HOME PAGE
# ══════════════════════════════════════════════════════════════

def page_home():
    st.markdown("""
    <h1 style="font-size: 32px; font-weight: 700; color: #111827; margin-bottom: 8px;">
      Customer LMS or CMS Application
    </h1>
    <p style="font-size: 16px; color: #6b7280; margin-bottom: 40px;">
      Select a role and interface to get started
    </p>
    """, unsafe_allow_html=True)

    categories = [
        {'title': 'Proctoru', 'subtitle': 'Admin Interface', 'icon': '🔧', 'color': '#3b82f6', 'desc': 'Manage users and exams'},
        {'title': 'Proctoru', 'subtitle': 'Candidate Interface', 'icon': '👤', 'color': '#8b5cf6', 'desc': 'Schedule and take exams'},
        {'title': 'Meazure Exam Platform', 'subtitle': 'Admin Interface', 'icon': '⚙️', 'color': '#10b981', 'desc': 'Manage Meazure users'},
        {'title': 'Meazure Exam Platform', 'subtitle': 'Candidate Interface', 'icon': '📚', 'color': '#06b6d4', 'desc': 'Access Meazure platform'},
        {'title': 'LTI LMS Apps', 'subtitle': 'Learning Management Systems', 'icon': '🏫', 'color': '#f59e0b', 'desc': 'Canvas, Moodle, D2L'},
        {'title': 'Test Center Apps', 'subtitle': 'Admin Interface', 'icon': '🏛️', 'color': '#ef4444', 'desc': 'Manage test centers'},
        {'title': 'Test Center Apps', 'subtitle': 'Candidate Interface', 'icon': '🎯', 'color': '#ec4899', 'desc': 'Schedule test center exams'},
    ]

    cols = st.columns(3)
    for idx, cat in enumerate(categories):
        with cols[idx % 3]:
            st.button(f"{cat['icon']}\n{cat['title']}\n{cat['subtitle']}", key=f"cat_{idx}", use_container_width=True)


# ══════════════════════════════════════════════════════════════
# SESSION CONTEXT — chain IDs across API calls
# ══════════════════════════════════════════════════════════════

def get_ctx(key: str, fallback: str = "") -> str:
    return st.session_state.get("_ctx", {}).get(key, fallback)

def set_ctx(**kwargs):
    if "_ctx" not in st.session_state:
        st.session_state["_ctx"] = {}
    st.session_state["_ctx"].update({k: str(v) for k, v in kwargs.items() if v})

def extract_and_save(result: dict, **explicit):
    """Save explicit keys + try to auto-extract known keys from the response."""
    if explicit:
        set_ctx(**explicit)
    if not result.get("success"):
        return
    # Walk the response data looking for known ID fields
    data = result.get("data", {})
    inner = data.get("data", data)
    if isinstance(inner, dict):
        for key in ["student_id", "user_id", "exam_id", "term_id",
                    "reservation_id", "reservation_uuid", "uuid",
                    "appointment_uuid"]:
            if inner.get(key):
                set_ctx(**{key: inner[key]})
        # TC: institution.uuid
        if isinstance(inner.get("institution"), dict):
            uid = inner["institution"].get("uuid")
            if uid:
                set_ctx(institution_uuid=uid)
    # TC: first item in a list
    if isinstance(inner, list) and inner:
        first = inner[0]
        if isinstance(first, dict):
            for key in ["uuid", "exam_uuid", "delivery_window_uuid",
                        "vendor_uuid", "tc_location_id", "appointment_uuid"]:
                if first.get(key):
                    set_ctx(**{key: first[key]})


# ── Navigation Structure ──────────────────────────────────────
NAVIGATION = {
    'Home': None,
    'Proctoru': {
        'Customer LMS or CMS App': {
            'Admin Interface': {
                'Create User':            ('POST', 'page_create_user'),
                'Add Bluebird':           ('POST', 'page_add_bluebird'),
                'Fulfill Record+':        ('POST', 'page_record_plus_fulfill'),
                'Create Exam':            ('POST', 'page_create_exam'),
                'Get Terms':              ('GET',  'page_get_terms'),
                'Get Departments':        ('GET',  'page_get_departments'),
                'Get Reservations':       ('GET',  'page_get_reservations'),
                'Cancel Reservation':     ('POST', 'page_cancel_reservation'),
                'Reports': {
                    'Bluebird Client Activity': ('POST', 'page_bluebird_client_activity'),
                    'Client Activity Report':   ('POST', 'page_client_activity_report'),
                    'Pending Exam Report':      ('POST', 'page_pending_exam_report'),
                }
            },
            'Candidate Interface': {
                'Add Adhoc':     ('POST', 'page_add_adhoc'),
                'Record+':       ('POST', 'page_record_plus'),
                'Auto Login':    ('POST', 'page_auto_login'),
            }
        }
    },
    'Meazure Exam Platform': {
        'Admin Interface': {
            'Admin Login':      ('LTI', 'page_admin_login_meazure'),
            'Create User':      ('POST', 'page_meazure_create_user'),
        },
        'Candidate Interface': {
            'Candidate Login':  ('LTI', 'page_candidate_login_meazure'),
        }
    },
    'LTI LMS Apps': {
        'Canvas':           ('LTI', 'page_canvas'),
        'Moodle':           ('LTI', 'page_moodle'),
        'D2L Brightspace':  ('LTI', 'page_d2l'),
    },
    'Test Center Apps': {
        'Customer LMS or CMS App': {
            'Admin Interface': {
                'Get Institution':    ('GET', 'page_tc_get_institution'),
                'Get Exams':          ('GET', 'page_tc_get_exams'),
                'Delivery Windows':   ('GET', 'page_tc_delivery_windows'),
                'Test Locations':     ('GET', 'page_tc_test_locations'),
                'Availability':       ('GET', 'page_tc_availability'),
                'Post Appointment':   ('POST', 'page_tc_post_appointment'),
                'Delete Appointment': ('DELETE', 'page_tc_delete_appointment'),
            },
            'Candidate Interface': {
                'Go to Proctoru.com': ('LINK', 'https://go.proctoru.com'),
            }
        }
    }
}

# ── Sidebar ───────────────────────────────────────────────────
PAGES = {
    "── User Events ──":          None,
    "Create User":                ("POST", None),
    "Auto Login":                 ("POST", None),
    "Add Bluebird":               ("POST", None),
    "Add Adhoc":                  ("POST", None),
    "Record+":                    ("POST", None),
    "Fulfill Record+":            ("POST", None),
    "Get Terms":                  ("GET",  None),
    "Get Departments":            ("GET",  None),
    "Create Exam":                ("POST", None),
    "Get Exams":                  ("GET",  None),
    "Get Availability":           ("POST", None),
    "Begin Reservation":          ("POST", None),
    "Get Reservations":           ("GET",  None),
    "Cancel Reservation":         ("POST", None),
    "── Reports ──":              None,
    "Bluebird Client Activity":  ("POST", None),
    "Client Activity Report":    ("POST", None),
    "Pending Exam Report":       ("POST", None),
    "── LTI ──":                  None,
    "Canvas":                     ("LTI", None),
    "Moodle":                     ("LTI", None),
    "D2L Brightspace":            ("LTI", None),
    "── Meazure Exam Platform ──":None,
    "Meazure: Create User":       ("POST", None),
    "Candidate Login":            ("LTI",  None),
    "Admin Login":                ("LTI",  None),
    "── Test Center API ──":      None,
    "TC: Get Institution":        ("GET",  None),
    "TC: Get Exams":              ("GET",  None),
    "TC: Delivery Windows":       ("GET",  None),
    "TC: Test Locations":         ("GET",  None),
    "TC: Availability":           ("GET",  None),
    "TC: Post Appointment":       ("POST", None),
    "TC: Delete Appointment":     ("DEL",  None),
}

with st.sidebar:
    st.markdown("### Customer LMS or CMS application")
    st.markdown("---")
    selection = st.radio(
        "nav", list(PAGES.keys()), label_visibility="collapsed",
        format_func=lambda x: f"  {x}" if x.startswith("──") else x,
    )

# Clear last result when navigating
if st.session_state.get("_page") != selection:
    st.session_state["_page"] = selection
    st.session_state.pop("last_result", None)


# ══════════════════════════════════════════════════════════════
# SHARED HELPERS
# ══════════════════════════════════════════════════════════════

FIRST_NAMES = ["James", "Emma", "Liam", "Olivia", "Noah", "Ava", "William", "Sophia"]
LAST_NAMES  = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller"]
EXAM_NAMES  = ["Introduction to Management", "Calculus I", "Business Ethics",
               "Data Structures", "Organic Chemistry", "Macroeconomics", "Civil Procedure"]
TIMEZONES   = ["Central Standard Time", "Eastern Standard Time", "Pacific Standard Time",
               "Mountain Standard Time", "UTC", "India Standard Time"]

def rand_name():      return random.choice(FIRST_NAMES), random.choice(LAST_NAMES)
def rand_email(f, l): return f"{f.lower()}.{l.lower()}{random.randint(1000,9999)}@yopmail.com"
def rand_id():        return str(random.randint(10000, 99999))
def rand_exam_id():   return str(random.randint(100000, 999999))
def new_uuid():       return str(uuid.uuid4())

def show_response(result):
    if not result:
        return
    # Launch button — shown above tabs when data.data.url is present
    _data  = result.get("data")
    _inner = _data.get("data") if isinstance(_data, dict) else None
    launch_url = _inner.get("url") if isinstance(_inner, dict) else None
    if launch_url:
        st.markdown(
            f"""<a href="{launch_url}" target="_blank"
                style="display:inline-flex;align-items:center;gap:8px;padding:9px 22px;
                       background:#14532d;color:#4ade80;border-radius:8px;font-size:14px;
                       font-weight:700;text-decoration:none;border:1px solid #166534;
                       margin-bottom:10px;">
              Launch
            </a>
            <span style="font-size:11px;color:#6b7280;margin-left:8px;font-family:monospace;">{launch_url[:80]}{"…" if len(launch_url) > 80 else ""}</span>""",
            unsafe_allow_html=True,
        )
    tab1, tab2 = st.tabs(["📨 Response", "📤 Request Details"])
    with tab1:
        status, ok = result.get("status", 0), result.get("success", False)
        if ok:
            st.success(f"✅ {status} OK")
        else:
            st.error(f"❌ {status} Error")
            # Show the API message prominently when the call failed
            api_msg = _data.get("message", "") if isinstance(_data, dict) else ""
            if api_msg:
                st.warning(f"**API says:** {api_msg}")
        st.json(result.get("data", {}))
    with tab2:
        req = result.get("_request", {})
        c1, c2, c3 = st.columns(3)
        c1.metric("Method", req.get("method", "—"))
        c2.metric("Content-Type", req.get("contentType", "—").split("/")[-1])
        c3.metric("Status", str(result.get("status", "—")))
        st.code(req.get("url", ""), language="text")
        body = req.get("body") or req.get("params") or req.get("queryParams")
        if body:
            st.json(body)

def ctx_hint(key):
    v = get_ctx(key)
    return f"💡 From session: {v}" if v else ""


# ══════════════════════════════════════════════════════════════
# PAGE FUNCTIONS
# ══════════════════════════════════════════════════════════════

def page_create_user():
    st.markdown("**`POST`** `api.proctoru.com/api/editStudent/`")
    st.title("Create User")
    st.caption("Creates or updates a student account. Saves student_id to session after success.")
    fn, ln = rand_name(); tag = random.randint(1000, 9999)
    with st.form("create_user"):
        c1, c2 = st.columns(2)
        first_name = c1.text_input("first_name", value=fn)
        last_name  = c2.text_input("last_name",  value=ln)
        email      = st.text_input("email",       value=rand_email(fn, ln))
        c3, c4 = st.columns(2)
        student_id = c3.text_input("student_id",  value=rand_id())
        phone      = c4.text_input("phone1",       value=f"312555{tag}")
        c5, c6 = st.columns(2)
        country    = c5.text_input("country",      value="US", max_chars=2)
        tz         = c6.selectbox("time_zone_id",  TIMEZONES)
        password   = st.text_input("user_password", value=f"Pass{tag}!")
        submitted  = st.form_submit_button("⚡ Send Request", use_container_width=True)
    if submitted:
        body = dict(first_name=first_name, last_name=last_name, email=email,
                    student_id=student_id, phone1=phone, country=country,
                    time_zone_id=tz, user_password=password, time_sent=now_iso())
        with st.spinner("Calling API..."):
            result = post_form(f"{API_BASE}/editStudent/", body)
        extract_and_save(result, student_id=student_id)
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_auto_login():
    st.markdown("**`POST`** `api.proctoru.com/api/autoLogin/`")
    st.title("Auto Login")
    st.caption("Generates a one-time SSO login URL for a student.")
    sid = get_ctx("student_id")
    if sid:
        st.info(f"💡 Using **student_id `{sid}`** from session — captured from a previous call.")
    fn, ln = rand_name()
    with st.form("auto_login"):
        c1, c2 = st.columns(2)
        student_id = c1.text_input("student_id", value=sid, placeholder="Run Create User first")
        email      = c2.text_input("email",       value=rand_email(fn, ln))
        c3, c4 = st.columns(2)
        first_name = c3.text_input("first_name",  value=fn)
        last_name  = c4.text_input("last_name",   value=ln)
        submitted  = st.form_submit_button("⚡ Send Request", use_container_width=True)
    if submitted:
        body = dict(student_id=student_id, email=email,
                    first_name=first_name, last_name=last_name, time_sent=now_iso())
        with st.spinner("Calling API..."):
            result = post_form(f"{API_BASE}/autoLogin/", body)
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_add_bluebird():
    st.markdown("**`POST`** `api.proctoru.com/api/addBlueBirdExam`")
    st.title("Add Bluebird")
    st.caption("Schedules a live-proctored Bluebird exam. Saves student_id and exam_id to session.")
    fn, ln = rand_name(); tag = random.randint(1000, 9999)
    with st.form("add_bluebird"):
        c1, c2 = st.columns(2)
        first_name  = c1.text_input("first_name",  value=fn)
        last_name   = c2.text_input("last_name",   value=ln)
        email       = st.text_input("email",        value=rand_email(fn, ln))
        c3, c4 = st.columns(2)
        student_id  = c3.text_input("student_id",  value=get_ctx("student_id") or rand_id())
        exam_id     = c4.text_input("exam_id",      value=rand_exam_id())
        description = st.text_input("description",  value=random.choice(EXAM_NAMES))
        c5, c6 = st.columns(2)
        duration    = c5.number_input("duration (min)", value=60, step=15)
        tz          = c6.selectbox("time_zone_id",  TIMEZONES)
        exam_url    = st.text_input("exam_url",     value="https://exam-demo.streamlit.app/")
        c7, c8 = st.columns(2)
        active_date = c7.text_input("active_date",  value=(datetime.now(timezone.utc) + timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ"))
        end_date    = c8.text_input("end_date",     value=(datetime.now(timezone.utc) + timedelta(days=8)).strftime("%Y-%m-%dT%H:%M:%SZ"))
        submitted   = st.form_submit_button("⚡ Send Request", use_container_width=True)
    if submitted:
        body = dict(first_name=first_name, last_name=last_name, email=email,
                    student_id=student_id, exam_id=exam_id, description=description,
                    duration=str(duration), time_zone_id=tz, exam_url=exam_url,
                    active_date=active_date, end_date=end_date, time_sent=now_iso())
        with st.spinner("Calling API..."):
            result = post_json(f"{API_BASE}/addBlueBirdExam", body)
        extract_and_save(result, student_id=student_id, exam_id=exam_id,
                         first_name=first_name, last_name=last_name, email=email)
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_add_adhoc():
    st.markdown("**`POST`** Two-step: Get Slots → Book")
    st.title("Add Adhoc")
    st.caption("Step 1 fetches available slots. Click a slot to pre-fill Step 2's start_date.")

    st.subheader("Step 1 — Get Available Slots")
    with st.form("adhoc_slots"):
        c1, c2 = st.columns(2)
        start_date = c1.text_input("start_date", value=(datetime.now(timezone.utc) + timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ"))
        duration   = c2.text_input("duration",   value="60")
        c3, c4 = st.columns(2)
        tz         = c3.selectbox("time_zone_id", TIMEZONES)
        takeitnow  = c4.selectbox("takeitnow",   ["Y", "N"])
        fetch      = st.form_submit_button("🔍 Get Available Slots", use_container_width=True)
    if fetch:
        with st.spinner("Fetching slots..."):
            result = post_with_query(f"{API_BASE}/getScheduleInfoAvailableTimesList/",
                {"time_sent": now_iso(), "time_zone_id": tz, "isadhoc": "Y",
                 "start_date": start_date, "takeitnow": takeitnow, "duration": duration}, None)
        st.session_state["adhoc_slots_result"] = result
        inner = result.get("data", {})
        for key in ["data", "slots", "available_times", "times"]:
            if isinstance(inner.get(key), list) and inner[key]:
                st.session_state["adhoc_slot_list"] = inner[key]
                break
    if "adhoc_slots_result" in st.session_state:
        show_response(st.session_state["adhoc_slots_result"])
    slot_list = st.session_state.get("adhoc_slot_list", [])
    selected_start = start_date
    if slot_list:
        st.markdown("**Available slots — select one:**")
        slot_times = [s.get("start_date") or s.get("start_time") or s.get("time") or str(s) for s in slot_list]
        selected_start = st.radio("Slot", slot_times, label_visibility="collapsed")

    st.divider()
    st.subheader("Step 2 — Book Adhoc Exam")
    fn, ln = rand_name(); tag = random.randint(1000, 9999)
    with st.form("add_adhoc"):
        c1, c2 = st.columns(2)
        first_name  = c1.text_input("first_name",    value=fn)
        last_name   = c2.text_input("last_name",     value=ln)
        email       = st.text_input("email",          value=rand_email(fn, ln))
        c3, c4 = st.columns(2)
        student_id  = c3.text_input("student_id",    value=get_ctx("student_id") or rand_id())
        user_pass   = c4.text_input("user_password", value=f"Pass{tag}!")
        tz2         = st.selectbox("time_zone_id", TIMEZONES, key="adhoc_tz2")
        description = st.text_input("description",   value=random.choice(EXAM_NAMES))
        c5, c6 = st.columns(2)
        duration2   = c5.text_input("duration",      value="120")
        dept_id     = c6.text_input("department_id", value="740364540")
        exam_url    = st.text_input("exam_url",      value="https://exam-demo.streamlit.app/")
        exam_pass   = st.text_input("exam_password", value=f"ExP{tag}")
        book_start  = st.text_input("start_date",    value=selected_start)
        c7, c8 = st.columns(2)
        res_id      = c7.text_input("reservation_id", value=rand_id())
        takeitnow2  = c8.selectbox("takeitnow", ["Y", "N"], key="adhoc_tin2")
        notes       = st.text_input("notes",          value="", placeholder="Optional")
        submitted   = st.form_submit_button("📅 Book Adhoc Exam", use_container_width=True)
    if submitted:
        body = dict(student_id=student_id, user_password=user_pass, first_name=first_name,
                    last_name=last_name, email=email, time_zone_id=tz2, description=description,
                    duration=duration2, notes=notes, start_date=book_start,
                    reservation_id=res_id, reservation_no="", takeitnow=takeitnow2,
                    exam_url=exam_url, exam_password=exam_pass, department_id=dept_id, url_return="")
        with st.spinner("Booking..."):
            result = post_json(f"{API_BASE}/addAdHocProcess", body)
        extract_and_save(result, student_id=student_id, reservation_id=res_id)
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_record_plus():
    st.markdown("**`POST`** `api.proctoru.com/api/exams/add_record_plus_exams`")
    st.title("Record+")
    st.caption("Creates a Record+ automated proctoring exam. Saves reservation_uuid to session for Fulfill step.")
    fn, ln = rand_name(); tag = random.randint(1000, 9999)
    with st.form("record_plus"):
        st.markdown("**Student**")
        c1, c2 = st.columns(2)
        first_name    = c1.text_input("first_name",    value=fn)
        last_name     = c2.text_input("last_name",     value=ln)
        c3, c4 = st.columns(2)
        student_id    = c3.text_input("student_id",    value=get_ctx("student_id") or rand_id())
        email         = c4.text_input("email",         value=rand_email(fn, ln))
        c5, c6 = st.columns(2)
        phone         = c5.text_input("phone1",        value=f"312555{str(tag)[:4]}")
        user_password = c6.text_input("user_password", value=f"Pass{tag}!")
        c7, c8 = st.columns(2)
        country       = c7.text_input("country",       value="US", max_chars=2)
        tz            = c8.selectbox("time_zone_id",   TIMEZONES)
        st.markdown("**Address** *(optional)*")
        address1      = st.text_input("Address1",      value="", placeholder="Street address (optional)")
        c9, c10 = st.columns(2)
        city          = c9.text_input("City",          value="", placeholder="Optional")
        state         = c10.text_input("State",        value="", placeholder="Optional")
        zipcode       = st.text_input("ZipCode",       value="", placeholder="Optional")
        st.markdown("**Exam**")
        c11, c12 = st.columns(2)
        exam_id       = c11.text_input("exam_id",      value=rand_exam_id())
        duration      = c12.number_input("duration (min)", value=90, step=15)
        description   = st.text_input("description (Exam Name)", value=random.choice(EXAM_NAMES))
        exam_url      = st.text_input("exam_url",      value="https://exam-demo.streamlit.app/")
        c13, c14 = st.columns(2)
        preset        = c13.selectbox("preset",        ["high", "medium", "low"])
        exam_password = c14.text_input("exam_password", value="password")
        submitted     = st.form_submit_button("⚡ Send Request", use_container_width=True)
    if submitted:
        body = dict(student_id=student_id, first_name=first_name, last_name=last_name,
                    email=email, Address1=address1, City=city, ZipCode=zipcode, State=state,
                    country=country, phone1=phone, user_password=user_password,
                    time_zone_id=tz, exam_id=exam_id, description=description,
                    exam_url=exam_url, duration=str(duration), preset=preset,
                    exam_password=exam_password)
        with st.spinner("Calling API..."):
            result = post_json(f"{API_BASE}/exams/add_record_plus_exams", body)
        extract_and_save(result, student_id=student_id, exam_id=exam_id)
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_record_plus_fulfill():
    st.markdown("**`POST`** `api.proctoru.com/api/exams/add_record_plus_exams/fulfill`")
    st.title("Fulfill Record+")
    st.caption("Step 2 of Record+: marks the session complete.")
    ruuid = get_ctx("reservation_uuid", "421fb271-73c6-410d-8b61-2cdd91404e0e")
    if get_ctx("reservation_uuid"):
        st.info(f"💡 Using **reservation_uuid** from session — captured from Record+ response.")
    else:
        st.info("💡 Copy the `reservation_uuid` from the Record+ response, or run Record+ first.")
    with st.form("record_plus_fulfill"):
        res_uuid  = st.text_input("reservation_uuid", value=ruuid,
                                   placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
        submitted = st.form_submit_button("✅ Fulfill Record+ Exam", use_container_width=True)
    if submitted:
        with st.spinner("Fulfilling..."):
            result = post_form(f"{API_BASE}/exams/add_record_plus_exams/fulfill",
                               {"reservation_uuid": res_uuid})
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_get_terms():
    st.markdown("**`GET`** `api.proctoru.com/api/getTerms`")
    st.title("Get Terms")
    st.caption("Returns academic terms. Saves the first term_id to session.")
    with st.form("get_terms"):
        submitted = st.form_submit_button("⚡ Send Request", use_container_width=True)
    if submitted:
        with st.spinner("Calling API..."):
            result = get_params(f"{API_BASE}/getTerms", {"time_sent": now_iso()})
        extract_and_save(result)
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_get_departments():
    st.markdown("**`GET`** `api.proctoru.com/api/getDepartments`")
    st.title("Get Departments")
    st.caption("Returns the list of departments for the institution.")
    with st.form("get_departments"):
        submitted = st.form_submit_button("⚡ Send Request", use_container_width=True)
    if submitted:
        with st.spinner("Calling API..."):
            result = get_params(f"{API_BASE}/getDepartments", {"time_sent": now_iso()})
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_create_exam():
    st.markdown("**`POST`** `api.proctoru.com/api/editTermExam`")
    st.title("Create Exam")
    st.caption("Creates or updates an exam within a term. Saves exam_id and term_id to session.")
    with st.form("create_exam"):
        c1, c2 = st.columns(2)
        term_id     = c1.text_input("term_id",   value=get_ctx("term_id") or rand_id())
        exam_id     = c2.text_input("exam_id",   value=rand_exam_id())
        name        = st.text_input("name",       value=random.choice(EXAM_NAMES))
        c3, c4 = st.columns(2)
        duration    = c3.number_input("duration (min)", value=60, step=15)
        dept_id     = c4.text_input("department_id", value=str(random.randint(700000000, 799999999)))
        exam_url    = st.text_input("exam_url",   value="https://exam-demo.streamlit.app/")
        submitted   = st.form_submit_button("⚡ Send Request", use_container_width=True)
    if submitted:
        body = dict(term_id=term_id, exam_id=exam_id, name=name,
                    duration=str(duration), department_id=dept_id,
                    exam_url=exam_url, time_sent=now_iso())
        with st.spinner("Calling API..."):
            result = post_json(f"{API_BASE}/editTermExam", body)
        extract_and_save(result, exam_id=exam_id, term_id=term_id)
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_get_exams():
    st.markdown("**`GET`** `api.proctoru.com/api/getExams`")
    st.title("Get Exams")
    st.caption("Returns all exams for a given term.")
    tid = get_ctx("term_id")
    if tid:
        st.info(f"💡 Using **term_id `{tid}`** from session.")
    with st.form("get_exams"):
        term_id   = st.text_input("term_id", value=tid, placeholder="Run Get Terms first")
        submitted = st.form_submit_button("⚡ Send Request", use_container_width=True)
    if submitted:
        with st.spinner("Calling API..."):
            result = get_params(f"{API_BASE}/getExams", {"term_id": term_id, "time_sent": now_iso()})
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_get_availability():
    st.markdown("**`POST`** `api.proctoru.com/api/getScheduleInfoAvailableTimesList`")
    st.title("Get Availability")
    st.caption("Returns available proctoring time slots for a given date and duration.")
    with st.form("get_availability"):
        c1, c2 = st.columns(2)
        start_date = c1.text_input("start_date", value=(datetime.now(timezone.utc) + timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ"))
        duration   = c2.text_input("duration",   value="60")
        c3, c4 = st.columns(2)
        tz         = c3.selectbox("time_zone_id", TIMEZONES)
        isadhoc    = c4.selectbox("isadhoc", ["N — Standard", "Y — Adhoc"])
        takeitnow  = st.selectbox("takeitnow", ["N — Schedule later", "Y — Take It Now"])
        submitted  = st.form_submit_button("⚡ Get Available Slots", use_container_width=True)
    if submitted:
        with st.spinner("Fetching slots..."):
            result = post_with_query(f"{API_BASE}/getScheduleInfoAvailableTimesList/",
                {"time_sent": now_iso(), "time_zone_id": tz, "isadhoc": isadhoc[0],
                 "start_date": start_date, "takeitnow": takeitnow[0], "duration": duration}, None)
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_begin_reservation():
    st.markdown("**`POST`** `api.proctoru.com/api/beginReservation`")
    st.title("Begin Reservation")
    st.caption("Initiates an existing reservation for a student.")
    sid = get_ctx("student_id"); rid = get_ctx("reservation_id")
    if sid or rid:
        st.info(f"💡 Pre-filled from session — student_id: **{sid or '—'}**, reservation_id: **{rid or '—'}**")
    with st.form("begin_reservation"):
        c1, c2 = st.columns(2)
        student_id     = c1.text_input("student_id",     value=sid, placeholder="Run Create User first")
        reservation_id = c2.text_input("reservation_id", value=rid, placeholder="From a prior booking")
        reservation_no = st.text_input("reservation_no", value="", placeholder="Optional")
        submitted      = st.form_submit_button("▶ Begin Reservation", use_container_width=True)
    if submitted:
        body = dict(student_id=student_id, reservation_id=reservation_id,
                    reservation_no=reservation_no, time_sent=now_iso())
        with st.spinner("Calling API..."):
            result = post_form(f"{API_BASE}/beginReservation/", body)
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_get_reservations():
    st.markdown("**`GET`** `api.proctoru.com/api/getStudentReservationList`")
    st.title("Get Reservations")
    st.caption("Returns reservations for a student filtered by status.")
    sid = get_ctx("student_id")
    if sid:
        st.info(f"💡 Using **student_id `{sid}`** from session.")
    with st.form("get_reservations"):
        c1, c2 = st.columns(2)
        student_id = c1.text_input("student_id", value=sid, placeholder="Run Create User first")
        status     = c2.selectbox("status", ["pending", "scheduled", "cancelled", "voided"])
        submitted  = st.form_submit_button("⚡ Send Request", use_container_width=True)
    if submitted:
        with st.spinner("Calling API..."):
            result = get_params(f"{API_BASE}/getStudentReservationList/",
                                {"student_id": student_id, "status": status, "time_sent": now_iso()})
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_cancel_reservation():
    st.markdown("**`POST`** `api.proctoru.com/api/removeReservation`")
    st.title("Cancel Reservation")
    st.caption("Cancels an existing reservation.")
    sid = get_ctx("student_id"); eid = get_ctx("exam_id")
    if sid or eid:
        st.info(f"💡 Pre-filled from session — student_id: **{sid or '—'}**, exam_id: **{eid or '—'}**")
    with st.form("cancel_reservation"):
        c1, c2 = st.columns(2)
        student_id = c1.text_input("student_id", value=sid, placeholder="Run Create User first")
        exam_id    = c2.text_input("exam_id",    value=eid, placeholder="From Add Bluebird / Record+")
        submitted  = st.form_submit_button("✕ Cancel Reservation", use_container_width=True, type="primary")
    if submitted:
        with st.spinner("Cancelling..."):
            result = post_with_query(f"{API_BASE}/removeReservation/",
                                     {"student_id": student_id, "exam_id": exam_id}, None)
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_bluebird_client_activity():
    st.markdown("**`POST`** `api.proctoru.com/api/bluebirdclientActivityReport/`")
    st.title("Bluebird Client Activity Report")
    st.caption("Returns Bluebird exam activity for a student within a date range.")
    sid = get_ctx("student_id")
    if sid:
        st.info(f"💡 Using **student_id `{sid}`** from session.")
    with st.form("bluebird_activity"):
        c1, c2 = st.columns(2)
        student_id = c1.text_input("student_id", value=sid or "365", placeholder="Run Create User first")
        c2.markdown("")  # spacer
        c3, c4 = st.columns(2)
        start_date = c3.text_input("start_date", value="2017-11-29")
        end_date   = c4.text_input("end_date",   value="2020-11-30")
        submitted  = st.form_submit_button("📊 Run Report", use_container_width=True)
    if submitted:
        body = dict(student_id=student_id, start_date=start_date,
                    end_date=end_date, time_sent=now_iso())
        with st.spinner("Running report..."):
            result = post_form(f"{API_BASE}/bluebirdclientActivityReport/", body)
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_client_activity_report():
    st.markdown("**`POST`** `api.proctoru.com/api/clientActivityReport/`")
    st.title("Client Activity Report")
    st.caption("Returns overall exam session activity for a student within a date range.")
    sid = get_ctx("student_id")
    if sid:
        st.info(f"💡 Using **student_id `{sid}`** from session.")
    with st.form("client_activity"):
        c1, c2 = st.columns(2)
        student_id = c1.text_input("student_id", value=sid or "365", placeholder="Run Create User first")
        c2.markdown("")  # spacer
        c3, c4 = st.columns(2)
        start_date = c3.text_input("start_date", value="2018-08-30")
        end_date   = c4.text_input("end_date",   value="2018-08-30")
        submitted  = st.form_submit_button("📊 Run Report", use_container_width=True)
    if submitted:
        body = dict(student_id=student_id, start_date=start_date,
                    end_date=end_date, time_sent=now_iso())
        with st.spinner("Running report..."):
            result = post_form(f"{API_BASE}/clientActivityReport/", body)
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_pending_exam_report():
    st.markdown("**`POST`** `api.proctoru.com/api/pendingExamReport/`")
    st.title("Pending Exam Report")
    st.caption("Returns exams that are pending scheduling or completion for a student.")
    sid = get_ctx("student_id")
    if sid:
        st.info(f"💡 Using **student_id `{sid}`** from session.")
    with st.form("pending_exam"):
        c1, c2 = st.columns(2)
        student_id = c1.text_input("student_id", value=sid or "365", placeholder="Run Create User first")
        c2.markdown("")  # spacer
        c3, c4 = st.columns(2)
        start_date = c3.text_input("start_date", value="2014-08-29")
        end_date   = c4.text_input("end_date",   value="2021-08-29")
        submitted  = st.form_submit_button("📊 Run Report", use_container_width=True)
    if submitted:
        body = dict(student_id=student_id, start_date=start_date,
                    end_date=end_date, time_sent=now_iso())
        with st.spinner("Running report..."):
            result = post_form(f"{API_BASE}/pendingExamReport/", body)
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_canvas():
    st.title("Canvas LTI")
    st.caption("Opens the ProctorU Canvas LMS integration environment.")
    st.markdown("""
    <a href="https://proctoru.instructure.com" target="_blank"
       style="display:inline-block;padding:10px 20px;background:#e8320a;color:white;
              border-radius:7px;font-weight:700;text-decoration:none;font-size:14px;">
      ↗ Open Canvas
    </a>
    """, unsafe_allow_html=True)


def page_moodle():
    st.title("Moodle LTI")
    st.caption("Opens the ProctorU Moodle LMS staging environment.")
    st.markdown("""
    <a href="https://staging-moodle-4-5-5.proctoru.com/login/index.php" target="_blank"
       style="display:inline-block;padding:10px 20px;background:#f98012;color:white;
              border-radius:7px;font-weight:700;text-decoration:none;font-size:14px;">
      ↗ Open Moodle
    </a>
    """, unsafe_allow_html=True)


def page_d2l():
    st.title("D2L Brightspace LTI")
    st.caption("Opens the ProctorU D2L Brightspace demo environment.")
    st.markdown("""
    <a href="https://proctoru.brightspacedemo.com" target="_blank"
       style="display:inline-block;padding:10px 20px;background:#e3001b;color:white;
              border-radius:7px;font-weight:700;text-decoration:none;font-size:14px;">
      ↗ Open D2L Brightspace
    </a>
    """, unsafe_allow_html=True)


def page_meazure_create_user():
    st.markdown("**`POST`** `api.ysasecure.com/v2/users`")
    st.title("Create User — Meazure")
    st.caption("Creates a student on the Meazure platform. Auth token injected server-side.")
    fn, ln = rand_name(); tag = random.randint(1000, 9999)
    city = random.choice(["Schaumburg", "Chicago", "Austin", "Denver", "Phoenix"])
    with st.form("meazure_user"):
        st.markdown("**Identity**")
        username = st.text_input("username (UUID)", value=new_uuid())
        c1, c2 = st.columns(2)
        first_name  = c1.text_input("first_name",   value=fn)
        last_name   = c2.text_input("last_name",    value=ln)
        email       = st.text_input("email",         value=rand_email(fn, ln))
        alt_email   = st.text_input("alternate_email", value=f"{fn.lower()}.bak{tag}@example.com")
        c3, c4 = st.columns(2)
        site_id    = c3.text_input("site_id",     value="286")
        partner_id = c4.text_input("partner_id",  value="19")
        c5, c6 = st.columns(2)
        lang       = c5.selectbox("preferred_language", ["en", "es", "fr", "de", "zh"])
        send_email = c6.checkbox("send_email", value=False)
        st.markdown("**Address**")
        address1   = st.text_input("address1", value=f"{random.randint(100,999)} Main St")
        address2   = st.text_input("address2", value="", placeholder="Optional")
        c7, c8 = st.columns(2)
        city_val    = c7.text_input("city",        value=city)
        postal_code = c8.text_input("postal_code", value=str(random.randint(10000, 99999)))
        c9, c10 = st.columns(2)
        country  = c9.text_input("country (2-letter)", value="US", max_chars=2)
        province = c10.text_input("province/state", value="", placeholder="Optional")
        submitted = st.form_submit_button("👤 Create User", use_container_width=True)
    if submitted:
        payload = {
            "token": MEAZURE_TOKEN,
            "user": {
                "username": username, "site_id": int(site_id),
                "first_name": first_name, "last_name": last_name,
                "email": email, "alternate_email": alt_email,
                "address_attributes": {
                    "address1": address1, "address2": address2, "city": city_val,
                    "province": province, "country": country, "postal_code": postal_code,
                },
                "preferred_language": lang, "partner_id": partner_id,
            },
            "send_email": send_email,
        }
        with st.spinner("Creating user..."):
            result = post_external(f"{MEAZURE_BASE}/users", payload)
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_candidate_login():
    st.title("Candidate Login")
    st.caption("Opens the Meazure Learning candidate portal.")
    st.markdown("""
    <a href="https://meazurelearning.ysasecure.com" target="_blank"
       style="display:inline-block;padding:10px 20px;background:#6366f1;color:white;
              border-radius:7px;font-weight:700;text-decoration:none;font-size:14px;">
      ↗ Open Candidate Login
    </a>
    """, unsafe_allow_html=True)


def page_admin_login():
    st.title("Admin Login")
    st.caption("Opens the Yardstick admin portal.")
    st.markdown("""
    <a href="https://yardstickadmin.com/en/login" target="_blank"
       style="display:inline-block;padding:10px 20px;background:#0ea5e9;color:white;
              border-radius:7px;font-weight:700;text-decoration:none;font-size:14px;">
      ↗ Open Admin Login
    </a>
    """, unsafe_allow_html=True)


def page_tc_get_institution():
    st.markdown("**`GET`** `api.proctoru.com/api/v2/whoami`")
    st.title("TC: Get Institution")
    st.caption("Returns institution details for the API key. Saves institution_uuid to session.")
    with st.form("tc_whoami"):
        submitted = st.form_submit_button("⚡ Send Request", use_container_width=True)
    if submitted:
        with st.spinner("Calling API..."):
            result = get_params(f"{TC_BASE}/whoami", {})
        extract_and_save(result)
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_tc_get_exams():
    st.markdown("**`GET`** `api.proctoru.com/api/v2/institutions/{uuid}/exams`")
    st.title("TC: Get Exams")
    st.caption("Returns exams for the institution. Saves the first exam_uuid to session.")
    iid = get_ctx("institution_uuid")
    if iid:
        st.info(f"💡 Using **institution_uuid** from session.")
    with st.form("tc_exams"):
        institution_uuid = st.text_input("institution_uuid", value=iid,
                                          placeholder="Run TC: Get Institution first")
        c1, c2 = st.columns(2)
        modality = c1.selectbox("modality", ["", "in_person", "live_plus", "record_plus", "automated"])
        active   = c2.selectbox("active",   ["true", "false", ""])
        submitted = st.form_submit_button("⚡ Send Request", use_container_width=True)
    if submitted:
        params = {"time_sent": now_iso()}
        if modality: params["modality"] = modality
        if active:   params["active"]   = active
        with st.spinner("Calling API..."):
            result = get_params(f"{TC_BASE}/institutions/{institution_uuid}/exams", params)
        extract_and_save(result, institution_uuid=institution_uuid)
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_tc_delivery_windows():
    st.markdown("**`GET`** `api.proctoru.com/api/v2/delivery_windows?exam_uuid=...&institution_uuid=...`")
    st.title("TC: Delivery Windows")
    st.caption("Returns delivery windows for an exam. Both IDs are query params — not path params. Saves delivery_window_uuid to session.")
    iid = get_ctx("institution_uuid"); eid = get_ctx("exam_uuid")
    if iid or eid:
        st.info("💡 Pre-filled from session.")
    with st.form("tc_delivery"):
        c1, c2 = st.columns(2)
        institution_uuid = c1.text_input("institution_uuid", value=iid, placeholder="From TC: Get Institution")
        exam_uuid        = c2.text_input("exam_uuid",        value=eid, placeholder="From TC: Get Exams")
        submitted        = st.form_submit_button("⚡ Send Request", use_container_width=True)
    if submitted:
        with st.spinner("Calling API..."):
            result = get_params(f"{TC_BASE}/delivery_windows",
                                {"exam_uuid": exam_uuid, "institution_uuid": institution_uuid})
        extract_and_save(result, institution_uuid=institution_uuid, exam_uuid=exam_uuid)
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_tc_test_locations():
    st.markdown("**`GET`** `api.proctoru.com/api/v2/test_center_locations?search=...&exam_uuid=...&delivery_window_uuid=...`")
    st.title("TC: Test Locations")
    st.caption("Returns available test center locations. Saves vendor_uuid and tc_location_id to session.")
    eid = get_ctx("exam_uuid"); dwid = get_ctx("delivery_window_uuid")
    if eid or dwid:
        st.info("💡 Pre-filled from session.")
    with st.form("tc_locations"):
        c1, c2 = st.columns(2)
        exam_uuid            = c1.text_input("exam_uuid",            value=eid,  placeholder="From TC: Get Exams")
        delivery_window_uuid = c2.text_input("delivery_window_uuid", value=dwid, placeholder="From TC: Delivery Windows")
        search               = st.text_input("search (zip code)",    value="60601")
        submitted            = st.form_submit_button("⚡ Send Request", use_container_width=True)
    if submitted:
        with st.spinner("Calling API..."):
            result = get_params(f"{TC_BASE}/test_center_locations",
                                {"search": search, "exam_uuid": exam_uuid,
                                 "delivery_window_uuid": delivery_window_uuid})
        extract_and_save(result, exam_uuid=exam_uuid, delivery_window_uuid=delivery_window_uuid)
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_tc_availability():
    st.markdown("**`GET`** `api.proctoru.com/api/v2/test_center_locations/{vendor_uuid}/{tc_location_id}/time_slots`")
    st.title("TC: Availability")
    st.caption("Returns available appointment time slots for a test center location.")
    vid = get_ctx("vendor_uuid"); loc = get_ctx("tc_location_id")
    eid = get_ctx("exam_uuid");   dwid = get_ctx("delivery_window_uuid")
    if vid or loc:
        st.info("💡 Pre-filled from session.")
    with st.form("tc_availability"):
        c1, c2 = st.columns(2)
        vendor_uuid    = c1.text_input("vendor_uuid",    value=vid,  placeholder="From TC: Test Locations")
        tc_location_id = c2.text_input("tc_location_id", value=loc,  placeholder="From TC: Test Locations")
        c3, c4 = st.columns(2)
        exam_uuid            = c3.text_input("exam_uuid",            value=eid,  placeholder="From TC: Get Exams")
        delivery_window_uuid = c4.text_input("delivery_window_uuid", value=dwid, placeholder="From TC: Delivery Windows")
        c5, c6 = st.columns(2)
        start_time = c5.text_input("start_time", value=(datetime.now(timezone.utc) + timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ"))
        end_time   = c6.text_input("end_time",   value=(datetime.now(timezone.utc) + timedelta(days=14)).strftime("%Y-%m-%dT%H:%M:%SZ"))
        submitted  = st.form_submit_button("⚡ Send Request", use_container_width=True)
    if submitted:
        url = f"{TC_BASE}/test_center_locations/{vendor_uuid}/{tc_location_id}/time_slots"
        with st.spinner("Calling API..."):
            result = get_params(url, {"exam_uuid": exam_uuid, "delivery_window_uuid": delivery_window_uuid,
                                      "start_time": start_time, "end_time": end_time})
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_tc_post_appointment():
    st.markdown("**`POST`** `.../institutions/{uuid}/exams/{uuid}/appointments`")
    st.title("TC: Post Appointment")
    st.caption("Books a test center appointment. Saves appointment_uuid to session.")
    iid = get_ctx("institution_uuid"); eid = get_ctx("exam_uuid")
    vid = get_ctx("vendor_uuid");      loc = get_ctx("tc_location_id")
    dwid = get_ctx("delivery_window_uuid")
    if iid or eid:
        st.info("💡 Chain IDs pre-filled from session.")
    fn, ln = rand_name(); tag = random.randint(1000, 9999)
    with st.form("tc_appointment"):
        st.markdown("**Endpoint IDs**")
        c1, c2 = st.columns(2)
        institution_uuid = c1.text_input("institution_uuid", value=iid, placeholder="From TC: Get Institution")
        exam_uuid        = c2.text_input("exam_uuid",        value=eid, placeholder="From TC: Get Exams")
        st.markdown("**Time Slot** (from TC: Availability)")
        c3, c4 = st.columns(2)
        ts_start = c3.text_input("time_slot start_time", placeholder="2026-09-02T09:00:00Z")
        ts_end   = c4.text_input("time_slot end_time",   placeholder="2026-09-02T11:00:00Z")
        c5, c6 = st.columns(2)
        ts_vendor_uuid    = c5.text_input("vendor_uuid",    value=vid,  placeholder="From TC: Test Locations")
        ts_tc_location_id = c6.text_input("tc_location_id", value=loc,  placeholder="From TC: Test Locations")
        delivery_window_uuid = st.text_input("delivery_window_uuid", value=dwid, placeholder="From TC: Delivery Windows")
        st.markdown("**Student**")
        c7, c8 = st.columns(2)
        u_first = c7.text_input("first_name",  value=fn)
        u_last  = c8.text_input("last_name",   value=ln)
        u_email = st.text_input("email",        value=rand_email(fn, ln))
        c9, c10 = st.columns(2)
        u_external_id = c9.text_input("external_id", value=get_ctx("student_id") or rand_id())
        u_phone       = c10.text_input("phone",       value=f"312555{tag}")
        submitted = st.form_submit_button("📅 Post Appointment", use_container_width=True)
    if submitted:
        body = {
            "time_slot": {"start_time": ts_start, "end_time": ts_end,
                          "vendor_uuid": ts_vendor_uuid, "tc_location_id": ts_tc_location_id,
                          "delivery_window_uuid": delivery_window_uuid},
            "user": {"first_name": u_first, "last_name": u_last,
                     "email": u_email, "external_id": u_external_id, "phone": u_phone},
        }
        url = f"{TC_BASE}/institutions/{institution_uuid}/exams/{exam_uuid}/appointments"
        with st.spinner("Booking appointment..."):
            result = post_json(url, body)
        extract_and_save(result, institution_uuid=institution_uuid, exam_uuid=exam_uuid)
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


def page_tc_delete_appointment():
    st.markdown("**`DELETE`** `.../institutions/{uuid}/exams/{uuid}/appointments/{uuid}`")
    st.title("TC: Delete Appointment")
    st.caption("Cancels a test center appointment.")
    iid = get_ctx("institution_uuid"); eid = get_ctx("exam_uuid")
    aid = get_ctx("appointment_uuid")
    if iid or eid or aid:
        st.info("💡 Pre-filled from session.")
    with st.form("tc_delete"):
        c1, c2 = st.columns(2)
        institution_uuid = c1.text_input("institution_uuid", value=iid, placeholder="From TC: Get Institution")
        exam_uuid        = c2.text_input("exam_uuid",        value=eid, placeholder="From TC: Get Exams")
        appointment_uuid = st.text_input("appointment_uuid", value=aid, placeholder="From TC: Post Appointment")
        submitted        = st.form_submit_button("✕ Delete Appointment", use_container_width=True, type="primary")
    if submitted:
        url = f"{TC_GO_BASE}/institutions/{institution_uuid}/exams/{exam_uuid}/appointments/{appointment_uuid}"
        with st.spinner("Deleting..."):
            result = delete_req(url)
        st.session_state["last_result"] = result
    show_response(st.session_state.get("last_result"))


# ══════════════════════════════════════════════════════════════
# RIGHT PANEL — Session context
# ══════════════════════════════════════════════════════════════

CTX_SECTIONS = {
    "Student / Reservation": ["student_id", "first_name", "last_name", "email",
                               "reservation_id", "reservation_uuid"],
    "Exam":                  ["exam_id", "term_id"],
    "Test Center Chain":     ["institution_uuid", "exam_uuid", "delivery_window_uuid",
                              "vendor_uuid", "tc_location_id", "appointment_uuid"],
}

CTX_SOURCES = {
    "student_id":           "Create User / Add Bluebird",
    "first_name":           "Add Bluebird",
    "last_name":            "Add Bluebird",
    "email":                "Add Bluebird",
    "reservation_id":       "Add Adhoc",
    "reservation_uuid":     "Record+",
    "exam_id":              "Add Bluebird / Record+",
    "term_id":              "Get Terms",
    "institution_uuid":     "TC: Get Institution",
    "exam_uuid":            "TC: Get Exams",
    "delivery_window_uuid": "TC: Delivery Windows",
    "vendor_uuid":          "TC: Test Locations",
    "tc_location_id":       "TC: Test Locations",
    "appointment_uuid":     "TC: Post Appointment",
}

def render_ctx_panel():
    st.markdown("#### 📋 Session Data")
    st.caption("IDs captured from successful calls this session.")

    ctx_data = st.session_state.get("_ctx", {})
    has_data = any(ctx_data.values())

    if not has_data:
        st.markdown(
            "<div style='background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;"
            "padding:14px;font-size:12px;color:#94a3b8;text-align:center'>"
            "No data yet.<br>Make an API call to start populating this panel.</div>",
            unsafe_allow_html=True,
        )
    else:
        for section, keys in CTX_SECTIONS.items():
            section_has_data = any(ctx_data.get(k) for k in keys)
            if not section_has_data:
                continue
            st.markdown(f"<div class='ctx-section'>{section}</div>", unsafe_allow_html=True)
            for k in keys:
                v = ctx_data.get(k, "")
                if v:
                    display = v[:14] + "…" if len(v) > 14 else v
                    st.markdown(
                        f"<div class='ctx-row'>"
                        f"<span class='ctx-key'>{k}</span>"
                        f"<span class='ctx-value'>{display}</span>"
                        f"</div>",
                        unsafe_allow_html=True,
                    )

        if st.button("🗑 Clear session", use_container_width=True):
            st.session_state["_ctx"] = {}
            st.rerun()

    st.markdown("---")
    st.markdown("##### Data flow")
    st.markdown(
        "<div style='font-size:11px;color:#64748b;line-height:2'>"
        + "".join(
            f"🟢 <b>{src}</b> → <code>{k}</code><br>"
            for k, src in CTX_SOURCES.items()
        )
        + "</div>",
        unsafe_allow_html=True,
    )


# ══════════════════════════════════════════════════════════════
# ROUTER — 3-panel layout
# ══════════════════════════════════════════════════════════════

PAGE_MAP = {
    "Create User":            page_create_user,
    "Auto Login":             page_auto_login,
    "Add Bluebird":           page_add_bluebird,
    "Add Adhoc":              page_add_adhoc,
    "Record+":                page_record_plus,
    "Fulfill Record+":        page_record_plus_fulfill,
    "Get Terms":              page_get_terms,
    "Get Departments":        page_get_departments,
    "Create Exam":            page_create_exam,
    "Get Exams":              page_get_exams,
    "Get Availability":       page_get_availability,
    "Begin Reservation":      page_begin_reservation,
    "Get Reservations":          page_get_reservations,
    "Cancel Reservation":        page_cancel_reservation,
    "Bluebird Client Activity":  page_bluebird_client_activity,
    "Client Activity Report":    page_client_activity_report,
    "Pending Exam Report":       page_pending_exam_report,
    "Canvas":                    page_canvas,
    "Moodle":                 page_moodle,
    "D2L Brightspace":        page_d2l,
    "Meazure: Create User":   page_meazure_create_user,
    "Candidate Login":        page_candidate_login,
    "Admin Login":            page_admin_login,
    "TC: Get Institution":    page_tc_get_institution,
    "TC: Get Exams":          page_tc_get_exams,
    "TC: Delivery Windows":   page_tc_delivery_windows,
    "TC: Test Locations":     page_tc_test_locations,
    "TC: Availability":       page_tc_availability,
    "TC: Post Appointment":   page_tc_post_appointment,
    "TC: Delete Appointment": page_tc_delete_appointment,
}

if PAGES.get(selection) is None:
    st.info("Select an endpoint from the sidebar to get started.")
else:
    main_col, ctx_col = st.columns([3, 1], gap="large")
    with main_col:
        PAGE_MAP[selection]()
    with ctx_col:
        render_ctx_panel()
