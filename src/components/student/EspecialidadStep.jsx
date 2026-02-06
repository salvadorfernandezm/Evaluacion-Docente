import React, { useState, useEffect } from 'react'
import { useEvaluationStore } from '../../store/evaluationStore'
import { supabase } from '../../config/supabase'
import { BookOpen, ChevronRight, ChevronLeft } from 'lucide-react'

export default function EspecialidadStep({ onNext, onBack }) {
  const { selectedMaestria, setSelectedEspecialidad } = useEvaluationStore()
  const [especialidades, setEspecialidades] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedMaestria) {
      cargarEspecialidades()
    }
  }, [selectedMaestria])

  const cargarEspecialidades = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('especialidades')
        .select('*')
        .eq('maestria_id', selectedMaestria.id)
        .eq('activa', true)
        .order('nombre')
      
      if (error) throw error
      setEspecialidades(data || [])
    } catch (error) {
      console.error('Error cargando especialidades:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (selectedId) {
      const especialidad = especialidades.find(e => e.id === selectedId)
      setSelectedEspecialidad(especialidad)
      onNext()
    } else {
      // Si no hay especialidades o no se seleccionó ninguna, saltamos este paso
      onNext()
    }
  }

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando especialidades...</p>
      </div>
    )
  }

  if (especialidades.length === 0) {
    // Si no hay especialidades, pasar automáticamente al siguiente paso
    React.useEffect(() => {
      onNext()
    }, [])
    
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Esta maestría no tiene especialidades. Continuando...</p>
      </div>
    )
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="flex justify-center mb-6">
        <div className="bg-primary-100 p-4 rounded-full">
          <BookOpen className="h-12 w-12 text-primary-600" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
        Selecciona tu Especialidad
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Elige la especialidad que estás cursando en la maestría de {selectedMaestria?.nombre}
      </p>

      <div className="space-y-3 mb-8">
        {especialidades.map((especialidad) => (
          <div
            key={especialidad.id}
            onClick={() => setSelectedId(especialidad.id)}
            className={`
              border-2 rounded-lg p-4 cursor-pointer transition-all
              ${selectedId === especialidad.id 
                ? 'border-primary-600 bg-primary-50' 
                : 'border-gray-200 hover:border-primary-300 bg-white'}
            `}
          >
            <div className="flex items-center">
              <div className={`
                w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center
                ${selectedId === especialidad.id 
                  ? 'border-primary-600 bg-primary-600' 
                  : 'border-gray-300'}
              `}>
                {selectedId === especialidad.id && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {especialidad.nombre}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="btn-secondary flex items-center space-x-2"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Atrás</span>
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedId}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Continuar</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
