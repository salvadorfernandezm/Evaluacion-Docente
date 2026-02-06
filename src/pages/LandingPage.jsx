import React, { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import { GraduationCap, AlertCircle } from 'lucide-react'

export default function LandingPage() {
  const [sistemaCerrado, setSistemaCerrado] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSistemaEstado()
  }, [])

  const checkSistemaEstado = async () => {
    try {
      // Verificar si hay alguna maestría activa
      const { data, error } = await supabase
        .from('maestrias')
        .select('*')
        .eq('activa', true)
      
      if (error) throw error
      
      // Si no hay maestrías activas, sistema cerrado
      setSistemaCerrado(!data || data.length === 0)
    } catch (error) {
      console.error('Error:', error)
      setSistemaCerrado(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="https://www.genspark.ai/api/files/s/PQ0EbNzP" 
                alt="Logo Posgrado UJED" 
                className="h-20 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Evaluación Docente
                </h1>
                <p className="text-sm text-gray-600">
                  Posgrado en Psicología y Comunicación Humana - UJED
                </p>
              </div>
            </div>
            <a
              href="/admin/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Acceso Administrador
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {sistemaCerrado ? (
            <div className="card text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-16 w-16 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Proceso no disponible actualmente
              </h2>
              <p className="text-gray-600 mb-6">
                El período de evaluación docente no está activo en este momento.
                Por favor, consulta con la coordinación del posgrado para más información.
              </p>
            </div>
          ) : (
            <div className="card">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <GraduationCap className="h-16 w-16 text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Bienvenido al Sistema de Evaluación Docente
                </h2>
                <p className="text-lg text-gray-600">
                  Tu opinión es fundamental para mejorar la calidad educativa de nuestro posgrado
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-primary-50 border-l-4 border-primary-600 p-4">
                  <h3 className="font-semibold text-primary-900 mb-2">
                    📋 Instrucciones:
                  </h3>
                  <ul className="text-sm text-primary-800 space-y-1 list-disc list-inside">
                    <li>Lee cuidadosamente cada reactivo</li>
                    <li>Evalúa honestamente el desempeño de cada profesor</li>
                    <li>La evaluación es anónima y confidencial</li>
                    <li>Tus comentarios ayudarán a mejorar la calidad educativa</li>
                  </ul>
                </div>

                <div className="bg-green-50 border-l-4 border-green-600 p-4">
                  <h3 className="font-semibold text-green-900 mb-2">
                    ⏱️ Tiempo estimado:
                  </h3>
                  <p className="text-sm text-green-800">
                    10-15 minutos aproximadamente
                  </p>
                </div>
              </div>

              <div className="text-center">
                <a
                  href="/evaluar"
                  className="btn-primary inline-block text-lg px-8 py-3"
                >
                  Comenzar Evaluación
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © 2026 UJED - Universidad Juárez del Estado de Durango
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Sistema de Evaluación Docente - Posgrado
          </p>
        </div>
      </footer>
    </div>
  )
}
