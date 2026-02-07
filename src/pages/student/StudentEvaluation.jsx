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

  // === NUEVO: estados para flujo Materia -> Profesor por ruta ===
  // BÁSICA
  const [profesoresBasicaAll, setProfesoresBasicaAll] = useState([]) // todos para la maestría (activos, es_basica)
  const [materiasBasica, setMateriasBasica] = useState([])           // materias únicas
  const [selectedMateriaBasica, setSelectedMateriaBasica] = useState(null)
  const [profesoresBasica, setProfesoresBasica] = useState([])       // filtrados por materia seleccionada

  // ESPECIALIDAD
  const [profesoresEspAll, setProfesoresEspAll] = useState([])       // todos para la especialidad (activos)
  const [materiasEsp, setMateriasEsp] = useState([])                 // materias únicas
  const [selectedMateriaEsp, setSelectedMateriaEsp] = useState(null)
  const [profesoresEspecialidad, setProfesoresEspecialidad] = useState([]) // filtrados por materia seleccionada

  const [loading, setLoading] = useState(false)

  // === CARGA DE PROFESORES PARA BÁSICA CUANDO ENTRA AL PASO 3 ===
  useEffect(() => {
    const cargarProfesoresBasica = async () => {
      if (!selectedMaestria || currentStep !== 3) return
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('profesores')
          .select('id, nombre_completo, materia, maestria_id, especialidad_id, es_basica, activa')
          .eq('maestria_id', selectedMaestria.id)
          .eq('es_basica', true)
          .eq('activa', true)
          .order('materia', { ascending: true })

        if (error) throw error
        const lista = data || []
        setProfesoresBasicaAll(lista)

        // Materias únicas (normaliza espacios)
        const materias = Array.from(
          new Set(lista.map(p => (p.materia || '').trim()).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b, 'es'))
        setMateriasBasica(materias)

        // Autoseleccionar materia si solo hay una
        if (materias.length === 1) {
          setSelectedMateriaBasica(materias[0])
        } else {
          setSelectedMateriaBasica(null)
        }
      } catch (e) {
        console.error('[Alumno/Básica] cargarProfesores:', e)
        alert('No se pudieron cargar los profesores del área básica.')
      } finally {
        setLoading(false)
      }
    }

    cargarProfesoresBasica()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMaestria, currentStep])

  // Filtrar profesores de BÁSICA por materia seleccionada
  useEffect(() => {
    if (currentStep !== 3) return
    if (!selectedMateriaBasica) {
      setProfesoresBasica([])
      return
    }
    const filtrados = (profesoresBasicaAll || []).filter(
      p => (p.materia || '').trim() === selectedMateriaBasica
    )
    setProfesoresBasica(filtrados)
  }, [selectedMateriaBasica, profesoresBasicaAll, currentStep])

  // === CARGA DE PROFESORES PARA ESPECIALIDAD CUANDO ENTRA AL PASO 5 ===
  useEffect(() => {
    const cargarProfesoresEspecialidad = async () => {
      if (!selectedEspecialidad || currentStep !== 5) return
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('profesores')
          .select('id, nombre_completo, materia, maestria_id, especialidad_id, activa')
          .eq('especialidad_id', selectedEspecialidad.id)
          .eq('activa', true)
          .order('materia', { ascending: true })

        if (error) throw error
        const lista = data || []
        setProfesoresEspAll(lista)

        const materias = Array.from(
          new Set(lista.map(p => (p.materia || '').trim()).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b, 'es'))
        setMateriasEsp(materias)

        if (materias.length === 1) {
          setSelectedMateriaEsp(materias[0])
        } else {
          setSelectedMateriaEsp(null)
        }
      } catch (e) {
        console.error('[Alumno/Esp] cargarProfesores:', e)
        alert('No se pudieron cargar los profesores de esta especialidad.')
      } finally {
        setLoading(false)
      }
    }

    cargarProfesoresEspecialidad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEspecialidad, currentStep])

  // Filtrar profesores de ESPECIALIDAD por materia seleccionada
  useEffect(() => {
    if (currentStep !== 5) return
    if (!selectedMateriaEsp) {
      setProfesoresEspecialidad([])
      return
    }
    const filtrados = (profesoresEspAll || []).filter(
      p => (p.materia || '').trim() === selectedMateriaEsp
    )
    setProfesoresEspecialidad(filtrados)
  }, [selectedMateriaEsp, profesoresEspAll, currentStep])

  // === PASOS (igual que tenías) ===
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

  // Profesores que enviamos al EvaluacionStep, ya filtrados por materia
  const profesoresParaPaso = currentStep === 3
    ? profesoresBasica
    : currentStep === 5
      ? profesoresEspecialidad
      : []

  // Validaciones mínimas antes de continuar (solo si quieres usarlas)
  // Puedes pasarlas como props a EvaluacionStep o dejarlas aquí para futuros hooks.

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="/logo.png"
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
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Selección de Materia en BÁSICA (paso 3) */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow p-4">
              {loading ? (
                <p className="text-sm text-gray-600">Cargando profesores del área básica…</p>
              ) : materiasBasica.length > 1 ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Materia (Área Básica) *
                  </label>
                  <select
                    className="input-field"
                    value={selectedMateriaBasica || ''}
                    onChange={(e) => setSelectedMateriaBasica(e.target.value || null)}
                  >
                    <option value="">Seleccionar materia</option>
                    {materiasBasica.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  {selectedMateriaBasica && profesoresBasica.length === 1 && (
                    <p className="text-xs text-gray-600">
                      Profesor(a): {profesoresBasica[0]?.nombre_completo}
                    </p>
                  )}
                </div>
              ) : materiasBasica.length === 1 ? (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Materia (Área Básica):</span> {materiasBasica[0]}
                  {profesoresBasica.length === 1 && (
                    <> — <span className="font-semibold">Profesor(a):</span> {profesoresBasica[0]?.nombre_completo}</>
                  )}
                </p>
              ) : (
                <p className="text-sm text-red-600">
                  No hay profesores activos registrados para el área básica de esta maestría.
                </p>
              )}
            </div>
          )}

          {/* Selección de Materia en ESPECIALIDAD (paso 5) */}
          {currentStep === 5 && (
            <div className="bg-white rounded-lg shadow p-4">
              {loading ? (
                <p className="text-sm text-gray-600">Cargando profesores de la especialidad…</p>
              ) : materiasEsp.length > 1 ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Materia (Especialidad) *
                  </label>
                  <select
                    className="input-field"
                    value={selectedMateriaEsp || ''}
                    onChange={(e) => setSelectedMateriaEsp(e.target.value || null)}
                  >
                    <option value="">Seleccionar materia</option>
                    {materiasEsp.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  {selectedMateriaEsp && profesoresEspecialidad.length === 1 && (
                    <p className="text-xs text-gray-600">
                      Profesor(a): {profesoresEspecialidad[0]?.nombre_completo}
                    </p>
                  )}
                </div>
              ) : materiasEsp.length === 1 ? (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Materia (Especialidad):</span> {materiasEsp[0]}
                  {profesoresEspecialidad.length === 1 && (
                    <> — <span className="font-semibold">Profesor(a):</span> {profesoresEspecialidad[0]?.nombre_completo}</>
                  )}
                </p>
              ) : (
                <p className="text-sm text-red-600">
                  No hay profesores activos registrados para esta especialidad.
                </p>
              )}
            </div>
          )}

          {/* Render del paso actual */}
          {CurrentStepComponent && (
            <CurrentStepComponent
              onNext={handleNext}
              onBack={handleBack}
              // Pasamos profesores ya filtrados por materia seleccionada
              profesores={profesoresParaPaso}
              loading={loading}
            />
          )}
        </div>
      </main>
    </div>
  )
}
