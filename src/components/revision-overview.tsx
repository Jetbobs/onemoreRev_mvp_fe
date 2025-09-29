'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Calendar,
  Clock,
  Phone,
  RefreshCw,
  FileText,
  User,
  CreditCard
} from 'lucide-react'

interface Project {
  id: any
  name: string
  authorEmail: string
  progress: number
  startDate: string
  draftDeadline: string
  finalDeadline: string
  budget: number
  clientPhone: string
  sourceFileProvision: string
  revisionCount: number
  usedRevisions: number
  additionalRevisionFee: number
  revisionCriteria: string
  paymentMethod: string
}

interface Installment {
  name: string
  percentage: number
  amount: number
  status: string
  date: string
}

interface RevisionOverviewProps {
  project: Project
  installments: Installment[]
  onTogglePaymentStatus: (index: number) => void
}

export function RevisionOverview({ project, installments, onTogglePaymentStatus }: RevisionOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount)
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case '완료':
        return 'bg-green-100 text-green-700 border-green-200'
      case '대기':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const calculateDaysLeft = (deadline: string) => {
    if (deadline === '미정') return '날짜 미정'

    const today = new Date()
    const deadlineDate = new Date(deadline.replace(/\./g, '-'))
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return `${Math.abs(diffDays)}일 지남`
    if (diffDays === 0) return '오늘'
    return `${diffDays}일 남음`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 왼쪽 카드 (2/3) */}
      <Card className="lg:col-span-2 border border-gray-200">
        <CardContent className="p-6">
          <div className="space-y-8 flex flex-col gap-8">
            {/* 프로젝트 기본 정보 */}
            <div className='mb-0'>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                프로젝트 기본 정보
              </h3>

              <div className="space-y-4 flex flex-col gap-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">전체 진행률</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">프로젝트명</p>
                    <p className="font-medium text-gray-900">{project.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">작성자</p>
                    <p className="font-medium text-gray-900 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {project.authorEmail}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">예산</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(project.budget)}원</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">연락처</p>
                    <p className="font-medium text-gray-900 flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {project.clientPhone}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">원본파일 제공</p>
                  <p className="font-medium text-gray-900">
                    {project.sourceFileProvision === "yes" ? "제공" : "미제공"}
                  </p>
                </div>
              </div>
            </div>

            {/* 수정 조건 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <RefreshCw className="h-5 w-5 mr-2" />
                수정 조건
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">총 수정 횟수</p>
                    <p className="font-medium text-gray-900">{project.revisionCount}회</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">사용한 수정 횟수</p>
                    <p className="font-medium text-blue-600">{project.usedRevisions}회</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">추가 수정 요금</p>
                    <p className="font-medium text-gray-900">{formatCurrency(project.additionalRevisionFee)}원</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">수정 기준</p>
                  <p className="text-gray-800 leading-relaxed">{project.revisionCriteria}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 오른쪽 카드 (1/3) */}
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="space-y-8">
            {/* 일정 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                일정 정보
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">프로젝트 시작일</p>
                  <p className="font-medium text-gray-900">{project.startDate}</p>
                </div>

                <div className="p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">초안 마감일</p>
                  <p className="font-medium text-gray-900">{project.draftDeadline}</p>
                  <p className="text-sm text-orange-600 flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {calculateDaysLeft(project.draftDeadline)}
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">최종 마감일</p>
                  <p className="font-medium text-gray-900">{project.finalDeadline}</p>
                  <p className="text-sm text-blue-600 flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {calculateDaysLeft(project.finalDeadline)}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* 결제 정보 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                결제 정보
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">결제 방식</span>
                  <Badge variant="outline" className="border-0">
                    {project.paymentMethod === 'installment' ? '분할 결제' : '일시불'}
                  </Badge>
                </div>

                {project.paymentMethod === 'installment' && (
                  <div className="space-y-2">
                    {installments.map((installment, index) => (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={installment.status === '완료'}
                              onCheckedChange={() => onTogglePaymentStatus(index)}
                              className="mt-1 rounded-full border-gray-300"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{installment.name}</span>
                                <Badge className={`text-xs ${getPaymentStatusColor(installment.status)}`}>
                                  {installment.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-500">{installment.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">{formatCurrency(installment.amount)}원</p>
                            <p className="text-xs text-gray-500">{installment.percentage}%</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="pt-2 border-t border-gray-300 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">총 결제 금액</span>
                        <span className="font-bold text-lg text-primary">
                          {formatCurrency(project.budget)}원
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}