import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { GraduationCap, Plus, Edit2, Trash2, BookOpen, ArrowUp, ArrowDown } from 'lucide-react'

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

  // === ORDEN EDITABLE ===
  const [ordenEdits, setOrdenEdits] = useState({}) // { [maestriaId]: "valorTemporal" }
  const setOrdenEdit = (id, valor) => {
    setOrdenEdits(prev => ({ ...prev, [id]: valor }))
  }
  const saveOrden = async (maestria) => {
    const raw = ordenEdits[maestria.id] ?? maestria.orden
    const nuevo = Number(raw)
    if (!Number.isFinite(nuevo) || nuevo < 1) {
      alert('Orden inválido. Usa un entero >= 1.')
      return
    }
    try {
      const { error } = await supabase
        .from('maestrias')
        .update({ orden: nuevo })
        .eq('id', maestria.id)
      if (error) {
        console.error('[SUPABASE UPDATE orden maestrias]', error)
        alert(`Supabase: ${error.code || ''} - ${error.message || 'Error'}\n${error.details || ''}`)
        return
      }
      await cargarDatos()
      setOrdenEdits(prev => {
        const { [maestria.id]: _omit, ...rest } = prev
        return rest
      })
    } catch (e) {
      console.error('[Maestrías] saveOrden (catch):', e)
      alert(`No se pudo guardar el orden.\n${e?.message || ''}`)
    }
  }
  // === /ORDEN EDITABLE ===

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)

      // Maestrías: pedir por 'orden' y respaldo en cliente (orden -> nombre)
      const { data: maestriasData, error: maestriasError } = await supabase
        .from('maestrias')
        .select(`
          *,
          periodos (nombre)
        `)
        .order('orden', { ascending: true })
      if (maestriasError) throw maestriasError

      // Respaldo: ordenar también en cliente
      const maesOrdenadas = (maestriasData || []).slice().sort((a, b) => {
        const oa = a?.orden ?? Number.MAX_SAFE_INTEGER
        const ob = b?.orden ?? Number.MAX_SAFE_INTEGER
        if (oa !== ob) return oa - ob
        return (a?.nombre ?? '').localeCompare(b?.nombre ?? '', 'es')
      })

      // Especialidades
      const { data: especialidadesData, error: especialidadesError } = await supabase
        .from('especialidades')
        .select(`
          *,
          maestrias (nombre)
        `)
        .order('nombre')
      if (especialidadesError) throw especialidadesError

      // Períodos
      const { data: periodosData, error: periodosError } = await supabase
        .from('periodos')
        .select('*')
        .order('nombre', { ascending: false })
      if (periodosError) throw periodosError

      setMaestrias(maesOrdenadas)
      setEspecialidades(especialidadesData || [])
      setPeriodos(periodosData || [])
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  // 🔀 Mover maestría (swap robusto + temp DENTRO de integer)
  const moveMaestria = async (index, dir) => {
    const otherIndex = dir === 'up' ? index - 1 : index + 1
    if (otherIndex < 0 || otherIndex >= maestrias.length) return

    const curr = maestrias[index]
    const next = maestrias[otherIndex]

    // Evita overflow int4: temporal pequeño (min(orden)-1), fallback 0
    let tempOrden = Math.min(Number(curr?.orden ?? 1), Number(next?.orden ?? 1)) - 1
    if (!Number.isFinite(tempOrden) || tempOrden < -2147483647) {
      tempOrden = 0
    }

    try {
      // 1) curr -> temp
      let { error: e1 } = await supabase.from('maestrias').update({ orden: tempOrden }).eq('id', curr.id)
      if (e1) {
        console.error('[SUPABASE UPDATE curr->temp]', e1)
        alert(`Supabase: ${e1.code || ''} - ${e1.message || 'Error'}\n${e1.details || ''}`)
        return
      }

      // 2) next -> curr.orden
      let { error: e2 } = await supabase.from('maestrias').update({ orden: curr.orden }).eq('id', next.id)
      if (e2) {
        console.error('[SUPABASE UPDATE next->curr.orden]', e2)
        alert(`Supabase: ${e2.code || ''} - ${e2.message || 'Error'}\n${e2.details || ''}`)
        return
      }

      // 3) curr(temp) -> next.orden
      let { error: e3 } = await supabase.from('maestrias').update({ orden: next.orden }).eq('id', curr.id)
      if (e3) {
        console.error('[SUPABASE UPDATE curr(temp)->next.orden]', e3)
        alert(`Supabase: ${e3.code || ''} - ${e3.message || 'Error'}\n${e3.details || ''}`)
        return
      }

      // Refresco optimista local
      const newList = [...maestrias]
      newList[index] = { ...next, orden: curr.orden }
      newList[otherIndex] = { ...curr, orden: next.orden }
      setMaestrias(newList)

      // Consistencia desde BD
      await cargarDatos()
    } catch (err) {
      console.error('[Maestrías] move error (catch):', err)
      alert(`No se pudo reordenar.\n${err?.message || ''}`)
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
        // Nueva: establecer orden = (max orden actual) + 1
        const { data: maxRows, error: maxErr } = await supabase
          .from('maestrias')
          .select('orden')
          .order('orden', { ascending: false })
          .limit(1)
        if (maxErr) throw maxErr
        const maxOrden = maxRows && maxRows.length ? (maxRows[0].orden || 0) : 0

        const payload = { ...maestriaForm, orden: maxOrden + 1 }
        const { error } = await supabase.from('maestrias').insert([payload])
        if (error) throw error
        alert('Maestría creada exitosamente')
      }

      // Primero recarga para ver el cambio, luego cierra modal
      await cargarDatos()
      setShowMaestriaModal(false)
      setEditingMaestria(null)
      setMaestriaForm({ nombre: '', periodo_id: '', activa: true })
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
      await cargarDatos()
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
      await cargarDatos()
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
      await cargarDatos()
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
    if (!window.confirm('¿Estás seguro de eliminar esta especialidad?')) return
    try {
      const { error } = await supabase
        .from('especialidades')
        .delete()
        .eq('id', id)
      if (error) throw error
      alert('Especialidad eliminada exitosamente')
      await cargarDatos()
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
      await cargarDatos()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cambiar estado')
    }
  }

  const getEspecialidadesPorMaestria = (maestriaId) => {
    return (especialidades || []).filter(e => e.maestria_id === maestriaId)
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
          maestrias.map((maestria, idx) => (
            <div key={maestria.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header de Maestría */}
              <div className={`p-6 ${maestria.activa ? 'bg-primary-50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <GraduationCap className={`h-6 w-6 ${maestria.activa ? 'text-primary-600' : 'text-gray-400'}`} />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {maestria.nombre}
                        {/* (Opcional) muestra el orden mientras pruebas */}
                        {/* <span className="ml-2 text-xs text-gray-500">(orden: {maestria.orden})</span> */}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Período: {maestria.periodos?.nombre || 'Sin asignar'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* 🆕 Orden editable */}
                    <div className="flex items-center gap-2 mr-2">
                      <input
                        type="number"
                        min={1}
                        className="input-field w-24"
                        value={ordenEdits[maestria.id] ?? maestria.orden}
                        onChange={(e) => setOrdenEdit(maestria.id, e.target.value)}
                        title="Orden (1 aparece primero)"
                      />
                      <button
                        onClick={() => saveOrden(maestria)}
                        className="btn-secondary"
                        title="Guardar orden"
                      >
                        Guardar orden
                      </button>
                    </div>

                    {/* Flechitas de orden */}
                    <button
                      onClick={() => moveMaestria(idx, 'up')}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                      title="Subir"
                      disabled={idx === 0}
                    >
                      <ArrowUp size={18} />
                    </button>
                    <button
                      onClick={() => moveMaestria(idx, 'down')}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                      title="Bajar"
                      disabled={idx === maestrias.length - 1}
                    >
                      <ArrowDown size={18} />
                    </button>

                    {/* Activa/Inactiva */}
                    <button
                      onClick={() => toggleMaestriaActiva(maestria)}
                      className={`
                        px-3 py-1 rounded-full text-xs font-semibold
                        ${maestria.activa ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}
                      `}
                      title={maestria.activa ? 'Desactivar' : 'Activar'}
                    >
                      {maestria.activa ? 'Activa' : 'Inactiva'}
                    </button>
                    <button
                      onClick={() => handleMaestriaEdit(maestria)}
                      className="p-2 text-primary-600 hover:bg-primary-100 rounded"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleMaestriaDelete(maestria.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded"
                      title="Eliminar"
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
                              ${esp.activa ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}
                            `}
                          >
                            {esp.activa ? 'Activa' : 'Inactiva'}
                          </button>
                          <button
                            onClick={() => handleEspecialidadEdit(esp)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleEspecialidadDelete(esp.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
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
``