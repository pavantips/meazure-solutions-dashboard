const FIRST_NAMES = ['Jane','John','Alex','Maria','Sam','Chris','Taylor','Jordan','Morgan','Casey','Riley','Drew'];
const LAST_NAMES  = ['Smith','Doe','Johnson','Williams','Brown','Davis','Miller','Wilson','Moore','Taylor','Anderson','Lee'];
const DOMAINS     = ['demo.com','testmail.com','sandbox.org','example.com','yopmail.com'];
const STATES      = ['AL','TX','CA','NY','FL','OH','GA','WA','CO','AZ'];
const TIMEZONES   = ['Central Standard Time','Eastern Standard Time','Pacific Standard Time','Mountain Standard Time','New Zealand Standard Time','India Standard Time'];
const PRESETS     = ['medium','low','high'];
const COURSES     = ['CS101','BIO220','MATH310','ENG405','PHY202','HIST101','MBA501'];
const EXAM_NAMES  = [
  'Introduction to Management','Advanced Calculus','Business Ethics',
  'Principles of Marketing','Organic Chemistry','Financial Accounting',
  'Data Structures','Corporate Finance','Microeconomics','Project Management',
  'Human Resources Management','Statistics for Business','Network Security',
  'Introduction to Psychology','Strategic Leadership',
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randId(len = 8) { return Math.random().toString(36).substring(2, 2 + len).toUpperCase(); }
function randNum(digits = 6) { return String(Math.floor(Math.random() * 10 ** digits)).padStart(digits, '0'); }

function makeEmail(first, last) {
  return `${first.toLowerCase()}.${last.toLowerCase()}${randInt(1, 999)}@${pick(DOMAINS)}`;
}

export function randomStudent() {
  const first = pick(FIRST_NAMES);
  const last  = pick(LAST_NAMES);
  const id    = `STU${randNum(6)}`;
  return {
    first_name:   first,
    last_name:    last,
    student_id:   id,
    user_id:      `${first.toLowerCase()}${randInt(10,99)}`,
    user_password:`Pass${randId(6)}!`,
    email:        makeEmail(first, last),
    address1:     `${randInt(100, 9999)} ${pick(['Main St','Oak Ave','Elm Dr','Park Blvd','River Rd'])}`,
    city:         pick(['Hoover','Austin','Denver','Tampa','Portland','Atlanta','Seattle']),
    state:        pick(STATES),
    country:      'US',
    zipcode:      String(randInt(10000, 99999)),
    phone1:       `${randInt(200,999)}${randInt(100,999)}${randInt(1000,9999)}`,
    time_zone_id: pick(TIMEZONES),
    time_sent:    new Date().toISOString(),
    flag_notes:   '',
    campus:       '',
  };
}

export function randomExam() {
  const id = `EX${randId(6)}`;
  return {
    exam_id:       id,
    exam_name:     `Demo Exam ${randInt(100, 999)}`,
    exam_no:       id,
    description:   `Test exam created ${new Date().toLocaleDateString()}`,
    exam_url:      'https://postman.proctoru.com/',
    exam_password: `pwd${randId(4)}`,
    duration:      String(pick([30, 60, 90, 120])),
    time_zone_id:  pick(TIMEZONES),
    course_no:     pick(COURSES),
    active_date:   new Date().toISOString().slice(0, 16),
    end_date:      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  };
}

export function randomTermExam() {
  const examId = `EX${randId(5)}`;
  return {
    term_id:       '905181996',
    term_name:     `Term ${randInt(100,999)}`,
    exam_id:       examId,
    exam_no:       examId,
    description:   `Exam ${randInt(100,999)} - ${new Date().toLocaleDateString()}`,
    exam_url:      'http://google.com',
    password:      `pwd${randId(4)}`,
    notes:         '',
    start_date:    new Date().toISOString().slice(0, 16),
    end_date:      new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    instructor:    `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    courseno:      pick(COURSES),
    max_attempt:   '0',
    duration:      String(pick([30, 60, 90, 120])),
    active:        'Y',
    department_id: '740363261',
  };
}

export function randomAutoLogin() {
  const first = pick(FIRST_NAMES);
  const last  = pick(LAST_NAMES);
  return {
    time_sent:    new Date().toISOString(),
    student_id:   String(randInt(100, 9999)),
    email:        makeEmail(first, last),
    first_name:   first,
    last_name:    last,
    time_zone_id: pick(TIMEZONES),
    url_return:   'https://proctoru.com',
    update:       'Y',
  };
}

export function randomRecordPlus() {
  const first = pick(FIRST_NAMES);
  const last  = pick(LAST_NAMES);
  const id    = `STU${randNum(6)}`;
  const tag   = randInt(1000, 9999);
  return {
    student_id:   id,
    first_name:   first,
    last_name:    last,
    email:        makeEmail(first, last),
    Address1:     '',
    City:         '',
    ZipCode:      '',
    State:        '',
    country:      pick(['US','CA','NZ','AU','GB','IN']),
    phone1:       `${randInt(200,999)}${randInt(100,999)}${randInt(1000,9999)}`,
    user_password:`Pass${tag}!`,
    time_zone_id: pick(TIMEZONES),
    exam_id:       String(randInt(1000, 9999)),
    description:   pick(EXAM_NAMES),
    exam_url:      'https://www.examurl.com',
    duration:      String(pick([30, 60, 90, 120])),
    preset:        pick(PRESETS),
    exam_password: `EP${randNum(8)}`,
  };
}
