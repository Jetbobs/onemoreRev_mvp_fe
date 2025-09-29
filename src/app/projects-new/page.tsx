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
import { calculateDateProgress, formatDate } from '@/utils/dateProgress';

// 백엔드 API 응답 타입 정의
interface BackendProject {
  id: number;
  name: string;
  description?: string;
  authorId: number;
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

interface ApiResponse {
  success: boolean;
  message: string;
  projects: BackendProject[];
  totalCount: number;
}

// 프론트엔드에서 사용할 프로젝트 타입
interface Project {
  id: number;
  name: string;
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
  revisions: number;
  usedRevisions: number;
  lastUpdated: string;
  budget: string;
  lastRevisionNo?: number; // 최신 리비전 번호 추가
}

export default function ProjectsNewPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/project/list`,
        { credentials: 'include' }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      console.log('프로젝트 데이터:', data);
      
      if (data.success) {
        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const mappedProjects: Project[] = data.projects.map(project => ({
          id: project.id,
          name: project.name,
          status: getStatusText(project.lastRevision?.status || 'prepare'),
          progress: calculateDateProgress(project.startDate, project.deadline),
          startDate: formatDate(project.startDate),
          endDate: formatDate(project.deadline),
          revisions: project.modLimit || 0,
          usedRevisions: project.revisionCount || 0,
          lastUpdated: formatDate(project.updatedAt),
          budget: `${project.totalPrice?.toLocaleString() || 0}원`,
          lastRevisionNo: project.lastRevision?.revNo || 1
        }));
        
        setProjects(mappedProjects);
      } else {
        throw new Error(data.message || '프로젝트 목록을 불러올 수 없습니다.');
      }
      
    } catch (err: any) {
      console.error('프로젝트 로드 실패:', err);
      setError(`프로젝트를 불러올 수 없습니다: ${err.message}`);
      
      // API 실패 시 샘플 데이터 사용 (개발용)
      const sampleProjects: Project[] = [
        {
          id: 1,
          name: "브랜드 리디자인",
          status: "진행중",
          progress: 75,
          startDate: "2024.03.01",
          endDate: "2024.03.30",
          revisions: 3,
          usedRevisions: 1,
          lastUpdated: "2024.03.18",
          budget: "5,000,000원",
          lastRevisionNo: 2
        }
      ];
      setProjects(sampleProjects);
    } finally {
      setIsLoading(false);
    }
  }

  const getStatusText = (status: string) => {
    switch(status) {
      case 'prepare': return '준비중';
      case 'submitted': return '제출됨';
      case 'reviewed': return '검토됨';
      default: return status || '알 수 없음';
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case '검토됨':
        return 'bg-green-500 hover:bg-green-600';
      case '진행중':
      case '제출됨':
        return 'bg-blue-500 hover:bg-blue-600';
      case '준비중':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getDaysAgo = (dateString: string) => {
    if (dateString === '미정') return '날짜 미정';
    
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
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
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

  // 스켈레톤 카드 컴포넌트
  const ProjectCardSkeleton = () => (
    <Card className="bg-white">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
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
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">프로젝트</h1>
                  <p className="text-gray-600">모든 프로젝트를 확인하세요</p>
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

            {/* 에러 표시 */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
                <p className="text-sm text-red-500 mt-1">샘플 데이터를 표시합니다.</p>
              </div>
            )}

            {/* 검색 및 필터 바 */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="프로젝트명 검색..."
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
                  <SelectItem value="제출됨">제출됨</SelectItem>
                  <SelectItem value="검토됨">검토됨</SelectItem>
                  <SelectItem value="준비중">준비중</SelectItem>
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
                    className="w-full cursor-pointer"
                    variant="outline"
                    onClick={() => router.push(`/revision-new?projectId=${project.id}&revNo=${project.lastRevisionNo || 1}`)}
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
}