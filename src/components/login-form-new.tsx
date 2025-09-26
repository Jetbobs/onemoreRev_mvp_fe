'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { authApi } from '@/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function LoginFormNew() {
  const [formData, setFormData] = useState({
    email: 'hong@example.com', // 예제에서 기본값 제공
    password: 'password123'     // 예제에서 기본값 제공
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // 입력 시 메시지 초기화
    setMessage('')
    setMessageType('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setMessage('이메일과 비밀번호를 모두 입력해주세요.')
      setMessageType('error')
      return
    }

    setIsLoading(true)
    setMessage('로그인 중...')
    setMessageType('')
    
    try {
      const data = await authApi.login(formData.email, formData.password)
      console.log('[Login] Success:', data)
      
      setMessage('로그인 성공! 프로젝트 페이지로 이동합니다.')
      setMessageType('success')
      
      // 성공 시 프로젝트 페이지로 리다이렉트
      setTimeout(() => {
        router.push('/projects')
      }, 1200)
      
    } catch (error: any) {
      console.error('[Login] Error:', error)
      
      const errorMessage = error.data?.message || error.message || '로그인 실패'
      setMessage(errorMessage)
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">로그인</CardTitle>
          <CardDescription>
            계정에 로그인하여 프로젝트를 관리하세요
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>
            
            {/* 메시지 표시 */}
            {message && (
              <Alert variant={messageType === 'error' ? 'destructive' : 'default'}>
                {messageType === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : messageType === 'error' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : null}
                <AlertDescription>
                  {message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
            
            <div className="text-center text-sm space-y-2">
              <Link 
                href="/projects" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                내 프로젝트 보기
              </Link>
              
              <div>
                계정이 없으신가요?{" "}
                <Link 
                  href="/signup" 
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  회원가입
                </Link>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}