import React, { useEffect, useState } from 'react'
import { REACTIVOS } from '../../constants/reactivos'
import { ClipboardCheck, ChevronRight, ChevronLeft } from 'lucide-react'
import { useEvaluationStore } from '../../store/evaluationStore'

export default function EvaluacionStep({ onNext, onBack, profesores, loading }) {
  const { addEvaluacion } = useEvaluationStore()
  const [selectedProfesor, setSelectedProfesor] = useState(null)
  const [calificaciones, setCalificaciones] = useState({})
  const [comentarios, setComentarios] = useState('')
  const [errors, setErrors] = useState({})

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando profesores...</p>
      </div>
    )
  }

  if (!profesores || profesores.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600 mb-4">No hay profesores disponibles para evaluar.</p>
        <button onClick={onNext} className="btn-primary">
          Continuar
        </button>
      </div>
    )
  }

  const handleCalificacionChange = (reactivo, valor) => {
    setCalificaciones(prev => ({
      ...prev,
      [reactivo]: parseInt(valor, 10)
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    // Validar profesor si hay varios
    if (profesores.length > 1 && !selectedProfesor) {
      newErrors['profesor'] = true
    }

    // Validar reactivos 1..17
    for (let i = 1; i <= 17; i++) {
      if (calificaciones[`reactivo_${i}`] === undefined) {
        newErrors[`reactivo_${i}`] = true
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      if (errors['profesor']) {
        alert('Selecciona el profesor/a antes de continuar.')
      } else {
        alert('Por favor, califica todos los reactivos antes de continuar.')
      }
      return
    }

    addEvaluacion({
      profesor: selectedProfesor || profesores[0], // si solo hay uno
      calificaciones,
      comentarios
    })

    // Reset
    setSelectedProfesor(null)
    setCalificaciones({})
    setComentarios('')

    onNext()
  }

  // Si solo hay un profesor, seleccionarlo automáticamente
  useEffect(() => {
    if (profesores.length === 1 && !selectedProfesor) {
      setSelectedProfesor(profesores[0])
    }
  }, [profesores, selectedProfesor])

  return (
    <div className="card">
      <div className="flex justify-center mb-6">
        <div className="bg-primary-100 p-4 rounded-full">
          <ClipboardCheck className="h-12 w-12 text-primary-600" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
        Evaluación Docente
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Califica cada aspecto del desempeño del profesor
      </p>

      {/* Selección de profesor si hay múltiples */}
      {profesores.length > 1 && (
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Selecciona el profesor que te impartió la materia *
          </label>
          <div className="space-y-2">
            {profesores.map((profesor) => (
              <div
                key={profesor.id}
                onClick={() => setSelectedProfesor(profesor)}
                className={`
                  border-2 rounded-lg p-4 cursor-pointer transition-all
                  ${selectedProfesor?.id === profesor.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 bg-white'}
                `}
              >
                <div className="flex items-center">
                  <div className={`
                    w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center
                    ${selectedProfesor?.id === profesor.id
                      ? 'border-primary-600 bg-primary-600'
                      : 'border-gray-300'}
                  `}>
                    {selectedProfesor?.id === profesor.id && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{profesor.nombre_completo}</p>
                    <p className="text-sm text-gray-600">{profesor.materia}</p>
                  </div>
                </div>
              </div>
            ))}
            {errors['profesor'] && (
              <p className="text-xs text-red-600">Debes seleccionar un profesor(a).</p>
            )}
          </div>
        </div>
      )}

      {selectedProfesor && (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información del profesor */}
          <div className="bg-primary-50 border-l-4 border-primary-600 p-4">
            <p className="font-medium text-primary-900">
              Evaluando a: {selectedProfesor.nombre_completo}
            </p>
            <p className="text-sm text-primary-700">
              Materia: {selectedProfesor.materia}
            </p>
          </div>

          {/* Escala de referencia */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Escala de Calificación:</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">0 = Totalmente insatisfactorio</span>
              <span className="text-gray-600">5 = Regular</span>
              <span className="text-gray-600">10 = Excelente</span>
            </div>
          </div>

          {/* Reactivos */}
          <div className="space-y-6">
            {REACTIVOS.map((reactivo, index) => {
              const key = `reactivo_${index + 1}`
              return (
                <div
                  key={key}
                  className={`border rounded-lg p-4 ${errors[key] ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                >
                  <label className="block mb-3">
                    <span className="font-medium text-gray-900">
                      {index + 1}. {reactivo}
                    </span>
                  </label>

                  <div className="flex items-center space-x-2">
                    {[0,1,2,3,4,5,6,7,8,9,10].map((valor) => (
                      <button
                        key={valor}
                        type="button"
                        onClick={() => handleCalificacionChange(key, valor)}
                        className={`
                          w-10 h-10 rounded-lg font-medium transition-all
                          ${calificaciones[key] === valor
                            ? valor <= 6
                              ? 'bg-red-500 text-white'
                              : valor <= 8.5
                                ? 'bg-orange-500 text-white'
                                : 'bg-green-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}
                        `}
                      >
                        {valor}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Comentarios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentarios adicionales (opcional)
            </label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              className="input-field min-h-[120px]"
              placeholder="Comparte tus comentarios, sugerencias o cualquier aspecto que consideres importante..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-between pt-4">
            <button type="button" onClick={onBack} className="btn-secondary flex items-center space-x-2">
              <ChevronLeft className="h-5 w-5" />
              <span>Atrás</span>
            </button>
            <button type="submit" className="btn-primary flex items-center space-x-2">
              <span>Continuar</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </form>
      )}

      {!selectedProfesor && profesores.length > 1 && (
        <div className="text-center py-8">
          <p className="text-gray-600">Selecciona un profesor para comenzar la evaluación</p>
        </div>
      )}
    </div>
  )
}
