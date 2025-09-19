'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'

export function SignupForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  })
  
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: false
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }))
  }

  const getFieldError = (field: string) => {
    if (!touched[field as keyof typeof touched]) return ''
    
    const value = formData[field as keyof typeof formData]
    
    switch (field) {
      case 'name':
        if (!value) return '이름을 입력해주세요.'
        if (value.length < 2) return '이름은 2자 이상 입력해주세요.'
        break
      case 'email':
        if (!value) return '이메일을 입력해주세요.'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '올바른 이메일 형식이 아닙니다.'
        break
      case 'password':
        if (!value) return '비밀번호를 입력해주세요.'
        if (value.length < 8) return '비밀번호는 8자 이상이어야 합니다.'
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) return '대소문자와 숫자를 포함해야 합니다.'
        break
      case 'confirmPassword':
        if (!value) return '비밀번호 확인을 입력해주세요.'
        if (value !== formData.password) return '비밀번호가 일치하지 않습니다.'
        break
      case 'phone':
        if (!value) return '핸드폰번호를 입력해주세요.'
        if (!/^01[0-9]-?[0-9]{4}-?[0-9]{4}$/.test(value.replace(/-/g, ''))) return '올바른 핸드폰번호 형식이 아닙니다.'
        break
    }
    return ''
  }

  const getPasswordStrength = () => {
    const password = formData.password
    if (!password) return { strength: 0, text: '' }

    let strength = 0
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }

    strength = Object.values(checks).filter(Boolean).length

    const strengthTexts = ['매우 약함', '약함', '보통', '강함', '매우 강함']
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

    return {
      strength: (strength / 5) * 100,
      text: strengthTexts[strength - 1] || '매우 약함',
      color: strengthColors[strength - 1] || 'bg-red-500'
    }
  }

  const isFormValid = () => {
    return Object.keys(formData).every(field => 
      formData[field as keyof typeof formData] && !getFieldError(field)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 모든 필드를 touched로 설정
    const allTouched = Object.keys(formData).reduce((acc, field) => ({
      ...acc,
      [field]: true
    }), {} as typeof touched)
    setTouched(allTouched)

    if (!isFormValid()) return

    setIsLoading(true)
    
    try {
      console.log('회원가입 시도:', formData)
      // API 호출 등...
      await new Promise(resolve => setTimeout(resolve, 2000)) // 시뮬레이션
      alert('회원가입이 완료되었습니다!')
    } catch (error) {
      console.error('회원가입 에러:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">회원가입</CardTitle>
        <CardDescription className="text-center">
          새 계정을 만들어 시작하세요
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* 이름 */}
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              type="text"
              placeholder="홍길동"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              required
            />
            <div className="min-h-[24px]">
              {getFieldError('name') && (
                <Alert variant="destructive" className="py-0 border-0 bg-transparent px-0 flex items-center gap-2 [&>svg]:static [&>svg]:translate-y-0 [&>svg~*]:pl-0">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                  <AlertDescription className="text-xs text-red-500">
                    {getFieldError('name')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* 이메일 */}
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@domain.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              required
            />
            <div className="min-h-[24px]">
              {getFieldError('email') && (
                <Alert variant="destructive" className="py-2 border-0 bg-transparent px-0 flex items-center gap-2 [&>svg]:static [&>svg]:translate-y-0 [&>svg~*]:pl-0">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                  <AlertDescription className="text-xs text-red-500">
                    {getFieldError('email')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="8자 이상, 대소문자와 숫자 포함"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* 비밀번호 강도 표시 */}
            {formData.password && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Progress value={passwordStrength.strength} className="flex-1 h-2" />
                  <span className="text-xs font-medium">{passwordStrength.text}</span>
                </div>
              </div>
            )}
            
            <div className="min-h-[24px]">
              {getFieldError('password') && (
                <Alert variant="destructive" className="py-2 border-0 bg-transparent px-0 flex items-center gap-2 [&>svg]:static [&>svg]:translate-y-0 [&>svg~*]:pl-0">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                  <AlertDescription className="text-xs text-red-500">
                    {getFieldError('password')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* 비밀번호 확인 */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* 비밀번호 일치 표시 */}
            {formData.confirmPassword && (
              <div className="flex items-center gap-2">
                {formData.password === formData.confirmPassword ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-500">비밀번호가 일치합니다</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-red-500">비밀번호가 일치하지 않습니다</span>
                  </>
                )}
              </div>
            )}
            
            <div className="min-h-[24px]">
              {getFieldError('confirmPassword') && (
                <Alert variant="destructive" className="py-2 border-0 bg-transparent px-0 flex items-center gap-2 [&>svg]:static [&>svg]:translate-y-0 [&>svg~*]:pl-0">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                  <AlertDescription className="text-xs text-red-500">
                    {getFieldError('confirmPassword')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* 핸드폰번호 */}
          <div className="space-y-2">
            <Label htmlFor="phone">핸드폰번호</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="010-1234-5678"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              required
            />
            <div className="min-h-[24px]">
              {getFieldError('phone') && (
                <Alert variant="destructive" className="py-2 border-0 bg-transparent px-0 flex items-center gap-2 [&>svg]:static [&>svg]:translate-y-0 [&>svg~*]:pl-0">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
                  <AlertDescription className="text-xs text-red-500">
                    {getFieldError('phone')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4">
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? '가입 중...' : '회원가입'}
          </Button>
          
          <div className="text-center text-sm">
            이미 계정이 있으신가요?{" "}
            <a href="/" className="underline text-blue-600 hover:text-blue-800">
              로그인
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}