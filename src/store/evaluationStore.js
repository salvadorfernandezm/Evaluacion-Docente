import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useEvaluationStore = create(
  persist(
    (set) => ({
      currentStep: 0,
      studentData: {
        nombre: '',
        apellidos: '',
        email: '',
        consentimientoAceptado: false,
      },
      selectedMaestria: null,
      selectedEspecialidad: null,
      evaluaciones: [],
      
      setCurrentStep: (step) => set({ currentStep: step }),
      
      setStudentData: (data) => set((state) => ({ 
        studentData: { ...state.studentData, ...data } 
      })),
      
      setSelectedMaestria: (maestria) => set({ selectedMaestria: maestria }),
      
      setSelectedEspecialidad: (especialidad) => set({ selectedEspecialidad: especialidad }),
      
      addEvaluacion: (evaluacion) => set((state) => ({
        evaluaciones: [...state.evaluaciones, evaluacion]
      })),
      
      resetEvaluation: () => set({
        currentStep: 0,
        studentData: {
          nombre: '',
          apellidos: '',
          email: '',
          consentimientoAceptado: false,
        },
        selectedMaestria: null,
        selectedEspecialidad: null,
        evaluaciones: [],
      }),
    }),
    {
      name: 'evaluation-storage',
    }
  )
)
