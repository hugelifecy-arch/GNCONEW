'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

const WIZARD_STORAGE_KEY = 'gnco:architect-brief'
const WIZARD_STEP_KEY = 'gnco:architect-step'

type BriefData = Record<string, unknown>

interface UseWizardOptions {
  totalSteps?: number
}

function getSavedStep(totalSteps: number): number {
  try {
    const saved = sessionStorage.getItem(WIZARD_STEP_KEY)
    if (!saved) return 1
    const step = Number(saved)
    return step >= 1 && step <= totalSteps ? step : 1
  } catch {
    return 1
  }
}

export function useWizard(options: UseWizardOptions = {}) {
  const totalSteps = options.totalSteps ?? 5
  const [currentStep, setCurrentStep] = useState(() => getSavedStep(totalSteps))
  const [briefData, setBriefData] = useState<BriefData>({})

  useEffect(() => {
    const saved = window.localStorage.getItem(WIZARD_STORAGE_KEY)
    if (!saved) return

    try {
      const parsed = JSON.parse(saved) as BriefData
      setBriefData(parsed)
    } catch {
      window.localStorage.removeItem(WIZARD_STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(briefData))
  }, [briefData])

  useEffect(() => {
    sessionStorage.setItem(WIZARD_STEP_KEY, String(currentStep))
  }, [currentStep])

  const goNext = useCallback(() => {
    setCurrentStep((step) => Math.min(step + 1, totalSteps))
  }, [totalSteps])

  const goBack = useCallback(() => {
    setCurrentStep((step) => Math.max(step - 1, 1))
  }, [])

  const updateBrief = useCallback((data: Partial<BriefData>) => {
    setBriefData((prev) => ({ ...prev, ...data }))
  }, [])

  const resetWizard = useCallback(() => {
    setCurrentStep(1)
    setBriefData({})
    window.localStorage.removeItem(WIZARD_STORAGE_KEY)
    sessionStorage.removeItem(WIZARD_STEP_KEY)
  }, [])

  const canGoNext = useMemo(() => currentStep < totalSteps, [currentStep, totalSteps])
  const isComplete = useMemo(() => currentStep === totalSteps, [currentStep, totalSteps])

  return {
    currentStep,
    totalSteps,
    goNext,
    goBack,
    canGoNext,
    briefData,
    updateBrief,
    isComplete,
    resetWizard,
  }
}
