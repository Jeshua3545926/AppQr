import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { Users, Plus, Download, Upload, Edit, Trash2, Search } from 'lucide-react'
import * as XLSX from 'xlsx'
import Sidebar from '../components/Sidebar'
import { API_BASE } from '../utils/api'

export default function Empleados() {
  const [empleados, setEmpleados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEmpleado, setEditingEmpleado] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredEmpleados, setFilteredEmpleados] = useState<any[]>([])
  
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchEmpleados()
  }, [])

  useEffect(() => {
    filterEmpleados()
  }, [empleados, searchTerm])

  const normalizeEmpleados = (payload: any): any[] => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.empleados)) return payload.empleados
    if (Array.isArray(payload?.data)) return payload.data
    if (payload && typeof payload === 'object') {
      const candidate = Object.values(payload).find((value) => Array.isArray(value))
      if (Array.isArray(candidate)) return candidate
    }
    return []
  }

  const fetchEmpleados = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('jwt_token')
      const response = await axios.get(`${API_BASE}/admin/empleados`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = normalizeEmpleados(response.data)
      setEmpleados(data)
      setFilteredEmpleados(data)
    } catch (error: any) {
      console.error('Error fetching empleados:', error)
      const fallback = [] as any[]
      setEmpleados(fallback)
      setFilteredEmpleados(fallback)
      if (error?.response?.status === 401) {
        localStorage.removeItem('jwt_token')
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const filterEmpleados = () => {
    const list = Array.isArray(empleados) ? empleados : []

    if (!searchTerm.trim()) {
      setFilteredEmpleados(list)
      return
    }

    const filtered = list.filter(emp => 
      emp.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredEmpleados(filtered)
  }

  const handleAddEmpleado = async (nombre: string) => {
    try {
      const token = localStorage.getItem('jwt_token')
      await axios.post(
        `${API_BASE}/admin/create-employee`,
        { nombre },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchEmpleados()
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding empleado:', error)
    }
  }

  const handleUpdateEmpleado = async (id: string, nombre: string) => {
    try {
      const token = localStorage.getItem('jwt_token')
      await axios.put(
        `${API_BASE}/admin/empleados/${id}`,
        { nombre },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchEmpleados()
      setEditingEmpleado(null)
    } catch (error) {
      console.error('Error updating empleado:', error)
    }
  }

  const handleDeleteEmpleado = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este empleado?')) return

    try {
      const token = localStorage.getItem('jwt_token')
      await axios.delete(`${API_BASE}/admin/empleados/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchEmpleados()
    } catch (error) {
      console.error('Error deleting empleado:', error)
    }
  }

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('jwt_token')
      const response = await axios.get(`${API_BASE}/admin/export-empleados`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `empleados_${Date.now()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error exporting empleados:', error)
    }
  }

  const handleImportExcel = async (file: File) => {
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]
      
      const token = localStorage.getItem('jwt_token')
      await axios.post(
        `${API_BASE}/admin/import-empleados`,
        { empleados: jsonData },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      fetchEmpleados()
    } catch (error) {
      console.error('Error importing empleados:', error)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-gray-900 text-xl">Cargando...</div>
      </div>
    )
  }

  const totalEmpleados = empleados.length
  const empleadosFiltrados = filteredEmpleados.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Sidebar user={user || undefined} onLogout={handleLogout} />
      
      <div className="ml-64 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestión de Empleados</h1>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Agregar Empleado
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Exportar Excel
          </button>
          <label className="bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-5 h-5" />
            Importar Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImportExcel(file)
              }}
              className="hidden"
            />
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar empleado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Agregar Nuevo Empleado</h2>
            <EmpleadoForm
              onSubmit={handleAddEmpleado}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* Edit Form */}
        {editingEmpleado && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Editar Empleado</h2>
            <EmpleadoForm
              initialNombre={editingEmpleado.nombre}
              onSubmit={(nombre) => handleUpdateEmpleado(editingEmpleado.id, nombre)}
              onCancel={() => setEditingEmpleado(null)}
            />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm">
            <div className="text-3xl font-bold text-gray-900">{totalEmpleados}</div>
            <div className="text-gray-600 mt-1">Total Empleados</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-sm">
            <div className="text-3xl font-bold text-gray-900">{empleadosFiltrados}</div>
            <div className="text-gray-600 mt-1">Empleados Filtrados</div>
          </div>
        </div>

        {/* Empleados List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Lista de Empleados</h2>
          </div>
          
          {filteredEmpleados.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No hay empleados que mostrar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nombre</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Fecha de Creación</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmpleados.map((emp) => (
                    <tr 
                      key={emp.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-600">
                        <code className="px-2 py-1 bg-gray-100 rounded text-xs text-blue-600">
                          {emp.id?.substring(0, 8)}...
                        </code>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{emp.nombre}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {emp.created_at ? new Date(emp.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingEmpleado(emp)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmpleado(emp.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
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

function EmpleadoForm({ 
  initialNombre, 
  onSubmit, 
  onCancel 
}: { 
  initialNombre?: string
  onSubmit: (nombre: string) => void
  onCancel: () => void 
}) {
  const [nombre, setNombre] = useState(initialNombre || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return
    
    setLoading(true)
    await onSubmit(nombre)
    setLoading(false)
    setNombre('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Nombre del Empleado</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Guardando...' : initialNombre ? 'Actualizar' : 'Agregar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
