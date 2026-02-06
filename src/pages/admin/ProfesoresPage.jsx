import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { Users, Plus, Edit2, Trash2, Search, Filter } from 'lucide-react'

export default function ProfesoresPage() {
  const [profesores, setProfesores] = useState([])
  const [maestrias, setMaestrias] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [periodos, setPeriodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProfesor, setEditingProfesor] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMaestria, setFilterMaestria] = useState('')
  
  const [formData, setFormData] = useState({
    nombre_completo: '',
    materia: '',
    maestria_id: '',
    especialidad_id: '',
    es_basica: false,
    es_compartida: false,
    periodo_id: ''
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      
      // Cargar profesores con relaciones
      const { data: profesoresData, error: profesoresError } = await supabase
        .from('profesores')
        .select(`
          *,
          maestrias (nombre),
          especialidades (nombre),
          periodos (nombre)
        `)
        .order('nombre_completo')
      
      if (profesoresError) throw profesoresError
      
      // Cargar maestrías
      const { data: maestriasData } = await supabase
        .from('maestrias')
        .select('*')
        .order('nombre')
      
      // Cargar especialidades
      const { data: especialidadesData } = await supabase
        .from('especialidades')
        .select('*')
        .order('nombre')
      
      // Cargar períodos
      const { data: periodosData } = await supabase
        .from('periodos')
        .select('*')
        .order('nombre', { ascending: false })
      
      setProfesores(profesoresData || [])
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validaciones
    if (!formData.maestria_id) {
      alert('Debes seleccionar una maestría')
      return
    }

    // Si no es básica, debe tener especialidad
    if (!formData.es_basica && !formData.especialidad_id) {
      alert('Las materias que no son básicas deben tener una especialidad asignada')
      return
    }

    // Si es básica, limpiar especialidad
    const dataToSave = {
      ...formData,
      especialidad_id: formData.es_basica ? null : formData.especialidad_id
    }
    
    try {
      if (editingProfesor) {
        const { error } = await supabase
          .from('profesores')
          .update(dataToSave)
          .eq('id', editingProfesor.id)
        
        if (error) throw error
        alert('Profesor actualizado exitosamente')
      } else {
        const { error } = await supabase
          .from('profesores')
          .insert([dataToSave])
        
        if (error) throw error
        alert('Profesor registrado exitosamente')
      }
      
      setShowModal(false)
      setEditingProfesor(null)
      resetForm()
      cargarDatos()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar profesor: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre_completo: '',
      materia: '',
      maestria_id: '',
      especialidad_id: '',
      es_basica: false,
      es_compartida: false,
      periodo_id: ''
    })
  }

  const handleEdit = (profesor) => {
    setEditingProfesor(profesor)
    setFormData({
      nombre_completo: profesor.nombre_completo,
      materia: profesor.materia,
      maestria_id: profesor.maestria_id,
      especialidad_id: profesor.especialidad_id || '',
      es_basica: profesor.es_basica,
      es_compartida: profesor.es_compartida,
      periodo_id: profesor.periodo_id || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este profesor?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('profesores')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      alert('Profesor eliminado exitosamente')
      cargarDatos()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar profesor')
    }
  }

  const getEspecialidadesPorMaestria = (maestriaId) => {
    return especialidades.filter(e => e.maestria_id === maestriaId)
  }

  // Filtrar profesores
  const profesoresFiltrados = profesores.filter(profesor => {
    const matchSearch = profesor.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       profesor.materia.toLowerCase().includes(searchTerm.toLowerCase())
    const matchMaestria = !filterMaestria || profesor.maestria_id === filterMaestria
    return matchSearch && matchMaestria
  })

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
          <h1 className="text-3xl font-bold text-gray-900">Profesores</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los profesores y las materias que imparten
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProfesor(null)
            resetForm()
            setShowModal(true)
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nuevo Profesor</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o materia..."
              className="input-field pl-10"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterMaestria}
              onChange={(e) => setFilterMaestria(e.target.value)}
              className="input-field pl-10"
            >
              <option value="">Todas las maestrías</option>
              {maestrias.map(maestria => (
                <option key={maestria.id} value={maestria.id}>
                  {maestria.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Profesores */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {profesoresFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              {searchTerm || filterMaestria ? 'No se encontraron profesores' : 'No hay profesores registrados'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profesor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Materia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maestría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
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
                {profesoresFiltrados.map((profesor) => (
                  <tr key={profesor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {profesor.nombre_completo.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {profesor.nombre_completo}
                          </div>
                          <div className="text-sm text-gray-500">
                            {profesor.periodos?.nombre}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{profesor.materia}</div>
                      {profesor.especialidades && (
                        <div className="text-xs text-gray-500">
                          {profesor.especialidades.nombre}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {profesor.maestrias?.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {profesor.es_basica && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Básica
                          </span>
                        )}
                        {profesor.es_compartida && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            Compartida
                          </span>
                        )}
                        {!profesor.es_basica && !profesor.es_compartida && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Especialidad
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Activo
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(profesor)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(profesor.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingProfesor ? 'Editar Profesor' : 'Nuevo Profesor'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo del Docente *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre_completo}
                    onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                    className="input-field"
                    placeholder="Ej: Dr. Juan Pérez García"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Materia que Imparte *
                  </label>
                  <input
                    type="text"
                    value={formData.materia}
                    onChange={(e) => setFormData({ ...formData, materia: e.target.value })}
                    className="input-field"
                    placeholder="Ej: Fundamentos de Psicología"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maestría en la que Imparte *
                  </label>
                  <select
                    value={formData.maestria_id}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        maestria_id: e.target.value,
                        especialidad_id: '' // Reset especialidad al cambiar maestría
                      })
                    }}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período
                  </label>
                  <select
                    value={formData.periodo_id}
                    onChange={(e) => setFormData({ ...formData, periodo_id: e.target.value })}
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Especialidad
                  </label>
                  <select
                    value={formData.especialidad_id}
                    onChange={(e) => setFormData({ ...formData, especialidad_id: e.target.value })}
                    className="input-field"
                    disabled={formData.es_basica || !formData.maestria_id}
                  >
                    <option value="">Sin especialidad (deja vacío si es básica)</option>
                    {formData.maestria_id && getEspecialidadesPorMaestria(formData.maestria_id).map(esp => (
                      <option key={esp.id} value={esp.id}>
                        {esp.nombre}
                      </option>
                    ))}
                  </select>
                  {formData.es_basica && (
                    <p className="text-xs text-gray-500 mt-1">
                      Las materias básicas no requieren especialidad
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Configuración de la Materia:</p>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        id="es_basica"
                        checked={formData.es_basica}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          es_basica: e.target.checked,
                          especialidad_id: e.target.checked ? '' : formData.especialidad_id
                        })}
                        className="h-4 w-4 text-primary-600 rounded"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="es_basica" className="text-sm font-medium text-gray-700">
                        ¿Es materia básica?
                      </label>
                      <p className="text-xs text-gray-500">
                        Las materias básicas son evaluadas por todos los alumnos de la maestría, sin importar la especialidad
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        id="es_compartida"
                        checked={formData.es_compartida}
                        onChange={(e) => setFormData({ ...formData, es_compartida: e.target.checked })}
                        className="h-4 w-4 text-primary-600 rounded"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="es_compartida" className="text-sm font-medium text-gray-700">
                        ¿Es materia compartida?
                      </label>
                      <p className="text-xs text-gray-500">
                        Una parte del grupo la imparte un profesor y otra parte otro profesor diferente. Los alumnos elegirán cuál les impartió la materia.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingProfesor(null)
                    resetForm()
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingProfesor ? 'Actualizar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
