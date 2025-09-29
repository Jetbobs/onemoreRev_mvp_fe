"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import FileHistoryLayout from '@/components/file-history-layout';
import { RevisionContent } from '@/components/revision-content';
import { calculateDateProgress, formatDate } from '@/utils/dateProgress';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Phone, 
  RefreshCw, 
  FileText,
  ChevronLeft,
  Edit,
  User,
  CreditCard,
  AlertCircle
} from 'lucide-react';

// 백엔드 API 응답 타입 정의
interface BackendProject {
  id: number;
  name: string;
  description?: string;
  authorId: number;
  authorEmail?: string;
  startDate?: Date;
  deadline?: Date;
  totalPrice: number;
  modLimit: number;
  createdAt: Date;
  updatedAt: Date;
  revisionCount: number;
  lastRevision?: {
    id: number;
    revNo: number;
    description?: string;
    status: string;
    createdAt: Date;
  };
  tracks: any[];
  guests: any[];
}

const ProjectDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.id;
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentRevNo, setCurrentRevNo] = useState(1); // 현재 리비전 번호
  const [guestCode, setGuestCode] = useState<string | undefined>(searchParams.get('code') || undefined); // 게스트 코드
  const [installments, setInstallments] = useState([
    { name: "계약금", percentage: 30, amount: 1500000, status: "완료", date: "2024.03.01" },
    { name: "중간금", percentage: 40, amount: 2000000, status: "대기", date: "2024.03.15" },
    { name: "잔금", percentage: 30, amount: 1500000, status: "대기", date: "2024.03.30" }
  ]);
  const [completedFiles] = useState<any[]>([]); // 완료된 파일 목록
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    showCancel: true
  });

  // 프로젝트 데이터
  const [project, setProject] = useState<any>({
    id: projectId,
    name: "프로젝트명",
    authorEmail: "user@example.com",
    status: "진행중",
    progress: 75,
    startDate: "2024.03.01",
    draftDeadline: "2024.03.15",
    finalDeadline: "2024.03.30",
    budget: 5000000,
    clientPhone: "010-1234-5678",
    sourceFileProvision: "yes",
    revisionCount: 3,
    usedRevisions: 1,
    additionalRevisionFee: 50000,
    revisionCriteria: "디자인 컨셉 변경, 색상 수정, 타이포그래피 조정 등 주요 디자인 요소의 변경을 1회 수정으로 계산합니다.",
    paymentMethod: "installment"
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case '완료':
        return 'bg-green-500 hover:bg-green-600';
      case '진행중':
        return 'bg-blue-500 hover:bg-blue-600';
      case '검토중':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case '대기':
        return 'bg-gray-500 hover:bg-gray-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case '완료':
        return 'bg-green-100 text-green-700 border-green-200';
      case '대기':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const calculateDaysLeft = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline.replace(/\./g, '-'));
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)}일 지남`;
    if (diffDays === 0) return '오늘';
    return `${diffDays}일 남음`;
  };


  // 결제 상태 변경 함수
  const togglePaymentStatus = (index: number) => {
    const newInstallments = [...installments];
    newInstallments[index].status = newInstallments[index].status === '완료' ? '대기' : '완료';
    setInstallments(newInstallments);
  };

  // 리비전 변경 함수
  const handleRevisionChange = (revNo: number) => {
    setCurrentRevNo(revNo);
  };

  // URL 파라미터 변경 감지
  useEffect(() => {
    const codeParam = searchParams.get('code');
    setGuestCode(codeParam || undefined);
  }, [searchParams]);


  // 프로젝트 상세 데이터 로드
  useEffect(() => {
    loadProjectDetail();
  }, [projectId]);

  async function loadProjectDetail() {
    try {
      setIsLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/project/${projectId}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('프로젝트 상세 데이터:', data);

      if (data.success && data.project) {
        const backendProject: BackendProject = data.project;

        // 백엔드 데이터를 프론트엔드 형식으로 변환
        setProject({
          id: backendProject.id,
          name: backendProject.name,
          description: backendProject.description,
          authorEmail: backendProject.authorEmail || 'author@example.com',
          status: getProjectStatus(backendProject),
          progress: calculateDateProgress(backendProject.startDate, backendProject.deadline),
          startDate: formatDate(backendProject.startDate) || '미정',
          draftDeadline: '미정', // 백엔드에 없는 필드
          finalDeadline: formatDate(backendProject.deadline) || '미정',
          budget: backendProject.totalPrice || 0,
          clientPhone: '연락처 미등록', // 백엔드에 없는 필드
          sourceFileProvision: 'no', // 백엔드에 없는 필드
          revisionCount: backendProject.modLimit || 0,
          usedRevisions: backendProject.revisionCount || 0,
          additionalRevisionFee: 50000, // 고정값 또는 백엔드에서 받아오기
          revisionCriteria: '디자인 컨셉 변경, 색상 수정, 타이포그래피 조정 등 주요 디자인 요소의 변경을 1회 수정으로 계산합니다.',
          paymentMethod: 'installment',
          tracks: backendProject.tracks || [],
          guests: backendProject.guests || []
        });
      } else {
        throw new Error(data.message || '프로젝트 정보를 불러올 수 없습니다.');
      }
    } catch (err: any) {
      console.error('프로젝트 상세 로드 실패:', err);
      // API 실패 시 기본 데이터 사용
      setProject({
        id: projectId,
        name: "샘플 프로젝트",
        authorEmail: "sample@example.com",
        status: "진행중",
        progress: 75,
        startDate: "2024.03.01",
        draftDeadline: "2024.03.15",
        finalDeadline: "2024.03.30",
        budget: 5000000,
        clientPhone: "010-1234-5678",
        sourceFileProvision: "yes",
        revisionCount: 3,
        usedRevisions: 1,
        additionalRevisionFee: 50000,
        revisionCriteria: "디자인 컨셉 변경, 색상 수정, 타이포그래피 조정 등 주요 디자인 요소의 변경을 1회 수정으로 계산합니다.",
        paymentMethod: "installment"
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getProjectStatus = (project: BackendProject) => {
    if (project.lastRevision?.status === 'reviewed') return '검토됨';
    if (project.lastRevision?.status === 'submitted') return '제출됨';
    if (project.revisionCount > 0) return '진행중';
    return '준비중';
  }

  // 개요 탭 스켈레톤
  const OverviewSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 왼쪽 카드 스켈레톤 (2/3) */}
      <Card className="lg:col-span-2 border border-gray-200">
        <CardContent className="p-6">
          <div className="space-y-8">
            {/* 프로젝트 기본 정보 스켈레톤 */}
            <div>
              <div className="flex items-center mb-4">
                <Skeleton className="h-5 w-5 mr-2" />
                <Skeleton className="h-6 w-40" />
              </div>
              
              <div className="space-y-4">
                {/* 진행률 스켈레톤 */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>

                {/* 프로젝트명, 클라이언트 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>

                {/* 예산, 연락처 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-4 w-12 mb-1" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                </div>

                {/* 원본파일 제공 */}
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
            </div>

            {/* 수정 조건 스켈레톤 */}
            <div>
              <div className="flex items-center mb-4">
                <Skeleton className="h-5 w-5 mr-2" />
                <Skeleton className="h-6 w-20" />
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </div>
                
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 오른쪽 카드 스켈레톤 (1/3) */}
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="space-y-8">
            {/* 일정 정보 스켈레톤 */}
            <div>
              <div className="flex items-center mb-4">
                <Skeleton className="h-5 w-5 mr-2" />
                <Skeleton className="h-6 w-20" />
              </div>
              
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-3 rounded-lg border border-gray-200">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-5 w-20 mb-1" />
                    <div className="flex items-center mt-1">
                      <Skeleton className="h-3 w-3 mr-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              {/* 결제 정보 스켈레톤 */}
              <div>
                <div className="flex items-center mb-4">
                  <Skeleton className="h-5 w-5 mr-2" />
                  <Skeleton className="h-6 w-20" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-4 w-12" />
                              <Skeleton className="h-4 w-8 rounded-full" />
                            </div>
                            <Skeleton className="h-3 w-16 mt-1" />
                          </div>
                          <div className="text-right">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-8 mt-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-2 border-t border-gray-300 mt-4">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

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

        {isLoading ? (
          <>
            {/* 헤더 스켈레톤 */}
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

            {/* 탭 스켈레톤 */}
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                <div>
                  <div className="flex space-x-8 px-6 pb-0">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="py-3">
                        <Skeleton className="h-6 w-32" />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 탭 콘텐츠 스켈레톤 */}
                <div className="py-6">
                  <OverviewSkeleton />
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* 프로젝트 헤더 */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h1>
                  <p className="text-gray-600 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {project.authorEmail}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={`text-white ${getStatusColor(project.status)}`}>
                    {project.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    편집
                  </Button>
                </div>
              </div>
              
              {/* 진행률 */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">전체 진행률</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            </div>

            {/* 탭 콘텐츠 */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

                              {/* <Separator /> */}

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
                                                onCheckedChange={() => togglePaymentStatus(index)}
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
                    </TabsContent>

                    {/* 시안 및 수정 탭 */}
                    <TabsContent value="drafts" className="mt-0">
                      <div className="w-full">
                        {!isLoading && (
                          <RevisionContent
                            projectId={projectId as string}
                            revNo={currentRevNo.toString()}
                            code={guestCode}
                            showNavigation={true}
                            showHeader={false}
                            className=""
                            onRevisionChange={handleRevisionChange}
                          />
                        )}
                      </div>
                    </TabsContent>

                    {/* 파일 및 히스토리 탭 */}
                    <TabsContent value="files" className="mt-0">
                      <FileHistoryLayout completedFiles={completedFiles} />
                    </TabsContent>
                  </div>
                </CardContent>
              </Card>
            </Tabs>
          </>
        )}
      </div>

      {/* Alert Dialog */}
      <AlertDialog open={alertDialog.isOpen} onOpenChange={(open) => setAlertDialog(prev => ({ ...prev, isOpen: open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {alertDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {alertDialog.showCancel && (
              <AlertDialogCancel onClick={() => setAlertDialog(prev => ({ ...prev, isOpen: false }))}>
                취소
              </AlertDialogCancel>
            )}
            <AlertDialogAction onClick={alertDialog.onConfirm}>
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectDetailPage;