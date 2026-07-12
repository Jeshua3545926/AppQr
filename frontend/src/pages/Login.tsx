import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { QrCode } from 'lucide-react'
import { API_BASE } from '../utils/api'

export default function Login() {
  const [loginType, setLoginType] = useState<'admin' | 'user'>('admin')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [empleadoId, setEmpleadoId] = useState('')
  const [empleados, setEmpleados] = useState<any[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingEmpleados, setLoadingEmpleados] = useState(false)
  const [qrToken, setQrToken] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const qrTokenParam = searchParams.get('qr_token')
    const loginTypeParam = searchParams.get('login_type')

    if (loginTypeParam === 'user') {
      setLoginType('user')
      fetchEmpleados()
    }

    if (qrTokenParam) {
      setQrToken(qrTokenParam)
      localStorage.setItem('qr_token', qrTokenParam)
      setLoginType('user')
      fetchEmpleados()
    }
  }, [searchParams])

  useEffect(() => {
    if (loginType === 'user' && empleados.length === 0 && !loadingEmpleados) {
      fetchEmpleados()
    }
  }, [loginType, empleados.length, loadingEmpleados])

  const fetchEmpleados = async () => {
    try {
      setLoadingEmpleados(true)
      const response = await axios.get(`${API_BASE}/empleados`)
      const data = Array.isArray(response.data) ? response.data : []
      setEmpleados(data)
    } catch (error) {
      console.error('Error fetching empleados:', error)
      setError('No se pudo cargar la lista de empleados. Revisa la conexión.')
      setEmpleados([])
    } finally {
      setLoadingEmpleados(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(loginType, username, password, empleadoId)

      if (loginType === 'admin') {
        navigate('/admin')
      } else {
        const nextPath = qrToken ? `/scanner?qr_token=${encodeURIComponent(qrToken)}` : '/scanner'
        navigate(nextPath)
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error en el login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl border border-gray-200 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sistema QR Asistencia</h1>
          <p className="text-gray-500 mt-2">Control de asistencia inteligente</p>
        </div>

        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setLoginType('admin')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${loginType === 'admin' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => setLoginType('user')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${loginType === 'user' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Empleado
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {loginType === 'admin' ? (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Usuario</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </>
          ) : (
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Seleccionar Empleado</label>
              {loadingEmpleados ? (
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-500">
                  Cargando empleados...
                </div>
              ) : empleados.length === 0 ? (
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700">
                  No se encontraron empleados. Verifica que el backend esté accesible desde tu red.
                </div>
              ) : (
                <select
                  value={empleadoId}
                  onChange={(e) => setEmpleadoId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" className="text-gray-400">Seleccione un empleado</option>
                  {empleados.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
          {qrToken && (
            <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
              QR cargado. Después de iniciar sesión, registra tu asistencia con observaciones.
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
