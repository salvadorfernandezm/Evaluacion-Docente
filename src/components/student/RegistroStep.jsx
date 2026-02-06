import React, { useState } from 'react'
import { useEvaluationStore } from '../../store/evaluationStore'
import { User, Mail, ChevronRight, ChevronLeft } from 'lucide-react'

export default function RegistroStep({ onNext, onBack }) {
  const { studentData, setStudentData } = useEvaluationStore()
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!studentData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }

    if (!studentData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos'
    }

    if (!studentData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentData.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onNext()
    }
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="flex justify-center mb-6">
        <div className="bg-primary-100 p-4 rounded-full">
          <User className="h-12 w-12 text-primary-600" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
        Datos Personales
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Por favor, completa tus datos para continuar con la evaluación
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre(s) *
          </label>
          <input
            type="text"
            value={studentData.nombre}
            onChange={(e) => setStudentData({ nombre: e.target.value })}
            className={`input-field ${errors.nombre ? 'border-red-500' : ''}`}
            placeholder="Ej: Juan Carlos"
          />
          {errors.nombre && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Apellidos *
          </label>
          <input
            type="text"
            value={studentData.apellidos}
            onChange={(e) => setStudentData({ apellidos: e.target.value })}
            className={`input-field ${errors.apellidos ? 'border-red-500' : ''}`}
            placeholder="Ej: García López"
          />
          {errors.apellidos && (
            <p className="mt-1 text-sm text-red-600">{errors.apellidos}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={studentData.email}
              onChange={(e) => setStudentData({ email: e.target.value })}
              className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
              placeholder="tu.correo@ejemplo.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            Usaremos tu correo solo para enviarte la confirmación de tu evaluación
          </p>
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary flex items-center space-x-2"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Atrás</span>
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center space-x-2"
          >
            <span>Continuar</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
