import { useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  QrCode, 
  LogOut
} from 'lucide-react'

interface SidebarProps {
  user?: { username: string; role?: string }
  onLogout: () => void
}

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = user?.role === 'admin'
    ? [
        { path: '/admin', icon: LayoutDashboard, label: 'Panel Admin' },
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/empleados', icon: Users, label: 'Empleados' },
        { path: '/qr-list', icon: QrCode, label: 'QRs Generados' },
      ]
    : [
        { path: '/scanner', icon: QrCode, label: 'Registrar Asistencia' },
      ]

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <QrCode className="w-8 h-8 text-blue-600" />
          <span className="font-bold text-gray-900">QR Asistencia</span>
        </div>
      </div>

      {/* Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="mb-4">
          <p className="text-sm text-gray-600">Hola,</p>
          <p className="font-medium text-gray-900">{user?.username || 'Usuario'}</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}
