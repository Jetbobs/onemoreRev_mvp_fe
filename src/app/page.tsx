'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function Home() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const { isAuthenticated, checkAuth } = useAuthStore()

  useEffect(() => {
    async function verify() {
      // localStorage에 저장된 인증 정보가 있으면 백엔드 세션 검증
      if (isAuthenticated) {
        const isValid = await checkAuth()
        if (isValid) {
          // 세션 유효 - 프로젝트 목록으로
          router.replace('/projects-new')
        } else {
          // 세션 만료 - 로그인 페이지로
          router.replace('/login-new')
        }
      } else {
        // 인증 정보 없음 - 로그인 페이지로
        router.replace('/login-new')
      }
      setIsChecking(false)
    }

    verify()
  }, [])

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return null
}
