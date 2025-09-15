"use client"

import React, { useState, useEffect } from 'react';
import { Header } from "@/components/header"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, RefreshCw, Eye, Search, Filter, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const MyProjectsPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isLoading, setIsLoading] = useState(true);

  // 샘플 프로젝트 데이터
  const projects = [
    {
      id: 1,
      name: "브랜드 리디자인",
      client: "ABC 기업",
      status: "진행중",
      progress: 75,
      startDate: "2024.03.01",
      endDate: "2024.03.30",
      revisions: 3,
      usedRevisions: 1,
      lastUpdated: "2024.03.18",
      budget: "5,000,000원"
    },
    {
      id: 2,
      name: "모바일 앱 UI 디자인",
      client: "스타트업 XYZ",
      status: "검토중",
      progress: 90,
      startDate: "2024.02.15",
      endDate: "2024.03.15",
      revisions: 5,
      usedRevisions: 3,
      lastUpdated: "2024.03.12",
      budget: "8,000,000원"
    },
    {
      id: 3,
      name: "웹사이트 랜딩페이지",
      client: "온라인 쇼핑몰",
      status: "완료",
      progress: 100,
      startDate: "2024.01.20",
      endDate: "2024.02.20",
      revisions: 2,
      usedRevisions: 2,
      lastUpdated: "2024.02.20",
      budget: "3,000,000원"
    },
    {
      id: 4,
      name: "패키지 디자인",
      client: "식품 브랜드",
      status: "대기",
      progress: 25,
      startDate: "2024.03.10",
      endDate: "2024.04.10",
      revisions: 1,
      usedRevisions: 0,
      lastUpdated: "2024.03.10",
      budget: "4,500,000원"
    },
    {
      id: 5,
      name: "소셜미디어 템플릿",
      client: "마케팅 에이전시",
      status: "진행중",
      progress: 60,
      startDate: "2024.02.28",
      endDate: "2024.03.28",
      revisions: 4,
      usedRevisions: 2,
      lastUpdated: "2024.03.16",
      budget: "2,500,000원"
    },
    {
      id: 6,
      name: "기업 프레젠테이션",
      client: "컨설팅 회사",
      status: "검토중",
      progress: 85,
      startDate: "2024.03.05",
      endDate: "2024.03.25",
      revisions: 6,
      usedRevisions: 4,
      lastUpdated: "2024.03.17",
      budget: "3,500,000원"
    }
  ];

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

  const getDaysAgo = (dateString: string) => {
    const today = new Date();
    const lastUpdated = new Date(dateString.replace(/\./g, '-'));
    const diffTime = Math.abs(today.getTime() - lastUpdated.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '1일 전';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    return `${Math.floor(diffDays / 30)}개월 전`;
  };

  // 필터링 및 검색 로직
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 정렬 로직
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.lastUpdated.replace(/\./g, '-')).getTime() - 
               new Date(a.lastUpdated.replace(/\./g, '-')).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      case 'progress':
        return b.progress - a.progress;
      default:
        return 0;
    }
  });

  // 통계 계산
  const stats = {
    total: projects.length,
    completed: projects.filter(p => p.status === '완료').length,
    inProgress: projects.filter(p => p.status === '진행중').length,
    reviewing: projects.filter(p => p.status === '검토중').length,
    waiting: projects.filter(p => p.status === '대기').length
  };

  // 로딩 시뮬레이션
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // 스켈레톤 카드 컴포넌트
  const ProjectCardSkeleton = () => (
    <Card className="bg-white">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        
        <Skeleton className="h-4 w-3/4" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-3 w-32" />
      </CardContent>
      
      <CardFooter className="pt-4">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto p-6">
        {isLoading ? (
          <>
            {/* 페이지 헤더 스켈레톤 */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <Skeleton className="h-9 w-32 mb-2" />
                  <Skeleton className="h-5 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
              </div>
            </div>

            {/* 검색 및 필터 바 스켈레톤 */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full md:w-[180px]" />
              <Skeleton className="h-10 w-full md:w-[180px]" />
            </div>

            {/* 프로젝트 카드 그리드 스켈레톤 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <ProjectCardSkeleton key={index} />
              ))}
            </div>
          </>
        ) : (
          <>
            {/* 페이지 헤더 */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">내 프로젝트</h1>
                  <p className="text-gray-600">진행 중인 모든 프로젝트를 관리하세요</p>
                </div>
                <Button 
                  onClick={() => router.push('/projects/create')}
                  className="bg-black hover:bg-gray-800 text-white cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  새 프로젝트
                </Button>
              </div>
            </div>

            {/* 검색 및 필터 바 */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="프로젝트명 또는 클라이언트 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="진행중">진행중</SelectItem>
                  <SelectItem value="검토중">검토중</SelectItem>
                  <SelectItem value="완료">완료</SelectItem>
                  <SelectItem value="대기">대기</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">최근 업데이트순</SelectItem>
                  <SelectItem value="name">이름순</SelectItem>
                  <SelectItem value="progress">진행률순</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 프로젝트 카드 그리드 */}
            {sortedProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow duration-300 bg-white">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg font-semibold text-gray-800 leading-tight">
                      {project.name}
                    </CardTitle>
                    <Badge className={`text-white ${getStatusColor(project.status)}`}>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {project.client}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* 진행률 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">진행률</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress 
                      value={project.progress} 
                      className="h-2"
                    />
                  </div>
                  
                  {/* 일정 */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{project.startDate} - {project.endDate}</span>
                  </div>
                  
                  {/* 수정 횟수 및 예산 */}
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <RefreshCw className="h-4 w-4" />
                      <span>수정 {project.usedRevisions}/{project.revisions}회</span>
                    </div>
                    <span className="font-medium text-gray-700">{project.budget}</span>
                  </div>
                  
                  {/* 마지막 업데이트 */}
                  <div className="text-xs text-gray-500">
                    마지막 업데이트: {getDaysAgo(project.lastUpdated)}
                  </div>
                </CardContent>
                
                <CardFooter className="pt-4">
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    상세보기
                  </Button>
                </CardFooter>
                </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="text-gray-400">
                  <Filter className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg">검색 결과가 없습니다</p>
                  <p className="text-sm mt-2">다른 검색어나 필터를 시도해보세요</p>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyProjectsPage;