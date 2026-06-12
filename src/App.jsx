import { Routes, Route } from 'react-router-dom'

import AdminLogin from './pages/AdminLogin'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import MyOrders from './pages/MyOrders'
import Admin from './pages/Admin'
import AdminDashboard from './pages/AdminDashboard'
import AdminProducts from './pages/AdminProducts'
import ProtectedRoute from './components/ProtectedRoute'
import AdminCustomers from './pages/AdminCustomers'

export default function App() {
  return (
    <Routes>
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/" element={<Home />} />
      <Route
  path="/admin/customers"
  element={
    <ProtectedRoute>
      <AdminCustomers />
    </ProtectedRoute>
  }
/>
      <Route
  path="/admin/orders"
  element={
    <ProtectedRoute>
      <Admin />
    </ProtectedRoute>
  }
/>
      <Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
      <Route
  path="/admin/products"
  element={<AdminProducts />}
/>
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/my-orders" element={<MyOrders />} />
      <Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
      <Route path="/cart" element={<Cart />} />
    </Routes>
  )
}