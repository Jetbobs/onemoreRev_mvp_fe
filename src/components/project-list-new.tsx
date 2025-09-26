'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Folder, Plus } from 'lucide-react'
import { projectApi } from '@/lib/api'
import Link from 'next/link'
import Image from 'next/image'

interface Project {
  id: string
  name?: string
  title?: string
  tracks?: Array<{
    latestFile?: {
      storedFilename: string
    }
  }>
  lastRevision?: {
    revNo?: number
    revisionNo?: number
    no?: number
    id?: number
  }
}

interface ProjectListProps {
  className?: string
}

export function ProjectListNew({ className }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    try {
      setIsLoading(true)
      setError(null)
      const data = await projectApi.list()
      console.log('[ProjectList] API response:', data)
      
      // 백엔드 응답 구조에 따라 처리
      const projectList = data?.projects || data?.items || []
      setProjects(projectList)
    } catch (err: any) {
      console.error('[ProjectList] Error:', err)
      
      if (err.status === 401) {
        setError('로그인이 필요합니다.')
      } else {
        setError(err.data?.message || '프로젝트 목록을 불러오지 못했습니다.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getProjectThumbnail = (project: Project) => {
    const thumbnailPath = project?.tracks?.[0]?.latestFile?.storedFilename
    return thumbnailPath ? `/files/${thumbnailPath}` : null
  }

  const getProjectHref = (project: Project) => {
    const lastRevision = project?.lastRevision
    const lastRevNo = lastRevision?.revNo || lastRevision?.revisionNo || 
                     lastRevision?.no || lastRevision?.id

    return lastRevNo 
      ? `/revision?projectId=${project.id}&revNo=${lastRevNo}`
      : `/projects/${project.id}`
  }

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">내 프로젝트</h1>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            새 프로젝트
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex gap-3 p-3">
                  <Skeleton className="w-12 h-12 rounded-md flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={className}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">내 프로젝트</h1>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            {error.includes('로그인') && (
              <Link href="/login" className="ml-2 underline text-blue-600 hover:text-blue-800">
                로그인하러 가기
              </Link>
            )}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">내 프로젝트</h1>
        <Link href="/projects/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            새 프로젝트
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">아직 프로젝트가 없습니다.</p>
          <Link href="/projects/create">
            <Button>첫 프로젝트 만들기</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {projects.map((project) => {
            const thumbnailUrl = getProjectThumbnail(project)
            const href = getProjectHref(project)
            const projectName = project.name || project.title || '(제목 없음)'
            const lastRevision = project?.lastRevision
            const lastRevNo = lastRevision?.revNo || lastRevision?.revisionNo || 
                             lastRevision?.no || lastRevision?.id

            return (
              <Link key={project.id} href={href}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border border-gray-800 bg-gray-900/20 hover:bg-gray-900/40">
                  <CardContent className="p-0">
                    <div className="flex gap-3 p-3 items-start">
                      {/* 썸네일 */}
                      <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-800 flex items-center justify-center">
                        {thumbnailUrl ? (
                          <Image
                            src={thumbnailUrl}
                            alt="프로젝트 썸네일"
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const nextEl = target.nextElementSibling as HTMLElement
                              if (nextEl) nextEl.style.display = 'block'
                            }}
                          />
                        ) : null}
                        <div className={`text-xs text-muted-foreground text-center ${thumbnailUrl ? 'hidden' : ''}`}>
                          이미지 없음
                        </div>
                      </div>

                      {/* 프로젝트 정보 */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1 truncate">
                          {projectName}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-1">
                          ID: {project.id}
                        </p>
                        {lastRevNo && (
                          <Badge variant="outline" className="text-xs">
                            리비전: {lastRevNo}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}