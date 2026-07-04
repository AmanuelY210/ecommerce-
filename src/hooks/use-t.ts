'use client'
import { useLang } from '@/lib/store'
import { t as translate, type Lang } from '@/lib/i18n'

export function useT() {
  const lang = useLang((s) => s.lang)
  return {
    lang,
    t: (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars),
  }
}

export const useLangValue = (): Lang => useLang((s) => s.lang)
