import { Navigate } from 'react-router-dom'

function isAuth() {
    return !!localStorage.getItem('rg_session')
}

export default function ProtectedRoute({ children }) {
    if (!isAuth()) {
        return <Navigate to="/login" replace />
    }
    return children
}
