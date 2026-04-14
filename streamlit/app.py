"""
Meazure Solutions — API Integration Playground (Streamlit)
Mirrors the React dashboard: same endpoints, same auth, no token exposure.
"""
import uuid
import random
import json
import streamlit as st
from datetime import datetime, timezone, timedelta
from api.client import (
    API_BASE, DEMO_BASE, GO_BASE, TC_BASE, TC_GO_BASE, MEAZURE_BASE, MEAZURE_TOKEN,
    now_iso, post_json, post_form, get_params, post_with_query, delete_req, post_external,
)

st.set_page_config(
    page_title="Meazure API Playground",
    page_icon="🔬",
    layout="wide",
)

# ── Global styles ─────────────────────────────────────────────
st.markdown("""
<style>
  [data-testid="stSidebar"] { background: #1e293b; }
  [data-testid="stSidebar"] * { color: #e2e8f0 !important; }
  [data-testid="stSidebar"] .stSelectbox label { color: #94a3b8 !important; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; }
  .section-title { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin: 16px 0 4px; }
  .endpoint-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
  .badge-post { background: #fef3c7; color: #92400e; }
  .badge-get  { background: #dbeafe; color: #1e40af; }
  .badge-del  { background: #fee2e2; color: #991b1b; }
</style>
""", unsafe_allow_html=True)


# ── Sidebar navigation ────────────────────────────────────────
PAGES = {
    "── User Events ──": None,
    "Create User":           ("POST", "/user-events"),
    "Auto Login":            ("POST", "/auto-login"),
    "Add Bluebird":          ("POST", "/add-bluebird"),
    "Add Adhoc":             ("POST", "/add-adhoc"),
    "Record+":               ("POST", "/record-plus"),
    "Fulfill Record+":       ("POST", "/record-plus-fulfill"),
    "Get Terms":             ("GET",  "/get-terms"),
    "Get Departments":       ("GET",  "/get-departments"),
    "Create Exam":           ("POST", "/create-exam"),
    "Get Exams":             ("GET",  "/get-exams"),
    "Get Availability":      ("POST", "/get-availability"),
    "Begin Reservation":     ("POST", "/begin-reservation"),
    "Get Reservations":      ("GET",  "/get-reservations"),
    "Cancel Reservation":    ("POST", "/cancel-reservation"),
    "── Reports ──": None,
    "── Meazure Exam Platform ──": None,
    "Meazure: Create User":  ("POST", "/meazure-create-user"),
    "── Test Center API ──": None,
    "TC: Get Institution":   ("GET",  "/tc-institution"),
    "TC: Get Exams":         ("GET",  "/tc-exams"),
    "TC: Delivery Windows":  ("GET",  "/tc-delivery-windows"),
    "TC: Test Locations":    ("GET",  "/tc-test-locations"),
    "TC: Availability":      ("GET",  "/tc-availability"),
    "TC: Post Appointment":  ("POST", "/tc-post-appointment"),
    "TC: Delete Appointment":("DEL",  "/tc-delete-appointment"),
}

with st.sidebar:
    st.markdown("### 🔬 API Playground")
    st.markdown("---")
    options = [k for k in PAGES]
    selection = st.radio(
        "Navigate",
        options,
        label_visibility="collapsed",
        format_func=lambda x: (
            f"  {PAGES[x][0]}  {x}" if PAGES[x] else f"▸ {x.strip('─ ')}"
        ),
    )


# ── Response renderer ─────────────────────────────────────────
def show_response(result: dict | None):
    if not result:
        return
    tab1, tab2 = st.tabs(["📨 Response", "📤 Request Details"])
    with tab1:
        status = result.get("status", 0)
        success = result.get("success", False)
        badge = f"✅ {status} OK" if success else f"❌ {status} Error"
        if success:
            st.success(badge)
        else:
            st.error(badge)
        st.json(result.get("data", {}))
    with tab2:
        req = result.get("_request", {})
        cols = st.columns(3)
        cols[0].metric("Method", req.get("method", "—"))
        cols[1].metric("Content-Type", req.get("contentType", "—").split("/")[-1])
        cols[2].metric("Status", str(result.get("status", "—")))
        st.code(req.get("url", ""), language="text")
        body = req.get("body") or req.get("params") or req.get("queryParams")
        if body:
            st.json(body)


# ── Random data helpers ───────────────────────────────────────
FIRST_NAMES = ["James", "Emma", "Liam", "Olivia", "Noah", "Ava", "William", "Sophia"]
LAST_NAMES  = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller"]
EXAM_NAMES  = ["Introduction to Management", "Calculus I", "Business Ethics",
               "Data Structures", "Organic Chemistry", "Macroeconomics", "Civil Procedure"]
TIMEZONES   = ["Central Standard Time", "Eastern Standard Time", "Pacific Standard Time",
               "Mountain Standard Time", "UTC", "India Standard Time"]

def rand_name():
    return random.choice(FIRST_NAMES), random.choice(LAST_NAMES)

def rand_email(fn, ln):
    return f"{fn.lower()}.{ln.lower()}{random.randint(1000,9999)}@yopmail.com"

def rand_uuid():
    return str(uuid.uuid4())

def rand_student_id():
    return str(random.randint(10000, 99999))


# ══════════════════════════════════════════════════════════════
# PAGE RENDERERS
# ══════════════════════════════════════════════════════════════

def page_create_user():
    st.markdown("**`POST`** `demo.proctoru.com/api/editStudent/`")
    st.title("Create User")
    st.caption("Creates or updates a student account on demo.proctoru.com (form-encoded).")

    fn, ln = rand_name()
    tag = random.randint(1000, 9999)
    sid = rand_student_id()

    with st.form("create_user"):
        c1, c2 = st.columns(2)
        first_name = c1.text_input("first_name", value=fn)
        last_name  = c2.text_input("last_name",  value=ln)
        email      = st.text_input("email",       value=rand_email(fn, ln))
        c3, c4 = st.columns(2)
        student_id = c3.text_input("student_id",  value=sid)
        phone      = c4.text_input("phone1",       value=f"312555{tag}")
        c5, c6 = st.columns(2)
        country    = c5.text_input("country",      value="US", max_chars=2)
        tz         = c6.selectbox("time_zone_id",  TIMEZONES)
        password   = st.text_input("user_password", value=f"Pass{tag}!")
        submitted  = st.form_submit_button("⚡ Send Request", use_container_width=True)

    if submitted:
        body = dict(first_name=first_name, last_name=last_name, email=email,
                    student_id=student_id, phone1=phone, country=country,
                    time_zone_id=tz, user_password=password,
                    time_sent=now_iso())
        with st.spinner("Calling API..."):
            result = post_form(f"{API_BASE}/editStudent/", body)
        st.session_state["last_result"] = result

    show_response(st.session_state.get("last_result"))


def page_auto_login():
    st.markdown("**`POST`** `demo.proctoru.com/api/autoLogin/`")
    st.title("Auto Login")
    st.caption("Generates a one-time login URL for a student.")

    fn, ln = rand_name()
    tag = random.randint(1000, 9999)

    with st.form("auto_login"):
        c1, c2 = st.columns(2)
        student_id = c1.text_input("student_id",   value=rand_student_id())
        email      = c2.text_input("email",         value=rand_email(fn, ln))
        first_name = c1.text_input("first_name",    value=fn)
        last_name  = c2.text_input("last_name",     value=ln)
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
    st.caption("Schedules a live-proctored Bluebird exam.")

    fn, ln = rand_name()
    tag = random.randint(1000, 9999)

    with st.form("add_bluebird"):
        c1, c2 = st.columns(2)
        first_name  = c1.text_input("first_name",  value=fn)
        last_name   = c2.text_input("last_name",   value=ln)
        email       = st.text_input("email",        value=rand_email(fn, ln))
        c3, c4 = st.columns(2)
        student_id  = c3.text_input("student_id",  value=rand_student_id())
        exam_id     = c4.text_input("exam_id",      value=str(random.randint(100000, 999999)))
        description = st.text_input("description",  value=random.choice(EXAM_NAMES))
        c5, c6 = st.columns(2)
        duration    = c5.number_input("duration (min)", value=60, step=15)
        tz          = c6.selectbox("time_zone_id",  TIMEZONES)
        exam_url    = st.text_input("exam_url",     value="https://canvas.instructure.com/exam")
        c7, c8 = st.columns(2)
        active_date = c7.text_input("active_date", value=(datetime.now(timezone.utc) + timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ"))
        end_date    = c8.text_input("end_date",    value=(datetime.now(timezone.utc) + timedelta(days=8)).strftime("%Y-%m-%dT%H:%M:%SZ"))
        submitted   = st.form_submit_button("⚡ Send Request", use_container_width=True)

    if submitted:
        body = dict(first_name=first_name, last_name=last_name, email=email,
                    student_id=student_id, exam_id=exam_id, description=description,
                    duration=str(duration), time_zone_id=tz, exam_url=exam_url,
                    active_date=active_date, end_date=end_date, time_sent=now_iso())
        with st.spinner("Calling API..."):
            result = post_json(f"{API_BASE}/addBlueBirdExam", body)
        st.session_state["last_result"] = result

    show_response(st.session_state.get("last_result"))


def page_add_adhoc():
    st.markdown("**`POST`** Two-step: Get Slots → Book")
    st.title("Add Adhoc")
    st.caption("Step 1 fetches available time slots. Click a slot to pre-fill Step 2's start_date, then book.")

    st.subheader("Step 1 — Get Available Slots")
    st.markdown("`POST` `api.proctoru.com/api/getScheduleInfoAvailableTimesList`")

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
            result = post_with_query(
                f"{API_BASE}/getScheduleInfoAvailableTimesList/",
                {"time_sent": now_iso(), "time_zone_id": tz, "isadhoc": "Y",
                 "start_date": start_date, "takeitnow": takeitnow, "duration": duration},
                None,
            )
        st.session_state["adhoc_slots_result"] = result
        # try to extract slot list
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
        chosen = st.radio("Slot", slot_times, label_visibility="collapsed")
        selected_start = chosen

    st.divider()
    st.subheader("Step 2 — Book Adhoc Exam")
    st.markdown("`POST` `api.proctoru.com/api/addAdHocProcess`")

    fn, ln = rand_name()
    tag = random.randint(1000, 9999)

    with st.form("add_adhoc"):
        c1, c2 = st.columns(2)
        first_name  = c1.text_input("first_name",    value=fn)
        last_name   = c2.text_input("last_name",     value=ln)
        email       = st.text_input("email",          value=rand_email(fn, ln))
        c3, c4 = st.columns(2)
        student_id  = c3.text_input("student_id",    value=rand_student_id())
        user_pass   = c4.text_input("user_password", value=f"Pass{tag}!")
        tz2         = st.selectbox("time_zone_id", TIMEZONES, key="adhoc_tz2")
        description = st.text_input("description",   value=random.choice(EXAM_NAMES))
        c5, c6 = st.columns(2)
        duration2   = c5.text_input("duration",      value="120")
        dept_id     = c6.text_input("department_id", value="740364540")
        exam_url    = st.text_input("exam_url",      value="http://proctoru.com")
        exam_pass   = st.text_input("exam_password", value=f"ExP{tag}")
        book_start  = st.text_input("start_date",    value=selected_start)
        c7, c8 = st.columns(2)
        res_id      = c7.text_input("reservation_id", value=rand_student_id())
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
        st.session_state["last_result"] = result

    show_response(st.session_state.get("last_result"))


def page_record_plus():
    st.markdown("**`POST`** `go.proctoru.com/api/exams/add_record_plus_exams`")
    st.title("Record+")
    st.caption("Creates a Record+ automated proctoring exam. Sent as JSON to go.proctoru.com.")

    fn, ln = rand_name()
    tag = random.randint(10000, 99999)

    with st.form("record_plus"):
        c1, c2 = st.columns(2)
        first_name  = c1.text_input("first_name",   value=fn)
        last_name   = c2.text_input("last_name",    value=ln)
        c3, c4 = st.columns(2)
        student_id  = c3.text_input("student_id",   value=rand_student_id())
        user_id     = c4.text_input("user_id",       value=rand_student_id())
        email       = st.text_input("email",          value=rand_email(fn, ln))
        c5, c6 = st.columns(2)
        country     = c5.text_input("country",       value="US", max_chars=2)
        phone       = c6.text_input("phone1",         value=f"312555{str(tag)[:4]}")
        tz          = st.selectbox("time_zone_id",   TIMEZONES)
        description = st.text_input("description (Exam Name)", value=random.choice(EXAM_NAMES))
        c7, c8 = st.columns(2)
        exam_id     = c7.text_input("exam_id",       value=str(random.randint(100000, 999999)))
        duration    = c8.number_input("duration (min)", value=60, step=15)
        exam_url    = st.text_input("exam_url",      value="https://canvas.instructure.com/exam")
        c9, c10 = st.columns(2)
        preset      = c9.selectbox("preset",         ["medium", "low", "high"])
        perm_res    = c10.text_input("permitted_resources_list", value="")
        other_res   = st.text_input("other_resources", value="")
        submitted   = st.form_submit_button("⚡ Send Request", use_container_width=True)

    if submitted:
        body = dict(student_id=student_id, user_id=user_id, first_name=first_name,
                    last_name=last_name, email=email, country=country, phone1=phone,
                    time_zone_id=tz, description=description, duration=str(duration),
                    exam_id=exam_id, exam_url=exam_url, permitted_resources_list=perm_res,
                    other_resources=other_res, preset=preset)
        with st.spinner("Calling API..."):
            result = post_json(f"{API_BASE}/exams/add_record_plus_exams", body)
        st.session_state["last_result"] = result

    show_response(st.session_state.get("last_result"))


def page_record_plus_fulfill():
    st.markdown("**`POST`** `demo.proctoru.com/api/exams/add_record_plus_exams/fulfill`")
    st.title("Fulfill Record+")
    st.caption("Step 2 of Record+: pass the reservation_uuid to mark the session complete.")

    st.info("💡 Copy the `reservation_uuid` from the Add Record+ response and paste it below.")

    with st.form("record_plus_fulfill"):
        res_uuid = st.text_input("reservation_uuid",
                                 value="421fb271-73c6-410d-8b61-2cdd91404e0e",
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
    st.caption("Returns the list of academic terms for the institution.")

    with st.form("get_terms"):
        submitted = st.form_submit_button("⚡ Send Request", use_container_width=True)

    if submitted:
        with st.spinner("Calling API..."):
            result = get_params(f"{API_BASE}/getTerms", {"time_sent": now_iso()})
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
    st.caption("Creates or updates an exam within a term.")

    with st.form("create_exam"):
        c1, c2 = st.columns(2)
        term_id     = c1.text_input("term_id",   value=str(random.randint(1000, 9999)))
        exam_id     = c2.text_input("exam_id",   value=str(random.randint(100000, 999999)))
        name        = st.text_input("name",       value=random.choice(EXAM_NAMES))
        c3, c4 = st.columns(2)
        duration    = c3.number_input("duration (min)", value=60, step=15)
        dept_id     = c4.text_input("department_id", value=str(random.randint(700000000, 799999999)))
        exam_url    = st.text_input("exam_url",   value="https://canvas.instructure.com/exam")
        submitted   = st.form_submit_button("⚡ Send Request", use_container_width=True)

    if submitted:
        body = dict(term_id=term_id, exam_id=exam_id, name=name,
                    duration=str(duration), department_id=dept_id,
                    exam_url=exam_url, time_sent=now_iso())
        with st.spinner("Calling API..."):
            result = post_json(f"{API_BASE}/editTermExam", body)
        st.session_state["last_result"] = result

    show_response(st.session_state.get("last_result"))


def page_get_exams():
    st.markdown("**`GET`** `api.proctoru.com/api/getExams`")
    st.title("Get Exams")
    st.caption("Returns all exams for a given term.")

    with st.form("get_exams"):
        term_id   = st.text_input("term_id", value=str(random.randint(1000, 9999)))
        submitted = st.form_submit_button("⚡ Send Request", use_container_width=True)

    if submitted:
        with st.spinner("Calling API..."):
            result = get_params(f"{API_BASE}/getExams", {"term_id": term_id, "time_sent": now_iso()})
        st.session_state["last_result"] = result

    show_response(st.session_state.get("last_result"))


def page_get_availability():
    st.markdown("**`POST`** `api.proctoru.com/api/getScheduleInfoAvailableTimesList`")
    st.title("Get Availability")
    st.caption("Returns available proctoring time slots for a given date and duration. Same endpoint as Add Adhoc Step 1.")

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
            result = post_with_query(
                f"{API_BASE}/getScheduleInfoAvailableTimesList/",
                {"time_sent": now_iso(), "time_zone_id": tz,
                 "isadhoc": isadhoc[0], "start_date": start_date,
                 "takeitnow": takeitnow[0], "duration": duration},
                None,
            )
        st.session_state["last_result"] = result
        inner = result.get("data", {})
        for key in ["data", "slots", "available_times", "times"]:
            if isinstance(inner.get(key), list) and inner[key]:
                slot_times = [s.get("start_date") or s.get("start_time") or str(s) for s in inner[key]]
                st.info(f"**{len(slot_times)} slots found:**  " + " · ".join(slot_times[:5]) + ("..." if len(slot_times) > 5 else ""))
                break

    show_response(st.session_state.get("last_result"))


def page_begin_reservation():
    st.markdown("**`POST`** `api.proctoru.com/api/beginReservation`")
    st.title("Begin Reservation")
    st.caption("Initiates an existing reservation for a student.")

    with st.form("begin_reservation"):
        c1, c2 = st.columns(2)
        student_id     = c1.text_input("student_id",     value="365")
        reservation_id = c2.text_input("reservation_id", value="456456456")
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
    st.caption("Returns all reservations for a given student, filtered by status.")

    with st.form("get_reservations"):
        c1, c2 = st.columns(2)
        student_id = c1.text_input("student_id", value=rand_student_id())
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
    st.caption("Cancels an existing reservation. student_id and exam_id are sent as query parameters.")

    with st.form("cancel_reservation"):
        c1, c2 = st.columns(2)
        student_id = c1.text_input("student_id", value=rand_student_id())
        exam_id    = c2.text_input("exam_id",    value=str(random.randint(100000, 999999)))
        submitted  = st.form_submit_button("✕ Cancel Reservation", use_container_width=True,
                                           type="primary")

    if submitted:
        with st.spinner("Cancelling..."):
            result = post_with_query(f"{API_BASE}/removeReservation/",
                                     {"student_id": student_id, "exam_id": exam_id}, None)
        st.session_state["last_result"] = result

    show_response(st.session_state.get("last_result"))


def page_meazure_create_user():
    st.markdown("**`POST`** `api.ysasecure.com/v2/users`")
    st.title("Create User — Meazure")
    st.caption("Creates a student on the Meazure (YSA) platform. Auth token is injected server-side.")

    fn, ln = rand_name()
    tag = random.randint(1000, 9999)
    city = random.choice(["Schaumburg", "Chicago", "Austin", "Denver", "Phoenix"])

    with st.form("meazure_user"):
        st.markdown("**Identity**")
        username = st.text_input("username (UUID)", value=rand_uuid())
        c1, c2 = st.columns(2)
        first_name  = c1.text_input("first_name",   value=fn)
        last_name   = c2.text_input("last_name",    value=ln)
        email       = st.text_input("email",         value=rand_email(fn, ln))
        alt_email   = st.text_input("alternate_email", value=f"{fn.lower()}.bak{tag}@example.com")
        c3, c4 = st.columns(2)
        site_id     = c3.text_input("site_id",      value="286")
        partner_id  = c4.text_input("partner_id",   value="19")
        c5, c6 = st.columns(2)
        lang        = c5.selectbox("preferred_language", ["en", "es", "fr", "de", "zh"])
        send_email  = c6.checkbox("send_email", value=False)

        st.markdown("**Address**")
        address1    = st.text_input("address1", value=f"{random.randint(100,999)} Main St")
        address2    = st.text_input("address2", value="", placeholder="Optional")
        c7, c8 = st.columns(2)
        city_val    = c7.text_input("city",        value=city)
        postal_code = c8.text_input("postal_code", value=str(random.randint(10000, 99999)))
        c9, c10 = st.columns(2)
        country     = c9.text_input("country (2-letter)", value="US", max_chars=2)
        province    = c10.text_input("province/state", value="", placeholder="Optional")

        submitted = st.form_submit_button("👤 Create User", use_container_width=True)

    if submitted:
        body = dict(username=username, site_id=int(site_id), first_name=first_name,
                    last_name=last_name, email=email, alternate_email=alt_email,
                    address1=address1, address2=address2, city=city_val,
                    province=province, country=country, postal_code=postal_code,
                    preferred_language=lang, partner_id=partner_id, send_email=send_email)
        # reconstruct nested structure server-side equivalent
        payload = {
            "token": MEAZURE_TOKEN,
            "user": {
                "username": username, "site_id": int(site_id),
                "first_name": first_name, "last_name": last_name,
                "email": email, "alternate_email": alt_email,
                "address_attributes": {
                    "address1": address1, "address2": address2,
                    "city": city_val, "province": province,
                    "country": country, "postal_code": postal_code,
                },
                "preferred_language": lang, "partner_id": partner_id,
            },
            "send_email": send_email,
        }
        with st.spinner("Creating user..."):
            result = post_external(f"{MEAZURE_BASE}/users", payload)
        st.session_state["last_result"] = result

    show_response(st.session_state.get("last_result"))


# ── Test Center pages ─────────────────────────────────────────

def page_tc_get_institution():
    st.markdown("**`GET`** `api.proctoru.com/api/v2/whoami`")
    st.title("TC: Get Institution")
    st.caption("Returns the institution details for the provided API key. No inputs required.")

    with st.form("tc_whoami"):
        submitted = st.form_submit_button("⚡ Send Request", use_container_width=True)

    if submitted:
        with st.spinner("Calling API..."):
            result = get_params(f"{TC_BASE}/whoami", {})
        st.session_state["last_result"] = result

    show_response(st.session_state.get("last_result"))


def page_tc_get_exams():
    st.markdown("**`GET`** `api.proctoru.com/api/v2/institutions/{uuid}/exams`")
    st.title("TC: Get Exams")
    st.caption("Returns exams for the institution. Use the institution_uuid from Get Institution.")

    with st.form("tc_exams"):
        institution_uuid = st.text_input("institution_uuid", placeholder="From TC: Get Institution response")
        c1, c2 = st.columns(2)
        modality = c1.selectbox("modality", ["", "live_plus", "record_plus", "automated"])
        active   = c2.selectbox("active",   ["true", "false", ""])
        submitted = st.form_submit_button("⚡ Send Request", use_container_width=True)

    if submitted:
        params = {"time_sent": now_iso()}
        if modality: params["modality"] = modality
        if active:   params["active"]   = active
        with st.spinner("Calling API..."):
            result = get_params(f"{TC_BASE}/institutions/{institution_uuid}/exams", params)
        st.session_state["last_result"] = result

    show_response(st.session_state.get("last_result"))


def page_tc_delivery_windows():
    st.markdown("**`GET`** `api.proctoru.com/api/v2/institutions/{uuid}/exams/{uuid}/delivery_windows`")
    st.title("TC: Delivery Windows")
    st.caption("Returns delivery windows for a specific exam. Use exam_uuid from TC: Get Exams.")

    with st.form("tc_delivery"):
        c1, c2 = st.columns(2)
        institution_uuid = c1.text_input("institution_uuid", placeholder="From Get Institution")
        exam_uuid        = c2.text_input("exam_uuid",        placeholder="From TC: Get Exams")
        submitted        = st.form_submit_button("⚡ Send Request", use_container_width=True)

    if submitted:
        url = f"{TC_BASE}/institutions/{institution_uuid}/exams/{exam_uuid}/delivery_windows"
        with st.spinner("Calling API..."):
            result = get_params(url, {"time_sent": now_iso()})
        st.session_state["last_result"] = result

    show_response(st.session_state.get("last_result"))


def page_tc_test_locations():
    st.markdown("**`GET`** `api.proctoru.com/api/v2/institutions/{uuid}/exams/{uuid}/test_center_locations`")
    st.title("TC: Test Locations")
    st.caption("Returns available test center locations. Use exam_uuid and delivery_window_uuid from previous steps.")

    with st.form("tc_locations"):
        c1, c2 = st.columns(2)
        exam_uuid             = c1.text_input("exam_uuid",             placeholder="From TC: Get Exams")
        delivery_window_uuid  = c2.text_input("delivery_window_uuid",  placeholder="From TC: Delivery Windows")
        institution_uuid      = st.text_input("institution_uuid",      placeholder="From Get Institution")
        search                = st.text_input("search (zip code)",     value="60601")
        submitted             = st.form_submit_button("⚡ Send Request", use_container_width=True)

    if submitted:
        url = f"{TC_BASE}/institutions/{institution_uuid}/exams/{exam_uuid}/test_center_locations"
        with st.spinner("Calling API..."):
            result = get_params(url, {"search": search, "delivery_window_uuid": delivery_window_uuid, "time_sent": now_iso()})
        st.session_state["last_result"] = result

    show_response(st.session_state.get("last_result"))


def page_tc_availability():
    st.markdown("**`GET`** `go.proctoru.com/api/v2/vendors/{uuid}/tc_locations/{id}/availability`")
    st.title("TC: Availability")
    st.caption("Returns available appointment time slots. Use vendor_uuid and tc_location_id from TC: Test Locations.")

    with st.form("tc_availability"):
        c1, c2 = st.columns(2)
        vendor_uuid   = c1.text_input("vendor_uuid",   placeholder="From TC: Test Locations")
        tc_location_id = c2.text_input("tc_location_id", placeholder="From TC: Test Locations")
        c3, c4 = st.columns(2)
        exam_uuid            = c3.text_input("exam_uuid",            placeholder="From TC: Get Exams")
        delivery_window_uuid = c4.text_input("delivery_window_uuid", placeholder="From TC: Delivery Windows")
        c5, c6 = st.columns(2)
        start_time = c5.text_input("start_time", value=(datetime.now(timezone.utc) + timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ"))
        end_time   = c6.text_input("end_time",   value=(datetime.now(timezone.utc) + timedelta(days=14)).strftime("%Y-%m-%dT%H:%M:%SZ"))
        submitted  = st.form_submit_button("⚡ Send Request", use_container_width=True)

    if submitted:
        url = f"{TC_GO_BASE}/vendors/{vendor_uuid}/tc_locations/{tc_location_id}/availability"
        params = {"exam_uuid": exam_uuid, "delivery_window_uuid": delivery_window_uuid,
                  "start_time": start_time, "end_time": end_time}
        with st.spinner("Calling API..."):
            result = get_params(url, params)
        st.session_state["last_result"] = result

    show_response(st.session_state.get("last_result"))


def page_tc_post_appointment():
    st.markdown("**`POST`** `api.proctoru.com/api/v2/institutions/{uuid}/exams/{uuid}/appointments`")
    st.title("TC: Post Appointment")
    st.caption("Books a test center appointment. Use time slot details from TC: Availability.")

    fn, ln = rand_name()
    tag = random.randint(1000, 9999)

    with st.form("tc_appointment"):
        st.markdown("**Endpoint IDs**")
        c1, c2 = st.columns(2)
        institution_uuid = c1.text_input("institution_uuid", placeholder="From Get Institution")
        exam_uuid        = c2.text_input("exam_uuid",        placeholder="From TC: Get Exams")

        st.markdown("**Time Slot** (from TC: Availability)")
        c3, c4 = st.columns(2)
        ts_start = c3.text_input("time_slot start_time", placeholder="2026-09-02T09:00:00Z")
        ts_end   = c4.text_input("time_slot end_time",   placeholder="2026-09-02T11:00:00Z")
        c5, c6 = st.columns(2)
        ts_vendor_uuid    = c5.text_input("vendor_uuid",     placeholder="From TC: Test Locations")
        ts_tc_location_id = c6.text_input("tc_location_id",  placeholder="From TC: Test Locations")
        delivery_window_uuid = st.text_input("delivery_window_uuid", placeholder="From TC: Delivery Windows")

        st.markdown("**Student**")
        c7, c8 = st.columns(2)
        u_first = c7.text_input("first_name", value=fn)
        u_last  = c8.text_input("last_name",  value=ln)
        u_email = st.text_input("email",       value=rand_email(fn, ln))
        c9, c10 = st.columns(2)
        u_external_id = c9.text_input("external_id", value=rand_student_id())
        u_phone       = c10.text_input("phone",       value=f"312555{tag}")

        submitted = st.form_submit_button("📅 Post Appointment", use_container_width=True)

    if submitted:
        body = {
            "time_slot": {
                "start_time": ts_start, "end_time": ts_end,
                "vendor_uuid": ts_vendor_uuid, "tc_location_id": ts_tc_location_id,
                "delivery_window_uuid": delivery_window_uuid,
            },
            "user": {
                "first_name": u_first, "last_name": u_last,
                "email": u_email, "external_id": u_external_id, "phone": u_phone,
            },
        }
        url = f"{TC_BASE}/institutions/{institution_uuid}/exams/{exam_uuid}/appointments"
        with st.spinner("Booking appointment..."):
            result = post_json(url, body)
        st.session_state["last_result"] = result

    show_response(st.session_state.get("last_result"))


def page_tc_delete_appointment():
    st.markdown("**`DELETE`** `go.proctoru.com/api/v2/institutions/{uuid}/exams/{uuid}/appointments/{uuid}`")
    st.title("TC: Delete Appointment")
    st.caption("Cancels a test center appointment.")

    with st.form("tc_delete"):
        c1, c2 = st.columns(2)
        institution_uuid = c1.text_input("institution_uuid", placeholder="From Get Institution")
        exam_uuid        = c2.text_input("exam_uuid",        placeholder="From TC: Get Exams")
        appointment_uuid = st.text_input("appointment_uuid", placeholder="From TC: Post Appointment response")
        submitted        = st.form_submit_button("✕ Delete Appointment", use_container_width=True,
                                                  type="primary")

    if submitted:
        url = f"{TC_GO_BASE}/institutions/{institution_uuid}/exams/{exam_uuid}/appointments/{appointment_uuid}"
        with st.spinner("Deleting..."):
            result = delete_req(url)
        st.session_state["last_result"] = result

    show_response(st.session_state.get("last_result"))


# ══════════════════════════════════════════════════════════════
# ROUTER
# ══════════════════════════════════════════════════════════════

# Clear last result when navigating to a new page
if "current_page" not in st.session_state:
    st.session_state["current_page"] = selection
if st.session_state["current_page"] != selection:
    st.session_state["current_page"] = selection
    st.session_state.pop("last_result", None)

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
    "Get Reservations":       page_get_reservations,
    "Cancel Reservation":     page_cancel_reservation,
    "Meazure: Create User":   page_meazure_create_user,
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
elif selection in PAGE_MAP:
    PAGE_MAP[selection]()
