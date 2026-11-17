import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ForgotPassword from './pages/ForgotPassword'
import EnterCode from './pages/EnterCode'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Each teammate adds their own <Route> lines here */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/enter-code" element={<EnterCode />} />
        <Route path="*" element={<p className="p-6">Skywards Layover Companion</p>} />
      </Routes>
    </BrowserRouter>
  )
}