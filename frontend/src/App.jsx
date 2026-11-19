import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthProvider from './auth/AuthProvider'
import ProtectedRoute from './auth/ProtectedRoute'
import GuestRoute from './auth/GuestRoute'
import RoleRedirect from './auth/RoleRedirect'
import Login from './pages/Login'
import Register from './pages/Register'
import PassengerHome from './pages/PassengerHome'
import AdminHome from './pages/AdminHome'
import ForgotPassword from './pages/ForgotPassword'
import EnterCode from './pages/EnterCode'
import ResetPassword from './pages/ResetPassword'
import ConnectionSelect from './pages/ConnectionSelect'
import ItineraryPage from './pages/ItineraryPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Each teammate adds their own <Route> lines here */}
          <Route path="/" element={<RoleRedirect />} />

          {/* Logged-out only: a logged-in user is sent to their role's home */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Passenger screens: add new passenger routes inside this block */}
          <Route element={<ProtectedRoute roles={['passenger']} />}>
            <Route path="/passenger" element={<PassengerHome />} />
            <Route path="/layover" element={<ConnectionSelect />} />
            <Route path="/itinerary" element={<ItineraryPage />} />
          </Route>

          {/* Admin screens: add new admin routes inside this block */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin" element={<AdminHome />} />
          </Route>

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/enter-code" element={<EnterCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<p className="p-6">Skywards Layover Companion</p>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
