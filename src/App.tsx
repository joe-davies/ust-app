import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { Layout } from './components/Layout'
import { ALL_LEAVES } from './nav'
import Home from './pages/Home'
import Placeholder from './pages/Placeholder'
import Account from './pages/Account'
import Admin from './pages/Admin'
import { Login, SignUp } from './pages/AuthPages'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
            {/* Generated placeholder routes: replace with real pages as they are built. */}
            {ALL_LEAVES.map((leaf) => (
              <Route key={leaf.path} path={leaf.path} element={<Placeholder />} />
            ))}
            <Route path="*" element={<Placeholder />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
