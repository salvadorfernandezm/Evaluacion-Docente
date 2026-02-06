import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import { useEvaluationStore } from '../../store/evaluationStore'
import { CONSENTIMIENTO_TEXT, REACTIVOS } from '../../constants/reactivos'

// Components
import ConsentimientoStep from '../../components/student/ConsentimientoStep'
import RegistroStep from '../../components/student/RegistroStep'
import MaestriaStep from '../../components/student/MaestriaStep'
import EvaluacionStep from '../../components/student/EvaluacionStep'
import EspecialidadStep from '../../components/student/EspecialidadStep'
import ConfirmacionStep from '../../components/student/ConfirmacionStep'

import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function StudentEvaluation() {
  const navigate = useNavigate()
  const { 
    currentStep, 
    setCurrentStep, 
    studentData,
    selectedMaestria,
    selectedEspecialidad,
    resetEvaluation
  } = useEvaluationStore()

  const [profesoresBasica, setProfesoresBasica] = useState([])
  const [profesoresEspecialidad, setProfesoresEspecialidad] = useState([])
  const [profesoresCompartidos, setProfesoresCompartidos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedMaestria && currentStep === 3) {
      cargarProfesoresBasica()
    }
  }, [selectedMaestria, currentStep])

  useEffect(() => {
    if (selectedEspecialidad && currentStep === 5) {
      cargarProfesoresEspecialidad()
    }
  }, [selectedEspecialidad, currentStep])

  const cargarProfesoresBasica = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profesores')
        .select('*')
        .eq('maestria_id', selectedMaestria.id)
        .eq('es_basica', true)
        .eq('es_compartida', false)
      
      if (error) throw error
      setProfesoresBasica(data || [])
    } catch (error) {
      console.error('Error cargando profesores:', error)
    } finally {
      setLoading(false)
    }
  }

  const cargarProfesoresEspecialidad = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profesores')
        .select('*')
        .eq('especialidad_id', selectedEspecialidad.id)
        .eq('es_compartida', false)
      
      if (error) throw error
      setProfesoresEspecialidad(data || [])
    } catch (error) {
      console.error('Error cargando profesores de especialidad:', error)
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { title: 'Consentimiento', component: ConsentimientoStep },
    { title: 'Registro', component: RegistroStep },
    { title: 'Maestría', component: MaestriaStep },
    { title: 'Evaluación Área Básica', component: EvaluacionStep },
    { title: 'Especialidad', component: EspecialidadStep },
    { title: 'Evaluación Especialidad', component: EvaluacionStep },
    { title: 'Materias Compartidas', component: EvaluacionStep },
    { title: 'Confirmación', component: ConfirmacionStep },
  ]

  const CurrentStepComponent = steps[currentStep]?.component

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCancel = () => {
    if (window.confirm('¿Estás seguro de que deseas cancelar la evaluación? Se perderán todos los datos ingresados.')) {
      resetEvaluation()
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="https://www.genspark.ai/api/files/s/PQ0EbNzP" 
                alt="Logo Posgrado UJED" 
                className="h-16 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Evaluación Docente
                </h1>
                <p className="text-sm text-gray-600">
                  {steps[currentStep]?.title}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Cancelar Evaluación
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Paso {currentStep + 1} de {steps.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% completado
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {CurrentStepComponent && (
            <CurrentStepComponent
              onNext={handleNext}
              onBack={handleBack}
              profesores={
                currentStep === 3 ? profesoresBasica :
                currentStep === 5 ? profesoresEspecialidad :
                profesoresCompartidos
              }
              loading={loading}
            />
          )}
        </div>
      </main>
    </div>
  )
}
