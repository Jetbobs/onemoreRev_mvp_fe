'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, FileText, MessageSquare, CheckCircle, Upload, FolderPlus, CreditCard } from 'lucide-react'

// 백엔드 ActivityLog 응답 타입
interface ActivityLogResponse {
  success: boolean
  message: string
  projectId: number
  projectName: string
  totalCount: number
  logs: ActivityLogItem[]
}

interface ActivityLogItem {
  id: number
  userId?: number
  projectId: number
  msg: string
  params: string | null
  createdAt: string
  updatedAt: string
  user?: {
    id: number
    email: string
    name?: string
  }
}

// 프론트엔드 타임라인 타입
interface TimelineActivity {
  id: number
  type: 'project_created' | 'revision_created' | 'revision_submitted' |
        'feedback_created' | 'feedback_updated' | 'feedback_deleted' |
        'file_uploaded' | 'track_added' | 'review_completed' | 'payment_updated'
  user: {
    id: number
    name: string
    email: string
  } | null
  metadata: Record<string, any>
  createdAt: string
}

interface ProjectTimelineProps {
  projectId: string
}

// msg 값을 타임라인 타입으로 매핑
const MSG_TO_TYPE_MAP: Record<string, TimelineActivity['type']> = {
  '프로젝트 생성': 'project_created',
  '리비전 생성': 'revision_created',
  '리비전 제출': 'revision_submitted',
  '파일 업로드': 'file_uploaded',
  '소스 파일 업로드': 'file_uploaded',
  '트랙 추가': 'track_added',
  '리뷰 완료': 'review_completed',
  '지급 상태 변경': 'payment_updated',
  '피드백 생성': 'feedback_created',
  '피드백 수정': 'feedback_updated',
  '피드백 삭제': 'feedback_deleted',
  '피드백 답글 설정': 'feedback_created',
  '피드백 답글 삭제': 'feedback_deleted',
}

// ActivityLog를 TimelineActivity로 변환
function transformActivityLog(log: ActivityLogItem): TimelineActivity {
  const params = log.params ? JSON.parse(log.params) : {}

  return {
    id: log.id,
    type: MSG_TO_TYPE_MAP[log.msg] || 'project_created',
    user: log.user ? {
      id: log.user.id,
      name: log.user.name || '게스트',
      email: log.user.email
    } : null,
    metadata: params,
    createdAt: log.createdAt
  }
}

export function ProjectTimeline({ projectId }: ProjectTimelineProps) {
  const [activities, setActivities] = useState<TimelineActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTimeline()
  }, [projectId])

  async function loadTimeline() {
    try {
      setIsLoading(true)

      const { projectApi } = await import('@/lib/api')
      const data: ActivityLogResponse = await projectApi.logs(projectId)
      const transformedActivities = data.logs.map(transformActivityLog)
      setActivities(transformedActivities)
    } catch (error) {
      console.error('타임라인 로드 실패:', error)
      setActivities([])
    } finally {
      setIsLoading(false)
    }
  }

  // 날짜별로 그룹화
  const groupedByDate = groupActivitiesByDate(activities)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedByDate).map(([date, items]) => (
        <div key={date} className="p-5 border border-gray-200 rounded-lg bg-gray-50">
          <time className="text-lg font-semibold text-gray-900">{date}</time>
          <ol className="mt-3 divide-y divide-gray-200">
            {items.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </ol>
        </div>
      ))}

      {activities.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          아직 활동 기록이 없습니다.
        </div>
      )}
    </div>
  )
}

function ActivityItem({ activity }: { activity: TimelineActivity }) {
  const icon = getActivityIcon(activity.type)
  const message = getActivityMessage(activity)
  const timeAgo = getTimeAgo(activity.createdAt)

  return (
    <li className="block p-3 hover:bg-gray-100 rounded transition-colors">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10 mt-1">
          <AvatarImage src={activity.user ? `/avatars/${activity.user.id}.png` : undefined} />
          <AvatarFallback>
            {activity.user ? activity.user.name.charAt(0) : 'G'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-600">
            {message}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center text-xs text-gray-500">
              {icon}
              <Clock className="w-3 h-3 mr-1" />
              {timeAgo}
            </span>
          </div>
        </div>
      </div>
    </li>
  )
}

function getActivityIcon(type: TimelineActivity['type']) {
  switch (type) {
    case 'project_created':
      return <FolderPlus className="w-3 h-3 mr-1" />
    case 'revision_created':
      return <FileText className="w-3 h-3 mr-1" />
    case 'revision_submitted':
      return <Upload className="w-3 h-3 mr-1" />
    case 'feedback_created':
    case 'feedback_updated':
      return <MessageSquare className="w-3 h-3 mr-1" />
    case 'feedback_deleted':
      return <MessageSquare className="w-3 h-3 mr-1" />
    case 'review_completed':
      return <CheckCircle className="w-3 h-3 mr-1" />
    case 'file_uploaded':
      return <Upload className="w-3 h-3 mr-1" />
    case 'track_added':
      return <FolderPlus className="w-3 h-3 mr-1" />
    case 'payment_updated':
      return <CreditCard className="w-3 h-3 mr-1" />
    default:
      return null
  }
}

function getActivityMessage(activity: TimelineActivity) {
  const userName = activity.user
    ? <strong className="text-gray-900">{activity.user.name}</strong>
    : <strong className="text-gray-900">게스트</strong>
  const meta = activity.metadata

  switch (activity.type) {
    case 'project_created':
      return (
        <span>
          {userName}님이 <strong className="text-gray-900">{meta.name || '프로젝트'}</strong>를 생성했습니다
        </span>
      )
    case 'revision_created':
      return (
        <span>
          {userName}님이 <strong className="text-gray-900">Rev {meta.revNo}</strong>을 시작했습니다
        </span>
      )
    case 'revision_submitted':
      return (
        <span>
          {userName}님이 <strong className="text-gray-900">Rev {meta.revNo}</strong>을 제출했습니다
        </span>
      )
    case 'feedback_created':
      return (
        <span>
          {userName}님이 피드백을 작성했습니다
          {meta.trackName && <> (<strong className="text-gray-900">{meta.trackName}</strong>)</>}
        </span>
      )
    case 'feedback_updated':
      return (
        <span>
          {userName}님이 피드백을 수정했습니다
        </span>
      )
    case 'feedback_deleted':
      return (
        <span>
          {userName}님이 피드백을 삭제했습니다
        </span>
      )
    case 'review_completed':
      return (
        <span>
          {userName}님이 <strong className="text-gray-900">Rev {meta.revNo}</strong>의 검토를 완료했습니다
        </span>
      )
    case 'file_uploaded':
      return (
        <span>
          {userName}님이 파일을 업로드했습니다
          {meta.fileName && <> (<strong className="text-gray-900">{meta.fileName}</strong>)</>}
        </span>
      )
    case 'track_added':
      return (
        <span>
          {userName}님이 트랙을 추가했습니다
          {meta.trackName && <> (<strong className="text-gray-900">{meta.trackName}</strong>)</>}
        </span>
      )
    case 'payment_updated':
      return (
        <span>
          {userName}님이 결제 상태를 변경했습니다
          {meta.checkpointName && <> (<strong className="text-gray-900">{meta.checkpointName}</strong>)</>}
        </span>
      )
    default:
      return <span>활동이 기록되었습니다</span>
  }
}

function groupActivitiesByDate(activities: TimelineActivity[]): Record<string, TimelineActivity[]> {
  const groups: Record<string, TimelineActivity[]> = {}

  activities.forEach(activity => {
    const date = new Date(activity.createdAt)
    const dateKey = formatDateKey(date)

    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(activity)
  })

  return groups
}

function formatDateKey(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (targetDate.getTime() === today.getTime()) {
    return '오늘'
  } else if (targetDate.getTime() === yesterday.getTime()) {
    return '어제'
  } else {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}년 ${month}월 ${day}일`
  }
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) {
    return '방금 전'
  } else if (diffMins < 60) {
    return `${diffMins}분 전`
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`
  } else if (diffDays < 7) {
    return `${diffDays}일 전`
  } else {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }
}
