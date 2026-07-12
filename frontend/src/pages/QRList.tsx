import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { QrCode, Download, Trash2, Search, Calendar } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { API_BASE } from '../utils/api'

export default function QRList() {
  const [qrTokens, setQrTokens] = useState<any[]>([])
  const [filteredQrs, setFilteredQrs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchQrTokens()
  }, [])

  useEffect(() => {
    filterQrTokens()
  }, [qrTokens, searchTerm, dateFilter])

  const fetchQrTokens = async () => {
    try {
      const token = localStorage.getItem('jwt_token')
      const response = await axios.get(`${API_BASE}/admin/qr-tokens`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setQrTokens(response.data || [])
      setFilteredQrs(response.data || [])
    } catch (error) {
      console.error('Error fetching QR tokens:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterQrTokens = () => {
    let filtered = qrTokens

    if (searchTerm) {
      filtered = filtered.filter(qr => 
        qr.locales?.nombre_local?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qr.empleado?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (dateFilter) {
      filtered = filtered.filter(qr => 
        qr.fecha_creacion?.startsWith(dateFilter) ||
        qr.created_at?.startsWith(dateFilter)
      )
    }

    setFilteredQrs(filtered)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este QR?')) return

    try {
      const token = localStorage.getItem('jwt_token')
      await axios.delete(`${API_BASE}/admin/qr-tokens/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchQrTokens()
    } catch (error) {
      console.error('Error deleting QR:', error)
    }
  }

  const handleDownloadQR = async (qrToken: string, nombreLocal: string) => {
    try {
      const frontendBase = import.meta.env.VITE_FRONTEND_URL || window.location.origin
      const qrLink = `${frontendBase}/login?login_type=user&qr_token=${encodeURIComponent(qrToken)}`
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrLink)}`
      
      const response = await fetch(qrUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `qr_${nombreLocal}_${Date.now()}.png`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error downloading QR:', error)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Calculate stats
  const totalLocales = new Set(filteredQrs.map(q => q.local_id)).size

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-gray-900 text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Sidebar user={user || undefined} onLogout={handleLogout} />
      
      <div className="ml-64 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestión de QRs</h1>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por local o empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm">
            <div className="text-3xl font-bold text-gray-900">{qrTokens.length}</div>
            <div className="text-gray-600 mt-1">Total QRs</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-sm">
            <div className="text-3xl font-bold text-gray-900">{filteredQrs.length}</div>
            <div className="text-gray-600 mt-1">QRs Filtrados</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-sm">
            <div className="text-3xl font-bold text-gray-900">{totalLocales}</div>
            <div className="text-gray-600 mt-1">Locales Únicos</div>
          </div>
        </div>

        {/* QR List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">QRs Generados</h2>
          </div>
          
          {filteredQrs.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <QrCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No hay QRs que mostrar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Local</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Empleado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Fecha</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Hora</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Token</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQrs.map((qr, index) => (
                    <tr 
                      key={qr.id || index}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-900">{qr.locales?.nombre_local || '-'}</td>
                      <td className="px-6 py-4 text-gray-900">{qr.empleado?.nombre || '-'}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {qr.fecha_creacion ? new Date(qr.fecha_creacion).toLocaleDateString() : 
                         qr.created_at ? new Date(qr.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {qr.fecha_creacion ? new Date(qr.fecha_creacion).toLocaleTimeString() : 
                         qr.created_at ? new Date(qr.created_at).toLocaleTimeString() : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <code className="px-2 py-1 bg-gray-100 rounded text-xs text-blue-600">
                          {qr.token?.substring(0, 8)}...
                        </code>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleDownloadQR(qr.token, qr.locales?.nombre_local || 'qr')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Descargar QR"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(qr.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar QR"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
