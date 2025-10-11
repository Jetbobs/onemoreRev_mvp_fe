'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    // /login-new로 리다이렉트
    router.replace('/login-new')
  }, [router])

  return null
}