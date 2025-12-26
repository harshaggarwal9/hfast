import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignUp from './components/SignUp';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminDashboard from './components/Admin/AdminDashboard';
import Overview from './components/Admin/Overview';
import UserApproval from './components/Admin/UserApproval';
import useAuthStore from './stores/useAuthStore.js';
import AssignTeacher from './components/Admin/AssignTeacher.jsx';
import AddSubject from './components/Admin/AddSubject.jsx';
import AddClass from './components/Admin/AddClass.jsx';
import TeacherDashboard from './components/Teacher/TeacherDashboard.jsx';
import Profile from './components/Teacher/Profile.jsx';
import CreateExamForm from './components/Teacher/CreateExam.jsx';
import CreateResultForm from './components/Teacher/CreateResult.jsx';
import StudentDashboard from './components/Student/StudentDashboard.jsx';
import ProfileSection from './components/Student/Profile.jsx';
import ParentDashboard from './components/parents/parentDashboard.jsx';
import  ParentProfileSection from './components/parents/profile.jsx';
import FeeManagement from './components/Admin/Feemanagement.jsx';
import FeePayment from './components/parents/Fees.jsx';
import Notification from './components/Admin/createNotification.jsx'
import GetNotifications from './components/getNotifcations.jsx';
import CreateSlot from './components/Admin/CreateTimeTable.jsx';
import ShowTimeTable from './components/Teacher/GetTimetable.jsx';
import StudentTimeTable from './components/Student/TimeTable.jsx';
import StudentResults from './components/Student/ShowResult.jsx';
import GetNotifications2 from './components/getNotification2.jsx';
import { useEffect } from 'react';
import ParentStudentResults from './components/parents/ShowResult.jsx';
const App = () => {

  const {user} = useAuthStore();
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, []);
  return (
    <div className="bg-[#102E50] h-screen">
      <Toaster />
      <BrowserRouter>
       <Routes> 
        
          {/* Public Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/signUp" element={<SignUp />} />
          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="user-approval" element={<UserApproval />} />
            <Route path="teacher-assignment" element={<AssignTeacher/>}/>
            <Route path="add-subject" element={<AddSubject/>}/>
            <Route path="add-class" element={<AddClass/>}/>
            <Route path="fee-management" element={<FeeManagement/>}/>
            <Route path="notifications" element={<Notification/>}/>
            <Route path="create-timetable" element={<CreateSlot/>}/>
          </Route>
          </Route>
          <Route element={<ProtectedRoute allowedRole="teacher" />}>
            <Route path="/teacher" element={<TeacherDashboard />}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="create-exam" element={<CreateExamForm/>}/>
            <Route path="create-result" element={<CreateResultForm/>}/>
            <Route path="notifications" element={<GetNotifications/>}/>
            <Route path="Show-Timetable" element={<ShowTimeTable/>}/>
          </Route>
          </Route>
          <Route element={<ProtectedRoute allowedRole="student"/>}>
            <Route path = "/student" element ={<StudentDashboard/>}> 
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<ProfileSection />} />
             <Route path="notifications" element={<GetNotifications2/>}/>
             <Route path="time table" element={<StudentTimeTable/>}/>
             <Route path="show result" elememnt={<StudentResults/>}/>
           </Route>
          </Route>
          <Route element={<ProtectedRoute allowedRole="parent"/>}>
          <Route path="/parent" element={<ParentDashboard/>}>
          <Route index element={<Navigate to = "profile" replace />}/>
          <Route path="profile" element={<ParentProfileSection/>}/>
          <Route path="fee-payment" element={<FeePayment/>}/>
          <Route path="notifications" element={<GetNotifications2/>}/>
          <Route path="show-results" element={<ParentStudentResults/>}/>
          </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};
export default App;
