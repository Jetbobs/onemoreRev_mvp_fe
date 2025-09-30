'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from "@/components/header"
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, Edit, User, ExternalLink, AlertCircle } from 'lucide-react'
import { RevisionOverview } from '@/components/revision-overview'
import { RevisionDrafts } from '@/components/revision-drafts'
import { RevisionFiles } from '@/components/revision-files'
import { calculateDateProgress, formatDate } from '@/utils/dateProgress'
import { projectApi } from '@/lib/api'

interface Revision {
  id: string
  revNo: number
  name?: string
  title?: string
  description?: string
  status: 'prepare' | 'submitted' | 'reviewed'
  tracks?: any[]
  feedbacks?: any[]
  project?: {
    name?: string
    title?: string
    invitationCode?: string
  }
  projectName?: string
  invitationCode?: string
  isLast?: boolean
}

function RevisionPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [revision, setRevision] = useState<Revision | null>(null)
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [installments, setInstallments] = useState([
    { name: "계약금", percentage: 30, amount: 1500000, status: "완료", date: "2024.03.01" },
    { name: "중간금", percentage: 40, amount: 2000000, status: "대기", date: "2024.03.15" },
    { name: "잔금", percentage: 30, amount: 1500000, status: "대기", date: "2024.03.30" }
  ])
  const [completedFiles, setCompletedFiles] = useState<any[]>([])

  const projectId = searchParams.get('projectId')
  const revNo = searchParams.get('revNo') || '1' // revNo가 없으면 기본값 1
  const code = searchParams.get('code')
  const tabParam = searchParams.get('tab')

  // URL의 tab 파라미터를 기반으로 activeTab 상태 설정
  const [activeTab, setActiveTab] = useState(() => {
    const validTabs = ['overview', 'drafts', 'files']
    return validTabs.includes(tabParam || '') ? (tabParam as string) : 'overview'
  })

  // tab 파라미터가 변경될 때 activeTab 업데이트
  useEffect(() => {
    const validTabs = ['overview', 'drafts', 'files']
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  // 초기 로드 시 URL 정규화
  useEffect(() => {
    if (projectId && !searchParams.get('revNo')) {
      // revNo가 없으면 URL에 추가
      const params = new URLSearchParams()
      params.set('projectId', projectId)
      params.set('revNo', '1')
      if (code) params.set('code', code)
      if (tabParam) params.set('tab', tabParam)

      router.replace(`/revision-new?${params.toString()}`, { scroll: false })
    }
  }, [projectId, searchParams, code, tabParam, router])

  useEffect(() => {
    if (projectId) {
      loadProjectDetail()
    }
  }, [projectId, revNo, code])

  async function loadProjectDetail() {
    try {
      console.log('[revision-new] 프로젝트 정보 로딩 시작, projectId:', projectId);

      // /api/v1/project/info API 사용
      const data = await projectApi.info(projectId!);
      console.log('[revision-new] project info API 응답:', JSON.stringify(data, null, 2));

      // API 응답 구조 확인 및 다양한 형태 지원
      const project = data.project || data.data?.project || data;
      const success = data.success !== false; // success가 명시적으로 false가 아니면 성공으로 간주

      console.log('[revision-new] 파싱된 project 데이터:', project);
      console.log('[revision-new] success 상태:', success);

      if (project && (project.id || project.name)) {
        const backendProject = project;

        // payCheckPoints 데이터를 installments로 매핑
        const projectPayCheckPoints = backendProject.payCheckPoints || [];
        if (projectPayCheckPoints.length > 0) {
          setInstallments(projectPayCheckPoints.map((point: any) => ({
            name: point.label || '결제',
            percentage: 0, // percentage 컬럼이 없으므로 기본값 (필요시 전체 예산 대비 계산)
            amount: point.price || 0,
            status: (point.paidAmount >= point.price) ? '완료' : '대기',
            date: formatDate(point.payDate) || '미정'
          })));
        }

        setProject({
          id: backendProject.id,
          name: backendProject.name,
          description: backendProject.description,
          authorEmail: backendProject.authorEmail || backendProject.author?.email || 'authorEmail 매핑 에러',
          status: getProjectStatus(backendProject),
          progress: calculateDateProgress(backendProject.startDate, backendProject.deadline),
          startDate: formatDate(backendProject.startDate) || '미정',
          draftDeadline: formatDate(backendProject.draftDeadline) || '미정',
          finalDeadline: formatDate(backendProject.deadline) || '미정',
          budget: backendProject.totalPrice || backendProject.budget || 0,
          clientPhone: backendProject.guests?.map((guest: any) => {
            const phone = guest.phone;
            if (!phone) return null;
            // 010-1234-5678 형태로 포맷팅
            return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
          }).filter(Boolean).join(', ') || '연락처 없음',
          sourceFileProvision: backendProject.originalFileProvided || 'no',
          revisionCount: backendProject.modLimit || backendProject.revisionLimit || 0,
          usedRevisions: backendProject.revisionCount || backendProject.usedRevisions || 0,
          additionalRevisionFee: backendProject.additionalModFee ?? NaN,
          revisionCriteria: backendProject.modCriteria || '디자인 컨셉 변경, 색상 수정, 타이포그래피 조정 등 주요 디자인 요소의 변경을 1회 수정으로 계산합니다.',
          paymentMethod: backendProject.paymentMethod || 'installment',
          invitationCode: backendProject.invitationCode,
          tracks: backendProject.tracks || [],
          guests: backendProject.guests || []
        });

        // revision 정보 설정 (project info에서 revision 데이터 추출)
        const projectRevisions = backendProject.revisions || [];
        const currentRevision = projectRevisions.find((rev: any) => rev.revNo === parseInt(revNo));

        if (currentRevision) {
          console.log('[revision-new] revision 정보 설정:', currentRevision);
          // revision에 tracks 정보 추가
          const revisionWithTracks = {
            ...currentRevision,
            tracks: backendProject.tracks || []
          };
          setRevision(revisionWithTracks);
        } else {
          console.warn('[revision-new] 해당 revNo의 revision을 찾을 수 없음:', revNo, 'available revisions:', projectRevisions.map((r: any) => r.revNo));
          // revision이 없어도 tracks는 보여줘야 하므로 기본 revision 생성
          setRevision({
            id: 0,
            revNo: parseInt(revNo),
            status: 'prepare',
            tracks: backendProject.tracks || []
          });
        }
      } else {
        console.warn('[revision-new] 프로젝트 데이터 없음 - API 응답:', data);
        throw new Error(data.message || '프로젝트 데이터가 없습니다.');
      }
    } catch (err: any) {
      console.error('[revision-new] project info API 실패:', {
        message: err.message,
        status: err.status,
        data: err.data,
        stack: err.stack
      });

      // 폴백으로 기존 /api/v1/project/{id} API 시도
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/project/${projectId}`,
          { credentials: 'include' }
        );

        if (response.ok) {
          const fallbackData = await response.json();
          console.log('[revision-new] fallback project data:', fallbackData);

          if (fallbackData.success && fallbackData.project) {
            const backendProject = fallbackData.project;
            setProject({
              id: backendProject.id,
              name: backendProject.name,
              description: backendProject.description,
              authorEmail: backendProject.authorEmail || 'author@example.com',
              status: getProjectStatus(backendProject),
              progress: calculateDateProgress(backendProject.startDate, backendProject.deadline),
              startDate: formatDate(backendProject.startDate) || '미정',
              draftDeadline: '미정',
              finalDeadline: formatDate(backendProject.deadline) || '미정',
              budget: backendProject.totalPrice || 0,
              clientPhone: '연락처 미등록',
              sourceFileProvision: 'no',
              revisionCount: backendProject.modLimit || 0,
              usedRevisions: backendProject.revisionCount || 0,
              additionalRevisionFee: 50000,
              revisionCriteria: '디자인 컨셉 변경, 색상 수정, 타이포그래피 조정 등 주요 디자인 요소의 변경을 1회 수정으로 계산합니다.',
              paymentMethod: 'installment',
              invitationCode: backendProject.invitationCode,
              tracks: backendProject.tracks || [],
              guests: backendProject.guests || []
            });
            return;
          }
        }
      } catch (fallbackErr) {
        console.warn('[revision-new] fallback API also failed:', fallbackErr);
      }

      // 모든 API 실패 시 에러 상태 설정
      const errorMessage = err?.status === 401
        ? '로그인이 필요합니다.'
        : err?.status === 404
        ? '프로젝트를 찾을 수 없습니다.'
        : err?.status === 403
        ? '프로젝트에 접근할 권한이 없습니다.'
        : '프로젝트 정보를 불러올 수 없습니다. 네트워크 연결을 확인하거나 나중에 다시 시도해주세요.';

      console.error('[revision-new] 모든 API 실패 - 에러 표시:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const getProjectStatus = (project: any) => {
    if (project.lastRevision?.status === 'reviewed') return '검토됨';
    if (project.lastRevision?.status === 'submitted') return '제출됨';
    if (project.revisionCount > 0) return '진행중';
    return '준비중';
  }

  const getStatusText = (status: string) => {
    switch(status) {
      case 'prepare': return '준비'
      case 'submitted': return '제출됨'
      case 'reviewed': return '평가됨'
      default: return status || '알 수 없음'
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'prepare': return 'bg-yellow-500 hover:bg-yellow-600'
      case 'submitted': return 'bg-blue-500 hover:bg-blue-600'
      case 'reviewed': return 'bg-green-500 hover:bg-green-600'
      default: return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  const openGuestPage = () => {
    // revision 또는 project에서 invitationCode 가져오기
    const invitationCode = revision?.invitationCode || revision?.project?.invitationCode || project?.invitationCode;

    if (!invitationCode) {
      alert('초대 코드를 찾을 수 없습니다.');
      return;
    }

    const currentUrl = window.location.origin;
    const guestUrl = `${currentUrl}/revision-new?projectId=${projectId}&revNo=${revNo}&code=${invitationCode}&tab=${activeTab}`;
    window.open(guestUrl, '_blank');
  };

  const togglePaymentStatus = (index: number) => {
    const newInstallments = [...installments];
    newInstallments[index].status = newInstallments[index].status === '완료' ? '대기' : '완료';
    setInstallments(newInstallments);
  };

  // 탭 변경 시 URL 업데이트
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)

    // URL 업데이트 (shallow routing으로 페이지 리로드 방지)
    const params = new URLSearchParams()
    if (projectId) params.set('projectId', projectId)
    if (revNo) params.set('revNo', revNo)
    if (code) params.set('code', code)
    params.set('tab', newTab)

    router.replace(`/revision-new?${params.toString()}`, { scroll: false })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto p-6">
          <Skeleton className="h-10 w-20 mb-4" />
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <Card className="border-0 shadow-none">
            <CardContent className="p-6">
              <div className="flex space-x-8 px-6 pb-0">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-32 py-3" />
                ))}
              </div>
              <div className="py-6">
                <Skeleton className="h-96 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto p-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>{error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setError(null);
                    setIsLoading(true);
                    if (projectId) {
                      loadRevision();
                      loadProjectDetail();
                    }
                  }}
                  className="ml-4"
                >
                  다시 시도
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!revision && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto p-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>리비전 정보를 찾을 수 없습니다.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const projectTitle = project?.name || revision?.project?.name || revision?.project?.title || revision?.projectName || '프로젝트'
  const revisionTitle = revision?.name || revision?.title || `Rev ${revNo}`

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto p-6">
        {/* 뒤로가기 버튼 */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 hover:bg-gray-100"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          뒤로가기
        </Button>

        {/* 프로젝트 헤더 */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {code ? `${projectTitle} (게스트)` : projectTitle}
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-gray-600">{revisionTitle}</p>
                {revision && (
                  <Badge className={`text-white ${getStatusColor(revision.status)}`}>
                    {getStatusText(revision.status)}
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 flex items-center mt-2">
                <User className="h-4 w-4 mr-2" />
                {project?.authorEmail || 'author@example.com'}
              </p>
            </div>
            <div className="flex gap-2">
              {!code && (revision?.invitationCode || revision?.project?.invitationCode || project?.invitationCode) && (
                <Button variant="outline" size="sm" onClick={openGuestPage}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  게스트페이지 열기
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                편집
              </Button>
            </div>
          </div>

          {/* 진행률 */}
          {project && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">전체 진행률</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
          )}
        </div>

        {/* 탭 콘텐츠 */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <Card className="border-0 shadow-none">
            <CardContent className="p-6">
              <TabsList className="w-full justify-start rounded-none border-b h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="overview"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
                >
                  개요
                </TabsTrigger>
                <TabsTrigger
                  value="drafts"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
                >
                  시안 및 수정
                </TabsTrigger>
                <TabsTrigger
                  value="files"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
                >
                  파일 및 히스토리
                </TabsTrigger>
              </TabsList>

              <div className="pt-6">
                {/* 개요 탭 */}
                <TabsContent value="overview" className="mt-0">
                  {project ? (
                    <RevisionOverview
                      project={project}
                      installments={installments}
                      onTogglePaymentStatus={togglePaymentStatus}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">프로젝트 정보를 불러오는 중...</p>
                    </div>
                  )}
                </TabsContent>

                {/* 시안 및 수정 탭 */}
                <TabsContent value="drafts" className="mt-0">
                  <RevisionDrafts
                    projectId={projectId || ''}
                    revNo={revNo || '1'}
                    code={code || undefined}
                    revision={revision}
                    activeTab={activeTab}
                  />
                </TabsContent>

                {/* 파일 및 히스토리 탭 */}
                <TabsContent value="files" className="mt-0">
                  <RevisionFiles
                    projectId={projectId || ''}
                    revNo={revNo || '1'}
                    completedFiles={completedFiles}
                    revision={revision}
                    activeTab={activeTab}
                    code={code || undefined}
                  />
                </TabsContent>
              </div>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  )
}

export default function RevisionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">로딩 중...</div>}>
      <RevisionPageContent />
    </Suspense>
  )
}