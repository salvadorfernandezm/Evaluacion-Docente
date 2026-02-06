import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { ClipboardList, Download, Eye, Search, Filter, Calendar } from 'lucide-react'

export default function EvaluacionesPage() {
  const [evaluaciones, setEvaluaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPeriodo, setFilterPeriodo] = useState('')
  const [filterMaestria, setFilterMaestria] = useState('')
  const [periodos, setPeriodos] = useState([])
  const [maestrias, setMaestrias] = useState([])
  const [selectedEvaluacion, setSelectedEvaluacion] = useState(null)
  const [showDetalle, setShowDetalle] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      
      // Cargar evaluaciones
      const { data: evaluacionesData, error: evaluacionesError } = await supabase
        .from('evaluaciones')
        .select(`
          *,
          maestrias (nombre),
          especialidades (nombre),
          profesores (nombre_completo, materia),
          periodos (nombre)
        `)
        .order('created_at', { ascending: false })
      
      if (evaluacionesError) throw evaluacionesError
      
      // Cargar períodos
      const { data: periodosData } = await supabase
        .from('periodos')
        .select('*')
        .order('nombre', { ascending: false })
      
      // Cargar maestrías
      const { data: maestriasData } = await supabase
        .from('maestrias')
        .select('*')
        .order('nombre')
      
      setEvaluaciones(evaluacionesData || [])
      setPeriodos(periodosData || [])
      setMaestrias(maestriasData || [])
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar evaluaciones')
    } finally {
      setLoading(false)
    }
  }

  const calcularPromedio = (evaluacion) => {
    const reactivos = [
      evaluacion.reactivo_1, evaluacion.reactivo_2, evaluacion.reactivo_3,
      evaluacion.reactivo_4, evaluacion.reactivo_5, evaluacion.reactivo_6,
      evaluacion.reactivo_7, evaluacion.reactivo_8, evaluacion.reactivo_9,
      evaluacion.reactivo_10, evaluacion.reactivo_11, evaluacion.reactivo_12,
      evaluacion.reactivo_13, evaluacion.reactivo_14, evaluacion.reactivo_15,
      evaluacion.reactivo_16, evaluacion.reactivo_17
    ]
    const suma = reactivos.reduce((acc, val) => acc + (val || 0), 0)
    return (suma / 17).toFixed(2)
  }

  const exportarAExcel = () => {
    // Preparar datos para CSV
    const headers = [
      'Fecha',
      'Hora',
      'Nombre Alumno',
      'Apellidos',
      'Email',
      'Maestría',
      'Especialidad',
      'Profesor',
      'Materia',
      'Período',
      ...Array.from({ length: 17 }, (_, i) => `Reactivo ${i + 1}`),
      'Promedio',
      'Comentarios'
    ]

    const rows = evaluacionesFiltradas.map(ev => [
      new Date(ev.fecha).toLocaleDateString('es-MX'),
      ev.hora,
      ev.nombre_alumno,
      ev.apellidos_alumno,
      ev.email,
      ev.maestrias?.nombre || '',
      ev.especialidades?.nombre || '',
      ev.profesores?.nombre_completo || '',
      ev.profesores?.materia || '',
      ev.periodos?.nombre || '',
      ev.reactivo_1, ev.reactivo_2, ev.reactivo_3, ev.reactivo_4, ev.reactivo_5,
      ev.reactivo_6, ev.reactivo_7, ev.reactivo_8, ev.reactivo_9, ev.reactivo_10,
      ev.reactivo_11, ev.reactivo_12, ev.reactivo_13, ev.reactivo_14, ev.reactivo_15,
      ev.reactivo_16, ev.reactivo_17,
      calcularPromedio(ev),
      `"${(ev.comentarios || '').replace(/"/g, '""')}"` // Escapar comillas
    ])

    // Convertir a CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Crear BOM para Excel (UTF-8 con BOM)
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `evaluaciones_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const verDetalle = (evaluacion) => {
    setSelectedEvaluacion(evaluacion)
    setShowDetalle(true)
  }

  // Filtrar evaluaciones
  const evaluacionesFiltradas = evaluaciones.filter(ev => {
    const matchSearch = 
      ev.nombre_alumno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.apellidos_alumno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.profesores?.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchPeriodo = !filterPeriodo || ev.periodo_id === filterPeriodo
    const matchMaestria = !filterMaestria || ev.maestria_id === filterMaestria
    
    return matchSearch && matchPeriodo && matchMaestria
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
          <h1 className="text-3xl font-bold text-gray-900">Evaluaciones</h1>
          <p className="text-gray-600 mt-1">
            Total de evaluaciones registradas: {evaluacionesFiltradas.length}
          </p>
        </div>
        <button
          onClick={exportarAExcel}
          disabled={evaluacionesFiltradas.length === 0}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={20} />
          <span>Exportar a Excel</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar alumno, email o profesor..."
              className="input-field pl-10"
            />
          </div>
          
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterPeriodo}
              onChange={(e) => setFilterPeriodo(e.target.value)}
              className="input-field pl-10"
            >
              <option value="">Todos los períodos</option>
              {periodos.map(periodo => (
                <option key={periodo.id} value={periodo.id}>
                  {periodo.nombre}
                </option>
              ))}
            </select>
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

      {/* Lista de Evaluaciones */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {evaluacionesFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              {searchTerm || filterPeriodo || filterMaestria 
                ? 'No se encontraron evaluaciones con los filtros aplicados' 
                : 'No hay evaluaciones registradas'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alumno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profesor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maestría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Promedio
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {evaluacionesFiltradas.map((evaluacion) => {
                  const promedio = calcularPromedio(evaluacion)
                  return (
                    <tr key={evaluacion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{new Date(evaluacion.created_at).toLocaleDateString('es-MX')}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(evaluacion.created_at).toLocaleTimeString('es-MX')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {evaluacion.nombre_alumno} {evaluacion.apellidos_alumno}
                        </div>
                        <div className="text-xs text-gray-500">{evaluacion.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {evaluacion.profesores?.nombre_completo}
                        </div>
                        <div className="text-xs text-gray-500">{evaluacion.profesores?.materia}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{evaluacion.maestrias?.nombre}</div>
                        {evaluacion.especialidades && (
                          <div className="text-xs text-gray-500">{evaluacion.especialidades.nombre}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {evaluacion.periodos?.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`
                          px-2 py-1 text-xs font-semibold rounded-full
                          ${promedio <= 6 ? 'bg-red-100 text-red-800' :
                            promedio <= 8.5 ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'}
                        `}>
                          {promedio}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => verDetalle(evaluacion)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detalle */}
      {showDetalle && selectedEvaluacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 my-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Detalle de Evaluación</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(selectedEvaluacion.created_at).toLocaleString('es-MX')}
                </p>
              </div>
              <button
                onClick={() => setShowDetalle(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Información General */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Alumno:</p>
                  <p className="font-medium">{selectedEvaluacion.nombre_alumno} {selectedEvaluacion.apellidos_alumno}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email:</p>
                  <p className="font-medium">{selectedEvaluacion.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Profesor:</p>
                  <p className="font-medium">{selectedEvaluacion.profesores?.nombre_completo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Materia:</p>
                  <p className="font-medium">{selectedEvaluacion.profesores?.materia}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Maestría:</p>
                  <p className="font-medium">{selectedEvaluacion.maestrias?.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Período:</p>
                  <p className="font-medium">{selectedEvaluacion.periodos?.nombre}</p>
                </div>
              </div>

              {/* Calificaciones */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Calificaciones por Reactivo:</h3>
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 17 }, (_, i) => {
                    const reactivo = i + 1
                    const valor = selectedEvaluacion[`reactivo_${reactivo}`]
                    return (
                      <div key={reactivo} className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Reactivo {reactivo}</div>
                        <div className={`
                          text-2xl font-bold
                          ${valor <= 6 ? 'text-red-600' :
                            valor <= 8.5 ? 'text-orange-600' :
                            'text-green-600'}
                        `}>
                          {valor}/10
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                  <p className="text-sm text-gray-700">Promedio General:</p>
                  <p className="text-3xl font-bold text-primary-600">
                    {calcularPromedio(selectedEvaluacion)}/10
                  </p>
                </div>
              </div>

              {/* Comentarios */}
              {selectedEvaluacion.comentarios && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Comentarios del Alumno:</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedEvaluacion.comentarios}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetalle(false)}
                className="btn-primary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
