import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import {
  Users,
  GraduationCap,
  ClipboardList,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEvaluaciones: 0,
    totalProfesores: 0,
    totalMaestrias: 0,
    periodoActivo: null
  })
  const [loading, setLoading] = useState(true)
  const [recentEvaluaciones, setRecentEvaluaciones] = useState([])

  useEffect(() => {
    cargarEstadisticas()
    cargarEvaluacionesRecientes()
  }, [])

  const cargarEstadisticas = async () => {
    try {
      setLoading(true)

      // Total de evaluaciones
      const { count: evaluacionesCount } = await supabase
        .from('evaluaciones')
        .select('*', { count: 'exact', head: true })

      // Total de profesores
      const { count: profesoresCount } = await supabase
        .from('profesores')
        .select('*', { count: 'exact', head: true })

      // Total de maestrías activas
      const { count: maestriasCount } = await supabase
        .from('maestrias')
        .select('*', { count: 'exact', head: true })
        .eq('activa', true)

      // Período activo
      const { data: periodoData } = await supabase
        .from('periodos')
        .select('*')
        .eq('activo', true)
        .single()

      setStats({
        totalEvaluaciones: evaluacionesCount || 0,
        totalProfesores: profesoresCount || 0,
        totalMaestrias: maestriasCount || 0,
        periodoActivo: periodoData
      })
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const cargarEvaluacionesRecientes = async () => {
    try {
      const { data, error } = await supabase
        .from('evaluaciones')
        .select(`
          *,
          profesores (nombre_completo, materia),
          maestrias (nombre)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setRecentEvaluaciones(data || [])
    } catch (error) {
      console.error('Error cargando evaluaciones recientes:', error)
    }
  }

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  )

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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Resumen general del sistema de evaluación docente
          </p>
        </div>
        <button
          onClick={() => {
            cargarEstadisticas()
            cargarEvaluacionesRecientes()
          }}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw size={20} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Período Activo */}
      {stats.periodoActivo && (
        <div className="bg-primary-600 text-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6" />
            <div>
              <p className="text-sm opacity-90">Período Activo</p>
              <p className="text-2xl font-bold">{stats.periodoActivo.nombre}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={ClipboardList}
          label="Total de Evaluaciones"
          value={stats.totalEvaluaciones}
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          label="Profesores Registrados"
          value={stats.totalProfesores}
          color="bg-green-500"
        />
        <StatCard
          icon={GraduationCap}
          label="Maestrías Activas"
          value={stats.totalMaestrias}
          color="bg-purple-500"
        />
      </div>

      {/* Evaluaciones Recientes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Evaluaciones Recientes
          </h2>
          <a href="/admin/evaluaciones" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Ver todas →
          </a>
        </div>

        {recentEvaluaciones.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay evaluaciones registradas aún</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
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
                    Promedio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentEvaluaciones.map((evaluacion) => {
                  const promedio = (
                    (evaluacion.reactivo_1 + evaluacion.reactivo_2 + evaluacion.reactivo_3 +
                    evaluacion.reactivo_4 + evaluacion.reactivo_5 + evaluacion.reactivo_6 +
                    evaluacion.reactivo_7 + evaluacion.reactivo_8 + evaluacion.reactivo_9 +
                    evaluacion.reactivo_10 + evaluacion.reactivo_11 + evaluacion.reactivo_12 +
                    evaluacion.reactivo_13 + evaluacion.reactivo_14 + evaluacion.reactivo_15 +
                    evaluacion.reactivo_16 + evaluacion.reactivo_17) / 17
                  ).toFixed(2)

                  return (
                    <tr key={evaluacion.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(evaluacion.created_at).toLocaleDateString('es-MX')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {evaluacion.nombre_alumno} {evaluacion.apellidos_alumno}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <p className="font-medium">{evaluacion.profesores?.nombre_completo}</p>
                          <p className="text-gray-500 text-xs">{evaluacion.profesores?.materia}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {evaluacion.maestrias?.nombre}
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
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <a href="/admin/profesores" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-primary-600" />
            <div>
              <p className="font-semibold text-gray-900">Gestionar Profesores</p>
              <p className="text-sm text-gray-600">Agregar o editar</p>
            </div>
          </div>
        </a>

        <a href="/admin/maestrias" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-8 w-8 text-primary-600" />
            <div>
              <p className="font-semibold text-gray-900">Gestionar Maestrías</p>
              <p className="text-sm text-gray-600">Configurar programas</p>
            </div>
          </div>
        </a>

        <a href="/admin/reportes" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-primary-600" />
            <div>
              <p className="font-semibold text-gray-900">Ver Reportes</p>
              <p className="text-sm text-gray-600">Análisis y PDF</p>
            </div>
          </div>
        </a>

        <a href="/admin/evaluaciones" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-3">
            <Download className="h-8 w-8 text-primary-600" />
            <div>
              <p className="font-semibold text-gray-900">Exportar Datos</p>
              <p className="text-sm text-gray-600">CSV/Excel</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  )
}
