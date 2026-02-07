import React, { useEffect, useState } from 'react'
import { supabase } from '../../config/supabase'
import { useEvaluationStore } from '../../store/evaluationStore'

export default function MaestriaStep({ onNext, onBack }) {
  const { selectedMaestria, setSelectedMaestria } = useEvaluationStore()
  const [maestrias, setMaestrias] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const cargarMaestrias = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('maestrias')
          .select('id, nombre, activa, orden')
          .eq('activa', true)
          .order('orden', { ascending: true })
          .order('nombre', { ascending: true })
        if (error) throw error

        // Fallback de seguridad en cliente
        const maesOrdenadas = (data || []).slice().sort((a, b) => {
          const oa = a?.orden ?? Number.MAX_SAFE_INTEGER
          const ob = b?.orden ?? Number.MAX_SAFE_INTEGER
          if (oa !== ob) return oa - ob
          return (a?.nombre ?? '').localeCompare(b?.nombre ?? '', 'es')
        })
        setMaestrias(maesOrdenadas)
      } catch (e) {
        console.error('[Alumno] cargarMaestrias:', e)
        alert('No se pudieron cargar las maestrías.')
      } finally {
        setLoading(false)
      }
    }
    cargarMaestrias()
  }, [])

  const handleContinuar = () => {
    if (!selectedMaestria) {
      alert('Selecciona una maestría para continuar.')
      return
    }
    onNext?.()
  }

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Selecciona tu Maestría</h2>

      {loading ? (
        <p className="text-sm text-gray-600">Cargando maestrías…</p>
      ) : maestrias.length === 0 ? (
        <p className="text-sm text-red-600">No hay maestrías activas.</p>
      ) : (
        <div className="space-y-2">
          {maestrias.map(m => (
            <label
              key={m.id}
              className={`
                flex items-center gap-3 border rounded-lg p-3 cursor-pointer
                ${selectedMaestria?.id === m.id ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}
              `}
            >
              <input
                type="radio"
                className="h-4 w-4"
                checked={selectedMaestria?.id === m.id}
                onChange={() => setSelectedMaestria(m)}
              />
              <span className="text-gray-900 font-medium">{m.nombre}</span>
              <span className="ml-auto text-xs text-gray-500">orden: {m.orden ?? '—'}</span>
            </label>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-6">
        <button onClick={onBack} className="btn-secondary">Atrás</button>
        <button onClick={handleContinuar} className="btn-primary">Continuar</button>
      </div>
    </div>
  )
}
