'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProjectsPage() {
  const router = useRouter()

  useEffect(() => {
    // /projects-new로 리다이렉트
    router.replace('/projects-new')
  }, [router])

  return null
}