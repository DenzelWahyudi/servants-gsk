import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Home } from "./pages/Home"
import { Schedule } from "./pages/Schedule"
import { Openings } from "./pages/Openings"
import { Register } from "./pages/Register"
import { Login } from "./pages/Login"
import { AuthProvider } from "./context/AuthProvider"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { CreateService } from "./pages/CreateService"
import { RegisterAdmin } from "./pages/RegisterAdmin"
import { LoginAdmin } from "./pages/LoginAdmin"
import { AdminServices } from "./pages/AdminServices"
import { AdminRoles } from "./pages/AdminRoles"
import { AdminAdmissions } from "./pages/AdminAdmissions"
import { Chats } from "./pages/Chats"
import { AdminUsers } from "./pages/AdminUsers"
import { ForgotPassword } from "./pages/ForgotPassword.tsx"
import { Landing } from "./pages/Landing"

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Public routes */}
                    <Route path="/register" element={<Register />} />
                    <Route path="/admin/register" element={<RegisterAdmin />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin/login" element={<LoginAdmin />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/" element={<Landing />} />

                    {/* Protected routes */}
                    <Route
                        path="/home"
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/schedule"
                        element={
                            <ProtectedRoute>
                                <Schedule />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/openings"
                        element={
                            <ProtectedRoute>
                                <Openings />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/chats"
                        element={
                            <ProtectedRoute>
                                <Chats />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/services"
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <AdminServices />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/services/create"
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <CreateService />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/roles"
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <AdminRoles />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/admissions"
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <AdminAdmissions />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/users"
                        element={
                            <ProtectedRoute requiredRole="admin">
                                <AdminUsers />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}
