import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEvaluationStore } from '../../store/evaluationStore'
import { supabase } from '../../config/supabase'
import { CheckCircle, ChevronLeft, Send } from 'lucide-react'

export default function ConfirmacionStep({ onBack }) {
  const navigate = useNavigate()
  const { studentData, selectedMaestria, selectedEspecialidad, evaluaciones, resetEvaluation } = useEvaluationStore()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    try {
      setLoading(true)

      // Obtener el período activo
      const { data: periodoData, error: periodoError } = await supabase
        .from('periodos')
        .select('id')
        .eq('activo', true)
        .single()

      if (periodoError) throw periodoError

      // Guardar cada evaluación en la base de datos
      for (const evaluacion of evaluaciones) {
        const evaluacionData = {
          periodo_id: periodoData.id,
          nombre_alumno: studentData.nombre,
          apellidos_alumno: studentData.apellidos,
          email: studentData.email,
          maestria_id: selectedMaestria.id,
          especialidad_id: selectedEspecialidad?.id || null,
          profesor_id: evaluacion.profesor.id,
          consentimiento_aceptado: studentData.consentimientoAceptado,
          comentarios: evaluacion.comentarios || '',
          ...evaluacion.calificaciones
        }

        const { error } = await supabase
          .from('evaluaciones')
          .insert([evaluacionData])

        if (error) throw error
      }

      setSuccess(true)

      // Enviar email de confirmación (esto se implementaría con una función de Supabase)
      // await supabase.functions.invoke('send-confirmation-email', {
      //   body: { email: studentData.email, nombre: studentData.nombre }
      // })

    } catch (error) {
      console.error('Error guardando evaluaciones:', error)
      alert('Hubo un error al guardar tus evaluaciones. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = () => {
    resetEvaluation()
    navigate('/')
  }

  if (success) {
    return (
      <div className="card max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Evaluación Completada!
        </h2>

        <p className="text-lg text-gray-600 mb-6">
          Muchas gracias por tu participación. Tus evaluaciones han sido registradas exitosamente.
        </p>

        <div className="bg-primary-50 border-l-4 border-primary-600 p-4 mb-8 text-left">
          <p className="text-sm text-primary-900 mb-2">
            📧 Hemos enviado una confirmación a tu correo electrónico:
          </p>
          <p className="text-sm font-medium text-primary-700">
            {studentData.email}
          </p>
        </div>

        <p className="text-gray-600 mb-8">
          Tu opinión es muy valiosa para mejorar la calidad educativa de nuestro posgrado.
        </p>

        <button
          onClick={handleFinish}
          className="btn-primary"
        >
          Volver al Inicio
        </button>
      </div>
    )
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="flex justify-center mb-6">
        <div className="bg-primary-100 p-4 rounded-full">
          <CheckCircle className="h-12 w-12 text-primary-600" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
        Confirmar y Enviar Evaluación
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Revisa que toda la información sea correcta antes de enviar
      </p>

      <div className="space-y-6 mb-8">
        {/* Datos del alumno */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Tus Datos</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Nombre:</span>
              <span className="font-medium text-gray-900">
                {studentData.nombre} {studentData.apellidos}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Correo:</span>
              <span className="font-medium text-gray-900">{studentData.email}</span>
            </div>
          </div>
        </div>

        {/* Maestría y especialidad */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Programa Académico</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Maestría:</span>
              <span className="font-medium text-gray-900">{selectedMaestria?.nombre}</span>
            </div>
            {selectedEspecialidad && (
              <div className="flex justify-between">
                <span className="text-gray-600">Especialidad:</span>
                <span className="font-medium text-gray-900">{selectedEspecialidad.nombre}</span>
              </div>
            )}
          </div>
        </div>

        {/* Evaluaciones realizadas */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            Evaluaciones Realizadas ({evaluaciones.length})
          </h3>
          <div className="space-y-3">
            {evaluaciones.map((evaluacion, index) => (
              <div key={index} className="bg-white rounded p-3 border border-gray-200">
                <p className="font-medium text-gray-900 mb-1">
                  {evaluacion.profesor.nombre_completo}
                </p>
                <p className="text-sm text-gray-600">
                  {evaluacion.profesor.materia}
                </p>
                {evaluacion.comentarios && (
                  <p className="text-xs text-gray-500 mt-2 italic">
                    "Incluye comentarios"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mensaje importante */}
        <div className="bg-amber-50 border-l-4 border-amber-600 p-4">
          <p className="text-sm text-amber-900">
            ⚠️ Al enviar tus evaluaciones, estas quedarán registradas y no podrás modificarlas.
            Asegúrate de que toda la información sea correcta.
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={loading}
          className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Atrás</span>
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Enviar Evaluación</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
