import { BrowserRouter, Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Each teammate adds their own <Route> lines here */}
        <Route path="*" element={<p className="p-6">Skywards Layover Companion</p>} />
      </Routes>
    </BrowserRouter>
  )
}