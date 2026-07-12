import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { API_BASE } from '../utils/api'

export default function Scanner() {
  const [scanResult, setScanResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [observaciones, setObservaciones] = useState('')
  const [qrToken, setQrToken] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('qr_token') || localStorage.getItem('qr_token') || ''
    if (token) {
      setQrToken(token)
      localStorage.setItem('qr_token', token)
    }
    setLoading(false)
  }, [searchParams])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!qrToken || !user?.user_id) {
      setError('Falta token QR o usuario autenticado')
      return
    }

    try {
      setIsRegistering(true)
      const token = localStorage.getItem('jwt_token')
      const response = await axios.post(
        `${API_BASE}/api/registrar_simple`,
        { empleado_id: user.user_id, qr_token: qrToken, observaciones },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setScanResult(response.data)
      setError('')
      setObservaciones('')
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al registrar asistencia')
    } finally {
      setIsRegistering(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-6 sm:px-6">
      <div className="max-w-lg mx-auto">
        <div className="bg-white p-5 rounded-3xl shadow-xl border border-gray-200 mb-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-sm text-gray-500">Registrar Asistencia</p>
              <h1 className="text-2xl font-bold text-gray-900">Hola, {user?.username || 'Empleado'}</h1>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-blue-600 font-semibold hover:text-blue-700"
            >
              Cerrar sesión
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Token QR</p>
              <p className="font-medium text-slate-900 break-all">{qrToken || 'Sin token QR'}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Estado</p>
              <p className="text-sm text-slate-700">Completa observaciones y presiona registrar asistencia.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleRegister} className="bg-white p-5 rounded-3xl shadow-xl border border-gray-200">
          <label className="block text-gray-700 mb-3 font-medium">Observaciones</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-3xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingresa una observación opcional"
          />

          {!qrToken && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-3xl">
              No se encontró el token QR. Debes entrar desde el enlace generado por el QR para poder registrar la asistencia.
            </div>
          )}

          <button
            type="submit"
            disabled={isRegistering || !qrToken}
            className="mt-5 w-full bg-blue-600 text-white py-3 rounded-3xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {isRegistering ? 'Registrando...' : 'Registrar asistencia'}
          </button>
        </form>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-3xl">
            {error}
          </div>
        )}

        {scanResult && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-3xl">
            <p className="font-bold">{scanResult.mensaje}</p>
            <p className="text-sm mt-1">
              Fecha: {new Date(scanResult.registro?.fecha_hora || scanResult.fecha || Date.now()).toLocaleString()}
            </p>
            <button
              onClick={() => setScanResult(null)}
              className="mt-4 w-full bg-green-600 text-white py-3 rounded-3xl hover:bg-green-700 transition-colors"
            >
              Registrar otra
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
