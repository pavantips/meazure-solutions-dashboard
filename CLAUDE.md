# Meazure Solutions — API Integration Playground

Interactive dashboard for testing ProctorU/Meazure API integrations.
Two apps in one repo: a React+Node playground and a Streamlit Python app.

---

## Project Structure

```
integration-playground/
├── server.js              # Node/Express proxy — all API calls go through here
├── client/                # React + Vite frontend
│   └── src/
│       ├── pages/         # One file per API endpoint
│       ├── components/    # Sidebar, ResponseViewer
│       ├── styles/        # shared.js — reusable style constants
│       └── utils/         # randomize.js — test data generators
└── streamlit/             # Python Streamlit app (standalone, no Node needed)
    ├── app.py             # Main entry point — point Streamlit Cloud here
    ├── api/client.py      # Shared HTTP helpers (mirrors Node proxy helpers)
    ├── tests/             # Pytest test suite
    └── requirements.txt
```

---

## Running Locally

### React + Node app
```bash
# From repo root
npm run dev          # starts both Vite (5173) and Express (3000)
```

### Streamlit app
```bash
cd streamlit
cp .env.example .env    # fill in real tokens
streamlit run app.py
```

---

## Environment Variables

Never commit `.env`. Copy `.env.example` and fill in:
- `PROCTORU_AUTH_TOKEN` — ProctorU API key (Authorization-Token header)
- `MEAZURE_TOKEN` — Meazure/YSA token (injected into request body, never a header)
- All base URL vars (have sensible defaults in client.py but must be set for Node)

On Streamlit Cloud: paste the full `.env` contents into **App Settings → Secrets**.

---

## API Conventions

### Auth
- ProctorU endpoints: `Authorization-Token: <token>` header (NOT Bearer)
- Meazure endpoint: token goes in the **request body** as `"token": "..."`, no auth header

### Base URLs
| Var | Domain | Used for |
|-----|--------|---------|
| `API_BASE` | api.proctoru.com/api | All User Events |
| `TC_BASE` | api.proctoru.com/api/v2 | Test Center API (GET/POST) |
| `TC_GO_BASE` | go.proctoru.com/api/v2 | TC Availability + Delete Appointment |
| `MEAZURE_BASE` | api.ysasecure.com/v2 | Meazure Create User |

### Content Types
- Most POST endpoints: `application/json`
- `editStudent`, `autoLogin`, `beginReservation`, `fulfill`: `application/x-www-form-urlencoded`

---

## Adding a New Endpoint

### Streamlit (app.py)
1. Add a `page_<name>()` function following the existing pattern
2. Add it to the `PAGES` dict (sidebar) and `PAGE_MAP` dict (router)
3. After a successful call, run `extract_and_save(result, key=value)` to save IDs to session context
4. For "use" pages that need IDs from prior calls, read defaults with `get_ctx("key")`
5. Add the new field to `CTX_SECTIONS` and `CTX_SOURCES` if it produces a chainable ID

### Node proxy (server.js)
1. Add a route: `app.post('/api/proxy/<name>', (req, res) => forwardPost(res, url, req.body))`
2. Use the right helper: `forwardPost` (JSON), `forwardForm` (url-encoded), `forwardGet`, `forwardPostWithQuery`, `forwardDelete`

### React (client/src)
1. Create `client/src/pages/<Name>.jsx`
2. Import and add a `<Route>` in `App.jsx`
3. Add to the relevant section in `Sidebar.jsx`

---

## Testing

```bash
cd streamlit
pip install pytest responses
pytest tests/ -v
```

### Test coverage
- `tests/test_client.py` — HTTP helpers, auth headers, URL construction, error handling
- `tests/test_context.py` — Session context chain (get_ctx, set_ctx, extract_and_save)

### Rules
- Every new API helper function in `api/client.py` must have a corresponding test
- Every new session context field must have a chain simulation test
- Tests must mock all HTTP calls — no real API calls in tests (`responses` library)
- Auth token must never appear in test assertions as a real value

---

## TC API Chain (Test Center)

Endpoints must be called in order — each step feeds IDs into the next:

```
TC: Get Institution  →  institution_uuid
        ↓
TC: Get Exams        →  exam_uuid          (needs institution_uuid)
        ↓
TC: Delivery Windows →  delivery_window_uuid (needs institution_uuid + exam_uuid)
        ↓
TC: Test Locations   →  vendor_uuid, tc_location_id
        ↓
TC: Availability     →  time slots
        ↓
TC: Post Appointment →  appointment_uuid
        ↓
TC: Delete Appointment  (needs institution_uuid + exam_uuid + appointment_uuid)
```

The Session Data panel (right column in Streamlit) shows all captured IDs
and auto-fills downstream forms once upstream calls succeed.

---

## Known Endpoint Quirks

- `addBlueBirdExam`: uses `active_date` + `end_date` (not `start_date`)
- `getScheduleInfoAvailableTimesList`: POST with query params, empty body; same endpoint used by both Get Availability and Add Adhoc Step 1
- `removeReservation`: POST but `student_id` + `exam_id` are query params, not body
- `whoami` (TC): no inputs needed — auth token alone returns the institution
- `add_record_plus_exams/fulfill`: form-encoded with just `reservation_uuid`
- TC: Get Exams `modality` valid values: `in_person`, `live_plus`, `record_plus`, `automated`
- TC: Delivery Windows: flat URL `/api/v2/delivery_windows?exam_uuid=...&institution_uuid=...` — NOT nested path params
- TC: Test Locations: flat URL `/api/v2/test_center_locations?search=...&exam_uuid=...&delivery_window_uuid=...` — no `institution_uuid` needed in this call
