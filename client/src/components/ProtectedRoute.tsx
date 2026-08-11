import { Navigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import React from "react"

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRole?: string
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { isAuthenticated, user } = useAuth()

    if (!isAuthenticated && requiredRole) {
        return <Navigate to="/admin/login" replace />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/admin/login" replace />
    }
    return children
}
