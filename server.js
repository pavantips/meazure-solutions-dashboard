require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT       = process.env.PORT || 3000;
const API_BASE   = process.env.PROCTORU_API_BASE;
const DEMO_BASE  = process.env.PROCTORU_DEMO_BASE;
const GO_BASE    = process.env.PROCTORU_GO_BASE;
const TC_BASE       = process.env.TC_API_BASE;
const TC_GO_BASE    = process.env.TC_GO_BASE;
const MEAZURE_BASE  = process.env.MEAZURE_API_BASE;
const MEAZURE_TOKEN = process.env.MEAZURE_TOKEN;
const AUTH_TOKEN    = process.env.PROCTORU_AUTH_TOKEN; // never exposed to the client

app.use(express.json());

// ── Helpers ───────────────────────────────────────────────────

function authHeaders(contentType = 'application/json') {
  return { 'Authorization-Token': AUTH_TOKEN, 'Content-Type': contentType };
}

function handleError(res, err, meta) {
  const status = err.response?.status || 502;
  const data   = err.response?.data   || { message: err.message };
  console.error(`[Proxy] Error ${status}:`, data);
  res.status(status).json({ success: false, status, data, _request: meta });
}

// JSON POST (e.g. addBlueBirdExam, editTermExam)
async function forwardPost(res, url, body) {
  const meta = { url, method: 'POST', contentType: 'application/json', body };
  console.log(`[Proxy] POST (json) ${url}`);
  try {
    const response = await axios.post(url, body, { headers: authHeaders() });
    res.status(response.status).json({ success: true, status: response.status, data: response.data, _request: meta });
  } catch (err) { handleError(res, err, meta); }
}

// Form-encoded POST — uses application/x-www-form-urlencoded (--data-urlencode curls)
async function forwardForm(res, url, body) {
  const params = new URLSearchParams();
  Object.entries(body).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
  });
  const meta = { url, method: 'POST', contentType: 'application/x-www-form-urlencoded', body };
  console.log(`[Proxy] POST (form-encoded) ${url}`);
  try {
    const response = await axios.post(url, params, {
      headers: authHeaders('application/x-www-form-urlencoded'),
    });
    res.status(response.status).json({ success: true, status: response.status, data: response.data, _request: meta });
  } catch (err) { handleError(res, err, meta); }
}

// GET with query params
async function forwardGet(res, url, params) {
  const meta = { url, method: 'GET', params };
  console.log(`[Proxy] GET ${url}`, params);
  try {
    const response = await axios.get(url, { headers: authHeaders(), params });
    res.status(response.status).json({ success: true, status: response.status, data: response.data, _request: meta });
  } catch (err) { handleError(res, err, meta); }
}

// POST with both query params and JSON body (e.g. Post Appointment)
async function forwardPostWithQuery(res, url, queryParams, body) {
  const meta = { url, method: 'POST', contentType: 'application/json', queryParams, body };
  console.log(`[Proxy] POST+query ${url}`, queryParams);
  try {
    const response = await axios.post(url, body, { headers: authHeaders(), params: queryParams });
    res.status(response.status).json({ success: true, status: response.status, data: response.data, _request: meta });
  } catch (err) { handleError(res, err, meta); }
}

// DELETE
async function forwardDelete(res, url) {
  const meta = { url, method: 'DELETE' };
  console.log(`[Proxy] DELETE ${url}`);
  try {
    const response = await axios.delete(url, { headers: authHeaders() });
    res.status(response.status).json({ success: true, status: response.status, data: response.data, _request: meta });
  } catch (err) { handleError(res, err, meta); }
}

// JSON POST to an external service with its own auth in the body (e.g. Meazure)
async function forwardPostExternal(res, url, body) {
  const meta = { url, method: 'POST', contentType: 'application/json', body };
  console.log(`[Proxy] POST (external/no-auth-header) ${url}`);
  try {
    const response = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' } });
    res.status(response.status).json({ success: true, status: response.status, data: response.data, _request: meta });
  } catch (err) { handleError(res, err, meta); }
}

// ── User Events ───────────────────────────────────────────────

// Create User  — demo.proctoru.com, form-encoded
app.post('/api/proxy/createUser', (req, res) =>
  forwardForm(res, `${DEMO_BASE}/editStudent/`, req.body));

// Auto Login   — demo.proctoru.com, form-encoded
app.post('/api/proxy/autoLogin', (req, res) =>
  forwardForm(res, `${DEMO_BASE}/autoLogin/`, req.body));

// Add Bluebird — api.proctoru.com, JSON
app.post('/api/proxy/addBluebird', (req, res) =>
  forwardPost(res, `${API_BASE}/addBlueBirdExam`, req.body));

// Get Adhoc Slots — api.proctoru.com, POST with query params, empty body
app.post('/api/proxy/getAdhocSlots', (req, res) => {
  const { time_sent, time_zone_id, start_date, duration, takeitnow } = req.body;
  forwardPostWithQuery(res, `${API_BASE}/getScheduleInfoAvailableTimesList/`, {
    time_sent:    time_sent || new Date().toISOString(),
    time_zone_id,
    isadhoc:      'Y',
    start_date,
    takeitnow:    takeitnow || 'Y',
    duration,
  }, null);
});

// Add Adhoc    — api.proctoru.com, JSON
app.post('/api/proxy/addAdhoc', (req, res) =>
  forwardPost(res, `${API_BASE}/addAdHocProcess`, req.body));

// Record+      — go.proctoru.com, JSON
app.post('/api/proxy/recordPlus', (req, res) =>
  forwardPost(res, `${GO_BASE}/exams/add_record_plus_exams`, req.body));

// Record+ New  — go.proctoru.com, form-encoded
app.post('/api/proxy/recordPlusNew', (req, res) =>
  forwardForm(res, `${GO_BASE}/exams/add_record_plus_exams_new`, req.body));

// Fulfill Record+ — demo.proctoru.com, form-encoded
app.post('/api/proxy/recordPlusFulfill', (req, res) =>
  forwardForm(res, `${DEMO_BASE}/exams/add_record_plus_exams/fulfill`, req.body));

// Get Terms    — api.proctoru.com, GET
app.post('/api/proxy/getTerms', (req, res) =>
  forwardGet(res, `${API_BASE}/getInstitutionTermList/`, { time_sent: req.body.time_sent }));

// Get Departments — api.proctoru.com, GET
app.post('/api/proxy/getDepartments', (req, res) =>
  forwardGet(res, `${API_BASE}/getInstitutionDepartmentList/`, { time_sent: req.body.time_sent }));

// Create Exam  — api.proctoru.com, JSON
app.post('/api/proxy/createExam', (req, res) =>
  forwardPost(res, `${API_BASE}/editTermExam`, req.body));

// Get Exams    — api.proctoru.com, GET
app.post('/api/proxy/getExams', (req, res) =>
  forwardGet(res, `${API_BASE}/getInstitutionExamList/`, {
    time_sent: req.body.time_sent,
    term_id:   req.body.term_id,
  }));

// ── Reports ───────────────────────────────────────────────────

// GET — query params: time_sent, student_id, status
app.post('/api/proxy/getReservations', (req, res) => {
  const { time_sent, student_id, status } = req.body;
  forwardGet(res, `${API_BASE}/getStudentReservationList/`, { time_sent, student_id, status });
});

// Begin Reservation — stub (curl coming soon)
app.post('/api/proxy/beginReservation', (req, res) =>
  forwardForm(res, `${API_BASE}/beginReservation/`, req.body));

// Cancel / Remove Reservation — api.proctoru.com, POST with query params
app.post('/api/proxy/cancelReservation', (req, res) => {
  const { student_id, exam_id } = req.body;
  const url = `${API_BASE}/removeReservation/`;
  const meta = { url, method: 'POST', params: { student_id, exam_id } };
  const axios = require('axios');
  axios.post(url, null, {
    headers: { 'Authorization-Token': AUTH_TOKEN, 'Content-Type': 'application/json' },
    params: { student_id, exam_id },
  })
  .then(r => res.status(r.status).json({ success: true, status: r.status, data: r.data, _request: meta }))
  .catch(err => {
    const status = err.response?.status || 502;
    const data   = err.response?.data   || { message: err.message };
    res.status(status).json({ success: false, status, data, _request: meta });
  });
});

// Get Availability — stub (curl coming soon)
// Get Availability — same endpoint as getAdhocSlots, POST with query params
app.post('/api/proxy/getAvailability', (req, res) => {
  const { time_sent, time_zone_id, start_date, duration, takeitnow, isadhoc } = req.body;
  forwardPostWithQuery(res, `${API_BASE}/getScheduleInfoAvailableTimesList/`, {
    time_sent:    time_sent || new Date().toISOString(),
    time_zone_id,
    isadhoc:      isadhoc || 'N',
    start_date,
    takeitnow:    takeitnow || 'N',
    duration,
  }, null);
});

// ── Test Center API (v2) ──────────────────────────────────────

// GET /api/v2/whoami — auth token identifies the institution, no params needed
app.post('/api/proxy/tc/whoami', (req, res) => {
  forwardGet(res, `${TC_BASE}/whoami`, {});
});

// GET /api/v2/institutions/:institution_uuid/exams
app.post('/api/proxy/tc/getExams', (req, res) => {
  const { institution_uuid, modality, active } = req.body;
  forwardGet(res, `${TC_BASE}/institutions/${institution_uuid}/exams`, { modality, active });
});

// GET /api/v2/delivery_windows?exam_uuid=...&institution_uuid=...
app.post('/api/proxy/tc/deliveryWindows', (req, res) => {
  const { exam_uuid, institution_uuid } = req.body;
  forwardGet(res, `${TC_BASE}/delivery_windows`, { exam_uuid, institution_uuid });
});

// GET /api/v2/test_center_locations?search=...&exam_uuid=...&delivery_window_uuid=...
app.post('/api/proxy/tc/testLocations', (req, res) => {
  const { search, exam_uuid, delivery_window_uuid } = req.body;
  forwardGet(res, `${TC_BASE}/test_center_locations`, { search, exam_uuid, delivery_window_uuid });
});

// GET go.proctoru.com/api/v2/test_center_locations/:vendor_uuid/:tc_location_id/time_slots
app.post('/api/proxy/tc/availability', (req, res) => {
  const { vendor_uuid, test_center_location_id, exam_uuid, delivery_window_uuid, start_time, end_time } = req.body;
  const url = `${TC_GO_BASE}/test_center_locations/${vendor_uuid}/${test_center_location_id}/time_slots`;
  forwardGet(res, url, { exam_uuid, delivery_window_uuid, start_time, end_time });
});

// POST /api/v2/institutions/:institution_uuid/exams/:exam_uuid/appointments?start_url=...
app.post('/api/proxy/tc/postAppointment', (req, res) => {
  const { institution_uuid, exam_uuid, start_url, time_slot, user } = req.body;
  const url = `${TC_BASE}/institutions/${institution_uuid}/exams/${exam_uuid}/appointments`;
  forwardPostWithQuery(res, url, { start_url }, { time_slot, user });
});

// DELETE go.proctoru.com/api/v2/institutions/:institution_uuid/exams/:exam_uuid/appointments/:appointment_uuid
app.post('/api/proxy/tc/deleteAppointment', (req, res) => {
  const { institution_uuid, exam_uuid, appointment_uuid } = req.body;
  const url = `${TC_GO_BASE}/institutions/${institution_uuid}/exams/${exam_uuid}/appointments/${appointment_uuid}`;
  forwardDelete(res, url);
});

// ── Meazure (YSA) ────────────────────────────────────────────

// Meazure Create User — api.ysasecure.com/v2/users, JSON, token injected server-side
app.post('/api/proxy/meazureCreateUser', (req, res) => {
  const body = {
    token: MEAZURE_TOKEN,
    user: {
      username:           req.body.username,
      site_id:            Number(req.body.site_id),
      first_name:         req.body.first_name,
      last_name:          req.body.last_name,
      email:              req.body.email,
      alternate_email:    req.body.alternate_email,
      address_attributes: {
        address1:    req.body.address1,
        address2:    req.body.address2,
        city:        req.body.city,
        province:    req.body.province,
        country:     req.body.country,
        postal_code: req.body.postal_code,
      },
      preferred_language: req.body.preferred_language,
      partner_id:         req.body.partner_id,
    },
    send_email: req.body.send_email === true || req.body.send_email === 'true',
  };
  forwardPostExternal(res, `${MEAZURE_BASE}/users`, body);
});

app.listen(PORT, () => {
  console.log(`[Server] Proxy running at http://localhost:${PORT}`);
});
