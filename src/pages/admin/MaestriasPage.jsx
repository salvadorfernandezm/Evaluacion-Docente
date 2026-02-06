import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { GraduationCap, Plus, Edit2, Trash2, BookOpen, Power } from 'lucide-react'

export default function MaestriasPage() {
  const [maestrias, setMaestrias] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [periodos, setPeriodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMaestriaModal, setShowMaestriaModal] = useState(false)
  const [showEspecialidadModal, setShowEspecialidadModal] = useState(false)
  const [editingMaestria, setEditingMaestria] = useState(null)
  const [editingEspecialidad, setEditingEspecialidad] = useState(null)
  const [selectedMaestriaForEsp, setSelectedMaestriaForEsp] = useState(null)
  
  const [maestriaForm, setMaestriaForm] = useState({
    nombre: '',
    periodo_id: '',
    activa: true
  })

  const [especialidadForm, setEspecialidadForm] = useState({
    nombre: '',
    maestria_id: '',
    activa: true
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      
      // Cargar maestrías
      const { data: maestriasData, error: maestriasError } = await supabase
        .from('maestrias')
        .select(`
          *,
          periodos (nombre)
        `)
        .order('nombre')
      
      if (maestriasError) throw maestriasError
      
      // Cargar especialidades
      const { data: especialidadesData, error: especialidadesError } = await supabase
        .from('especialidades')
        .select(`
          *,
          maestrias (nombre)
        `)
        .order('nombre')
      
      if (especialidadesError) throw especialidadesError
      
      // Cargar períodos
      const { data: periodosData, error: periodosError } = await supabase
        .from('periodos')
        .select('*')
        .order('nombre', { ascending: false })
      
      if (periodosError) throw periodosError
      
      setMaestrias(maestriasData || [])
      setEspecialidades(especialidadesData || [])
      setPeriodos(periodosData || [])
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  // MAESTRÍAS
  const handleMaestriaSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingMaestria) {
        const { error } = await supabase
          .from('maestrias')
          .update(maestriaForm)
          .eq('id', editingMaestria.id)
        
        if (error) throw error
        alert('Maestría actualizada exitosamente')
      } else {
        const { error } = await supabase
          .from('maestrias')
          .insert([maestriaForm])
        
        if (error) throw error
        alert('Maestría creada exitosamente')
      }
      
      setShowMaestriaModal(false)
      setEditingMaestria(null)
      setMaestriaForm({ nombre: '', periodo_id: '', activa: true })
      cargarDatos()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar maestría')
    }
  }

  const handleMaestriaEdit = (maestria) => {
    setEditingMaestria(maestria)
    setMaestriaForm({
      nombre: maestria.nombre,
      periodo_id: maestria.periodo_id || '',
      activa: maestria.activa
    })
    setShowMaestriaModal(true)
  }

  const handleMaestriaDelete = async (id) => {
    if (!window.confirm('¿Estás seguro? Se eliminarán también todas las especialidades y profesores asociados.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('maestrias')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      alert('Maestría eliminada exitosamente')
      cargarDatos()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar maestría')
    }
  }

  const toggleMaestriaActiva = async (maestria) => {
    try {
      const { error } = await supabase
        .from('maestrias')
        .update({ activa: !maestria.activa })
        .eq('id', maestria.id)
      
      if (error) throw error
      cargarDatos()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cambiar estado')
    }
  }

  // ESPECIALIDADES
  const handleEspecialidadSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingEspecialidad) {
        const { error } = await supabase
          .from('especialidades')
          .update(especialidadForm)
          .eq('id', editingEspecialidad.id)
        
        if (error) throw error
        alert('Especialidad actualizada exitosamente')
      } else {
        const { error } = await supabase
          .from('especialidades')
          .insert([especialidadForm])
        
        if (error) throw error
        alert('Especialidad creada exitosamente')
      }
      
      setShowEspecialidadModal(false)
      setEditingEspecialidad(null)
      setEspecialidadForm({ nombre: '', maestria_id: '', activa: true })
      cargarDatos()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar especialidad')
    }
  }

  const handleEspecialidadEdit = (especialidad) => {
    setEditingEspecialidad(especialidad)
    setEspecialidadForm({
      nombre: especialidad.nombre,
      maestria_id: especialidad.maestria_id,
      activa: especialidad.activa
    })
    setShowEspecialidadModal(true)
  }

  const handleEspecialidadDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta especialidad?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('especialidades')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      alert('Especialidad eliminada exitosamente')
      cargarDatos()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar especialidad')
    }
  }

  const toggleEspecialidadActiva = async (especialidad) => {
    try {
      const { error } = await supabase
        .from('especialidades')
        .update({ activa: !especialidad.activa })
        .eq('id', especialidad.id)
      
      if (error) throw error
      cargarDatos()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cambiar estado')
    }
  }

  const getEspecialidadesPorMaestria = (maestriaId) => {
    return especialidades.filter(e => e.maestria_id === maestriaId)
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Maestrías y Especialidades</h1>
        <p className="text-gray-600 mt-1">
          Gestiona los programas académicos del posgrado
        </p>
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            setEditingMaestria(null)
            setMaestriaForm({ nombre: '', periodo_id: '', activa: true })
            setShowMaestriaModal(true)
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nueva Maestría</span>
        </button>
        <button
          onClick={() => {
            setEditingEspecialidad(null)
            setEspecialidadForm({ nombre: '', maestria_id: '', activa: true })
            setShowEspecialidadModal(true)
          }}
          className="btn-secondary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nueva Especialidad</span>
        </button>
      </div>

      {/* Lista de Maestrías con sus Especialidades */}
      <div className="space-y-4">
        {maestrias.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay maestrías registradas</p>
          </div>
        ) : (
          maestrias.map((maestria) => (
            <div key={maestria.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header de Maestría */}
              <div className={`p-6 ${maestria.activa ? 'bg-primary-50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <GraduationCap className={`h-6 w-6 ${maestria.activa ? 'text-primary-600' : 'text-gray-400'}`} />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{maestria.nombre}</h3>
                      <p className="text-sm text-gray-600">
                        Período: {maestria.periodos?.nombre || 'Sin asignar'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleMaestriaActiva(maestria)}
                      className={`
                        px-3 py-1 rounded-full text-xs font-semibold
                        ${maestria.activa 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-200 text-gray-800'}
                      `}
                    >
                      {maestria.activa ? 'Activa' : 'Inactiva'}
                    </button>
                    <button
                      onClick={() => handleMaestriaEdit(maestria)}
                      className="p-2 text-primary-600 hover:bg-primary-100 rounded"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleMaestriaDelete(maestria.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Especialidades de esta Maestría */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                    <BookOpen size={16} className="mr-2" />
                    Especialidades ({getEspecialidadesPorMaestria(maestria.id).length})
                  </h4>
                  <button
                    onClick={() => {
                      setEspecialidadForm({ nombre: '', maestria_id: maestria.id, activa: true })
                      setShowEspecialidadModal(true)
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    + Agregar Especialidad
                  </button>
                </div>

                {getEspecialidadesPorMaestria(maestria.id).length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No hay especialidades registradas</p>
                ) : (
                  <div className="space-y-2">
                    {getEspecialidadesPorMaestria(maestria.id).map((esp) => (
                      <div
                        key={esp.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm text-gray-900">{esp.nombre}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleEspecialidadActiva(esp)}
                            className={`
                              px-2 py-1 rounded text-xs font-semibold
                              ${esp.activa 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-200 text-gray-800'}
                            `}
                          >
                            {esp.activa ? 'Activa' : 'Inactiva'}
                          </button>
                          <button
                            onClick={() => handleEspecialidadEdit(esp)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleEspecialidadDelete(esp.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Maestría */}
      {showMaestriaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingMaestria ? 'Editar Maestría' : 'Nueva Maestría'}
            </h2>
            
            <form onSubmit={handleMaestriaSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Maestría *
                </label>
                <input
                  type="text"
                  value={maestriaForm.nombre}
                  onChange={(e) => setMaestriaForm({ ...maestriaForm, nombre: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Maestría en Psicología Clínica"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período
                </label>
                <select
                  value={maestriaForm.periodo_id}
                  onChange={(e) => setMaestriaForm({ ...maestriaForm, periodo_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Seleccionar período</option>
                  {periodos.map(periodo => (
                    <option key={periodo.id} value={periodo.id}>
                      {periodo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maestria-activa"
                  checked={maestriaForm.activa}
                  onChange={(e) => setMaestriaForm({ ...maestriaForm, activa: e.target.checked })}
                  className="h-4 w-4 text-primary-600 rounded"
                />
                <label htmlFor="maestria-activa" className="ml-2 text-sm text-gray-700">
                  Maestría activa
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowMaestriaModal(false)
                    setEditingMaestria(null)
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingMaestria ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Especialidad */}
      {showEspecialidadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingEspecialidad ? 'Editar Especialidad' : 'Nueva Especialidad'}
            </h2>
            
            <form onSubmit={handleEspecialidadSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Especialidad *
                </label>
                <input
                  type="text"
                  value={especialidadForm.nombre}
                  onChange={(e) => setEspecialidadForm({ ...especialidadForm, nombre: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Terapia Cognitivo-Conductual"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maestría *
                </label>
                <select
                  value={especialidadForm.maestria_id}
                  onChange={(e) => setEspecialidadForm({ ...especialidadForm, maestria_id: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Seleccionar maestría</option>
                  {maestrias.map(maestria => (
                    <option key={maestria.id} value={maestria.id}>
                      {maestria.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="especialidad-activa"
                  checked={especialidadForm.activa}
                  onChange={(e) => setEspecialidadForm({ ...especialidadForm, activa: e.target.checked })}
                  className="h-4 w-4 text-primary-600 rounded"
                />
                <label htmlFor="especialidad-activa" className="ml-2 text-sm text-gray-700">
                  Especialidad activa
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEspecialidadModal(false)
                    setEditingEspecialidad(null)
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingEspecialidad ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
