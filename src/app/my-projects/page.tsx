'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const MyProjectsPage = () => {
  const router = useRouter()

  useEffect(() => {
    // /projects-new로 리다이렉트
    router.replace('/projects-new')
  }, [router])

  return null
}

export default MyProjectsPage
