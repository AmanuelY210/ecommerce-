'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/store'

// Cache settings in memory so multiple components don't refetch
let cachedSettings: Record<string, string> | null = null
let fetchPromise: Promise<Record<string, string>> | null = null

async function fetchSettings(): Promise<Record<string, string>> {
  if (cachedSettings) return cachedSettings
  if (fetchPromise) return fetchPromise
  fetchPromise = fetch('/api/settings').then(r => r.json()).then(d => {
    cachedSettings = d
    return d
  }).catch(() => {
    return {}
  })
  return fetchPromise
}

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, string>>(cachedSettings || {})
  const [loaded, setLoaded] = useState(!!cachedSettings)

  useEffect(() => {
    let cancelled = false
    if (cachedSettings) {
      const cached = cachedSettings
      Promise.resolve().then(() => {
        if (!cancelled) { setSettings(cached); setLoaded(true) }
      })
      return
    }
    fetchSettings().then(d => {
      if (!cancelled) { setSettings(d); setLoaded(true) }
    })
    return () => { cancelled = true }
  }, [])

  const get = (key: string, fallback: string = ''): string => settings[key] ?? fallback
  const getBool = (key: string, fallback: boolean = false): boolean => {
    const v = settings[key]
    if (v === undefined) return fallback
    return v === 'true'
  }

  return { settings, get, getBool, loaded }
}

// Helper to clear cache after admin updates settings
export function clearSettingsCache() {
  cachedSettings = null
  fetchPromise = null
}
