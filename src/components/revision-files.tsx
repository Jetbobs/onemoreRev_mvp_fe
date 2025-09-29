'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Download, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import FileHistoryLayout from '@/components/file-history-layout'

interface RevisionFilesProps {
  projectId: string
  revNo: string
  completedFiles: any[]
  revision?: any
  activeTab?: string
  code?: string
}

export function RevisionFiles({ projectId, revNo, completedFiles, revision, activeTab = 'files', code }: RevisionFilesProps) {
  const router = useRouter()

  const handleCreateNextRevision = async () => {
    if (!revision) {
      alert('리비전 정보를 불러오지 못했습니다.')
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/revision/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: parseInt(projectId || '0')
        }),
        credentials: 'include'
      })

      if (!response.ok) throw new Error('다음 리비전 생성 실패')

      const result = await response.json()
      console.log('다음 리비전 생성 API 응답:', result)

      alert('다음 리비전이 생성되었습니다')

      // 새로 생성된 리비전 페이지로 이동 (현재 탭 유지)
      const newRevNo = result.revision?.revNo || (revision.revNo + 1)
      const params = new URLSearchParams()
      params.set('projectId', projectId)
      params.set('revNo', newRevNo.toString())
      if (code) params.set('code', code)
      params.set('tab', activeTab)

      router.push(`/revision-new?${params.toString()}`)

    } catch (error) {
      console.error('다음 리비전 생성 실패:', error)
      alert('다음 리비전 생성에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const navigateToRevision = (targetRevNo: number) => {
    const params = new URLSearchParams()
    params.set('projectId', projectId)
    params.set('revNo', targetRevNo.toString())
    if (code) params.set('code', code)
    params.set('tab', activeTab)

    router.push(`/revision-new?${params.toString()}`)
  }

  const handlePreviousRevision = () => {
    const currentRevNo = parseInt(revNo)
    if (currentRevNo > 1) {
      navigateToRevision(currentRevNo - 1)
    }
  }

  const handleNextRevision = () => {
    const currentRevNo = parseInt(revNo)
    navigateToRevision(currentRevNo + 1)
  }

  return (
    <div className="space-y-6">
      {/* 리비전 히스토리 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">리비전 히스토리</h3>

            {/* 네비게이션 버튼 */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousRevision}
                disabled={parseInt(revNo) <= 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                이전 리비전
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextRevision}
                disabled={revision?.isLast}
              >
                다음 리비전
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {/* 현재 리비전 */}
            <div className="p-4 border border-gray-200 rounded-lg bg-blue-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Badge variant="default" className="bg-blue-600">
                    Rev {revNo} (현재)
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {revision?.status === 'prepare' && '준비중'}
                    {revision?.status === 'submitted' && '제출됨'}
                    {revision?.status === 'reviewed' && '검토됨'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {revision?.tracks?.length || 0}개 트랙
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    보기
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    다운로드
                  </Button>
                </div>
              </div>
            </div>

            {/* 이전 리비전들 (샘플) */}
            {parseInt(revNo) > 1 && (
              <>
                {Array.from({ length: parseInt(revNo) - 1 }, (_, i) => {
                  const revNumber = parseInt(revNo) - 1 - i
                  return (
                    <div key={revNumber} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">
                            Rev {revNumber}
                          </Badge>
                          <span className="text-sm text-gray-600">검토완료</span>
                          <span className="text-sm text-gray-500">
                            {Math.floor(Math.random() * 3) + 1}개 트랙
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            보기
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            다운로드
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 파일 히스토리 레이아웃 */}
      <FileHistoryLayout completedFiles={completedFiles} />

      {/* 다음 리비전 생성 버튼 */}
      {revision?.status === 'reviewed' && revision?.isLast && (
        <div className="text-center">
          <Button
            onClick={handleCreateNextRevision}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            다음 리비전 생성
          </Button>
        </div>
      )}
    </div>
  )
}