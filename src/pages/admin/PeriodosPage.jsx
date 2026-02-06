import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { Calendar, Plus, Edit2, Trash2, Power, CheckCircle, XCircle } from 'lucide-react'

export default function PeriodosPage() {
  const [periodos, setPeriodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPeriodo, setEditingPeriodo] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    activo: false
  })

  useEffect(() => {
    cargarPeriodos()
  }, [])

  const cargarPeriodos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('periodos')
        .select('*')
        .order('nombre', { ascending: false })
      
      if (error) throw error
      setPeriodos(data || [])
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar períodos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingPeriodo) {
        // Actualizar
        const { error } = await supabase
          .from('periodos')
          .update(formData)
          .eq('id', editingPeriodo.id)
        
        if (error) throw error
        alert('Período actualizado exitosamente')
      } else {
        // Crear
        const { error } = await supabase
          .from('periodos')
          .insert([formData])
        
        if (error) throw error
        alert('Período creado exitosamente')
      }
      
      setShowModal(false)
      setEditingPeriodo(null)
      setFormData({ nombre: '', fecha_inicio: '', fecha_fin: '', activo: false })
      cargarPeriodos()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar período')
    }
  }

  const handleEdit = (periodo) => {
    setEditingPeriodo(periodo)
    setFormData({
      nombre: periodo.nombre,
      fecha_inicio: periodo.fecha_inicio || '',
      fecha_fin: periodo.fecha_fin || '',
      activo: periodo.activo
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este período? Se eliminarán también todas las maestrías, profesores y evaluaciones asociadas.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('periodos')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      alert('Período eliminado exitosamente')
      cargarPeriodos()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar período')
    }
  }

  const toggleActivo = async (periodo) => {
    try {
      // Si se va a activar este período, desactivar todos los demás primero
      if (!periodo.activo) {
        await supabase
          .from('periodos')
          .update({ activo: false })
          .neq('id', periodo.id)
      }

      const { error } = await supabase
        .from('periodos')
        .update({ activo: !periodo.activo })
        .eq('id', periodo.id)
      
      if (error) throw error
      cargarPeriodos()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cambiar estado del período')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Períodos Semestrales</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los períodos de evaluación (2026A, 2026B, etc.)
          </p>
        </div>
        <button
          onClick={() => {
            setEditingPeriodo(null)
            setFormData({ nombre: '', fecha_inicio: '', fecha_fin: '', activo: false })
            setShowModal(true)
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nuevo Período</span>
        </button>
      </div>

      {/* Lista de Períodos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {periodos.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay períodos registrados</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Inicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Fin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {periodos.map((periodo) => (
                <tr key={periodo.id} className={periodo.activo ? 'bg-green-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {periodo.nombre}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {periodo.fecha_inicio ? new Date(periodo.fecha_inicio).toLocaleDateString('es-MX') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {periodo.fecha_fin ? new Date(periodo.fecha_fin).toLocaleDateString('es-MX') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActivo(periodo)}
                      className={`
                        inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                        ${periodo.activo 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
                      `}
                    >
                      {periodo.activo ? (
                        <>
                          <CheckCircle size={14} className="mr-1" />
                          Activo
                        </>
                      ) : (
                        <>
                          <XCircle size={14} className="mr-1" />
                          Inactivo
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(periodo)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(periodo.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingPeriodo ? 'Editar Período' : 'Nuevo Período'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Período *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input-field"
                  placeholder="Ej: 2026A, 2026B"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formato: AñoLetra (2026A para Feb-Jun, 2026B para Ago-Dic)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="h-4 w-4 text-primary-600 rounded"
                />
                <label htmlFor="activo" className="ml-2 text-sm text-gray-700">
                  Período activo (solo puede haber uno activo a la vez)
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingPeriodo(null)
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingPeriodo ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
