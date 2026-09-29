import { lazy, Suspense, useEffect } from 'react'
import { App as AntApp, Spin } from 'antd'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AdminLayout } from './layouts/AdminLayout'
import { useAuthStore } from './stores/authStore'

const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })),
)
const OrdersPage = lazy(() =>
  import('./pages/OrdersPage').then((module) => ({ default: module.OrdersPage })),
)
const NewOrderPage = lazy(() =>
  import('./pages/NewOrderPage').then((module) => ({ default: module.NewOrderPage })),
)
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
)

function ProtectedRoute() {
  const token = useAuthStore((state) => state.token)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return <Outlet />
}

export default function App() {
  const { message } = AntApp.useApp()

  useEffect(() => {
    const handleHttpError = (event) => message.error(event.detail)
    window.addEventListener('app:http-error', handleHttpError)
    return () => window.removeEventListener('app:http-error', handleHttpError)
  }, [message])

  return (
    <Suspense fallback={<Spin fullscreen tip="页面加载中" />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/orders" replace />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/new" element={<NewOrderPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
