import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import CreateUser   from './pages/CreateUser';
import AutoLogin    from './pages/AutoLogin';
import AddBluebird  from './pages/AddBluebird';
import RecordPlus   from './pages/RecordPlus';
import GetTerms     from './pages/GetTerms';
import GetDepartments from './pages/GetDepartments';
import CreateExam   from './pages/CreateExam';
import GetExams     from './pages/GetExams';
import AddAdhoc            from './pages/AddAdhoc';
import RecordPlusFulfill   from './pages/RecordPlusFulfill';
import GetAvailability     from './pages/GetAvailability';
import BeginReservation    from './pages/BeginReservation';
import MeazureCreateUser   from './pages/MeazureCreateUser';
import GetReservations    from './pages/GetReservations';
import CancelReservation  from './pages/CancelReservation';
import TCGetInstitution  from './pages/TCGetInstitution';
import TCGetExams         from './pages/TCGetExams';
import TCDeliveryWindows  from './pages/TCDeliveryWindows';
import TCTestLocations    from './pages/TCTestLocations';
import TCAvailability     from './pages/TCAvailability';
import TCPostAppointment  from './pages/TCPostAppointment';
import TCDeleteAppointment from './pages/TCDeleteAppointment';
import ComingSoon         from './pages/ComingSoon';

export default function App() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', background: '#f5f6fa' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/create-user" replace />} />

          {/* ── User Events ── */}
          <Route path="/create-user"     element={<CreateUser />} />
          <Route path="/auto-login"      element={<AutoLogin />} />
          <Route path="/add-bluebird"    element={<AddBluebird />} />
          <Route path="/add-adhoc"           element={<AddAdhoc />} />
          <Route path="/record-plus"         element={<RecordPlus />} />
          <Route path="/record-plus-fulfill" element={<RecordPlusFulfill />} />
          <Route path="/record-plus-new"     element={<ComingSoon title="Record+ New"  endpoint="POST /api/addRecordExamNew" />} />
          <Route path="/get-terms"       element={<GetTerms />} />
          <Route path="/get-departments" element={<GetDepartments />} />
          <Route path="/create-exams"    element={<CreateExam />} />
          <Route path="/get-exams"       element={<GetExams />} />
          <Route path="/begin-reservation"  element={<BeginReservation />} />
          <Route path="/cancel-reservation" element={<CancelReservation />} />
          <Route path="/get-availability"   element={<GetAvailability />} />

          {/* ── Reports ── */}
          <Route path="/get-reservations"   element={<GetReservations />} />

          {/* ── Meazure Exam Platform ── */}
          <Route path="/meazure-create-user" element={<MeazureCreateUser />} />

          {/* ── Test Center API ── */}
          <Route path="/tc-get-institution"    element={<TCGetInstitution />} />
          <Route path="/tc-get-exams"          element={<TCGetExams />} />
          <Route path="/tc-delivery-windows"   element={<TCDeliveryWindows />} />
          <Route path="/tc-test-locations"     element={<TCTestLocations />} />
          <Route path="/tc-availability"       element={<TCAvailability />} />
          <Route path="/tc-create-reservation" element={<TCPostAppointment />} />
          <Route path="/tc-cancel-reservation" element={<TCDeleteAppointment />} />
        </Routes>
      </main>
    </div>
  );
}
