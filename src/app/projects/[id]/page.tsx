"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MultiFileViewer from '@/components/multi-file-viewer';
import FigmaCanvas from '@/components/figma-canvas';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Phone, 
  RefreshCw, 
  FileText,
  ChevronLeft,
  ChevronRight,
  Edit,
  User,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  CircleCheckBig,
  MessageSquare,
  Plus,
  Trash2
} from 'lucide-react';

const ProjectDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id;
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [draftStep, setDraftStep] = useState(1); // 시안 및 수정 탭의 Step 상태
  const [revisionItems, setRevisionItems] = useState<any[]>([
    { id: 1, text: '', completed: false, notes: '' }
  ]);
  const [selectedDraftImages, setSelectedDraftImages] = useState<any[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 샘플 프로젝트 데이터 (실제로는 API에서 가져와야 함)
  const project = {
    id: projectId,
    name: "브랜드 리디자인",
    client: "ABC 기업",
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
    paymentMethod: "installment",
    installments: [
      { name: "계약금", percentage: 30, amount: 1500000, status: "완료", date: "2024.03.01" },
      { name: "중간금", percentage: 40, amount: 2000000, status: "대기", date: "2024.03.15" },
      { name: "잔금", percentage: 30, amount: 1500000, status: "대기", date: "2024.03.30" }
    ]
  };

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

  // 체크리스트 아이템 추가
  const addRevisionItem = () => {
    setRevisionItems([...revisionItems, {
      id: Date.now(),
      text: '',
      completed: false,
      notes: ''
    }]);
  };

  // 체크리스트 아이템 삭제
  const removeRevisionItem = (id: number) => {
    setRevisionItems(revisionItems.filter(item => item.id !== id));
  };

  // 체크리스트 아이템 업데이트
  const updateRevisionItem = (id: number, field: string, value: any) => {
    setRevisionItems(revisionItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // 완료된 항목 수 계산
  const getCompletedCount = () => {
    return revisionItems.filter(item => item.completed).length;
  };

  // 로딩 시뮬레이션
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
                    {project.client}
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
                                      <p className="text-sm text-gray-600 mb-1">클라이언트</p>
                                      <p className="font-medium text-gray-900 flex items-center">
                                        <User className="h-4 w-4 mr-2" />
                                        {project.client}
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
                                      {project.installments.map((installment, index) => (
                                        <div key={index} className="p-3 border border-gray-200 rounded-lg">
                                          <div className="flex justify-between items-start mb-1">
                                            <div>
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">{installment.name}</span>
                                                <Badge className={`text-xs ${getPaymentStatusColor(installment.status)}`}>
                                                  {installment.status}
                                                </Badge>
                                              </div>
                                              <p className="text-xs text-gray-500">{installment.date}</p>
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
                        {/* Step 네비게이션 */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <Button
                                variant={draftStep === 1 ? "default" : "outline"}
                                onClick={() => setDraftStep(1)}
                                className="gap-2"
                              >
                                <span className="font-semibold">Step 1</span>
                                시안 파일 관리
                              </Button>
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                              <Button
                                variant={draftStep === 2 ? "default" : "outline"}
                                onClick={() => setDraftStep(2)}
                                className="gap-2"
                              >
                                <span className="font-semibold">Step 2</span>
                                수정 체크리스트
                              </Button>
                            </div>
                            {draftStep === 2 && (
                              <Badge variant="secondary" className="text-sm">
                                {getCompletedCount()}/{revisionItems.length} 완료
                              </Badge>
                            )}
                          </div>
                          <div className="h-px bg-gray-200"></div>
                        </div>

                        {/* Step 1: 시안 파일 관리 */}
                        {draftStep === 1 && (
                          <div className="space-y-4">
                            <div className="h-[600px] overflow-hidden rounded-lg border border-gray-200">
                              <MultiFileViewer onSelectionChange={setSelectedDraftImages} />
                            </div>
                            <div className="flex justify-end">
                              <Button 
                                onClick={() => setDraftStep(2)}
                                disabled={selectedDraftImages.length === 0}
                              >
                                다음 단계로 ({selectedDraftImages.length}개 선택됨)
                                <ChevronRight className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Step 2: 수정 체크리스트 */}
                        {draftStep === 2 && (
                          <div className="space-y-6">
                            {/* Figma Canvas */}
                            <div className="h-[600px] border border-gray-200 rounded-lg overflow-hidden">
                              {selectedDraftImages.length > 0 && (
                                <FigmaCanvas 
                                  key={`canvas-${selectedDraftImages[currentImageIndex]?.id}`}
                                  image={{
                                    id: selectedDraftImages[currentImageIndex]?.id || '',
                                    src: selectedDraftImages[currentImageIndex]?.url || '',
                                    name: selectedDraftImages[currentImageIndex]?.name || ''
                                  }}
                                />
                              )}
                            </div>
                            
                            {/* Gallery */}
                            {selectedDraftImages.length > 1 && (
                              <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">선택된 시안 ({selectedDraftImages.length}개)</h3>
                                <div className="flex gap-3 overflow-x-auto">
                                  {selectedDraftImages.map((image, index) => (
                                    <div 
                                      key={image.id}
                                      className={`relative flex-shrink-0 cursor-pointer group ${
                                        index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                                      }`}
                                      onClick={() => setCurrentImageIndex(index)}
                                    >
                                      <img
                                        src={image.url}
                                        alt={image.name}
                                        className="w-20 h-20 object-cover rounded border"
                                      />
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded transition-all"></div>
                                      <span className="absolute bottom-1 left-1 text-xs bg-black bg-opacity-60 text-white px-1 rounded">
                                        {index + 1}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                  <span className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5" />
                                    수정 체크리스트
                                  </span>
                                  <Button
                                    size="sm"
                                    onClick={addRevisionItem}
                                    variant="outline"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    항목 추가
                                  </Button>
                                </CardTitle>
                                <CardDescription>
                                  수정이 필요한 항목들을 체크리스트로 관리하세요
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {revisionItems.map((item, index) => (
                                    <Card key={item.id} className="p-4 border border-gray-200">
                                      <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                          <Checkbox
                                            checked={item.completed}
                                            onCheckedChange={(checked) =>
                                              updateRevisionItem(item.id, 'completed', checked)
                                            }
                                            className="mt-1"
                                          />
                                          <div className="flex-1 space-y-3">
                                            <Input
                                              placeholder="수정 항목을 입력하세요"
                                              value={item.text}
                                              onChange={(e) =>
                                                updateRevisionItem(item.id, 'text', e.target.value)
                                              }
                                              className={item.completed ? 'line-through opacity-50' : ''}
                                            />
                                            <div className="flex items-center gap-2">
                                              <MessageSquare className="h-4 w-4 text-gray-400" />
                                              <Textarea
                                                placeholder="추가 메모 (선택사항)"
                                                value={item.notes}
                                                onChange={(e) =>
                                                  updateRevisionItem(item.id, 'notes', e.target.value)
                                                }
                                                className="resize-none h-20"
                                              />
                                            </div>
                                          </div>
                                          {revisionItems.length > 1 && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => removeRevisionItem(item.id)}
                                            >
                                              <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                          )}
                                        </div>
                                      </div>
                                    </Card>
                                  ))}
                                </div>

                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm text-gray-600">진행 상황</p>
                                      <p className="text-2xl font-bold">
                                        {getCompletedCount()} / {revisionItems.length}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-gray-600">완료율</p>
                                      <p className="text-2xl font-bold">
                                        {revisionItems.length > 0
                                          ? Math.round((getCompletedCount() / revisionItems.length) * 100)
                                          : 0}%
                                      </p>
                                    </div>
                                  </div>
                                  <Progress
                                    value={
                                      revisionItems.length > 0
                                        ? (getCompletedCount() / revisionItems.length) * 100
                                        : 0
                                    }
                                    className="mt-3"
                                  />
                                </div>

                                <div className="mt-4 flex justify-between">
                                  <Button variant="outline" onClick={() => setDraftStep(1)}>
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    이전 단계
                                  </Button>
                                  <Button>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    저장하기
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* 파일 및 히스토리 탭 */}
                    <TabsContent value="files" className="mt-0">
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <FileText className="h-12 w-12 mb-4" />
                        <p className="text-lg">파일 및 히스토리가 여기에 표시됩니다</p>
                      </div>
                    </TabsContent>
                  </div>
                </CardContent>
              </Card>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;