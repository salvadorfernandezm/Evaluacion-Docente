import React from 'react'
import { useEvaluationStore } from '../../store/evaluationStore'
import { CONSENTIMIENTO_TEXT } from '../../constants/reactivos'
import { FileCheck, ChevronRight } from 'lucide-react'

export default function ConsentimientoStep({ onNext }) {
  const { studentData, setStudentData } = useEvaluationStore()

  const handleAccept = () => {
    setStudentData({ consentimientoAceptado: true })
    onNext()
  }

  return (
    <div className="card max-w-3xl mx-auto">
      <div className="flex justify-center mb-6">
        <div className="bg-primary-100 p-4 rounded-full">
          <FileCheck className="h-12 w-12 text-primary-600" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        Consentimiento Informado
      </h2>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {CONSENTIMIENTO_TEXT}
        </p>
      </div>

      <div className="flex items-start mb-6">
        <input
          type="checkbox"
          id="consent"
          checked={studentData.consentimientoAceptado}
          onChange={(e) => setStudentData({ consentimientoAceptado: e.target.checked })}
          className="mt-1 h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
        />
        <label htmlFor="consent" className="ml-3 text-gray-700">
          He leído y acepto el consentimiento informado. Entiendo que mi evaluación es confidencial y anónima.
        </label>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleAccept}
          disabled={!studentData.consentimientoAceptado}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Continuar</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
