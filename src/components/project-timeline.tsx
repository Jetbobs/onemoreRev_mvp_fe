'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, FileText, MessageSquare, CheckCircle, Upload, UserPlus } from 'lucide-react'

interface TimelineActivity {
  id: number
  type: 'revision_created' | 'revision_submitted' | 'feedback_created' | 'feedback_completed' | 'file_uploaded' | 'member_invited'
  user: {
    id: number
    name: string
    email: string
  }
  metadata: {
    revNo?: number
    trackName?: string
    fileName?: string
    fileCount?: number
    feedbackContent?: string
    invitedEmail?: string
  }
  createdAt: string
}

interface ProjectTimelineProps {
  projectId: string
}

// Mock 데이터 (나중에 API로 교체)
const MOCK_ACTIVITIES: TimelineActivity[] = [
  {
    id: 1,
    type: 'revision_submitted',
    user: { id: 1, name: '홍길동', email: 'hong@example.com' },
    metadata: { revNo: 3, fileCount: 5 },
    createdAt: '2025-01-15T14:30:00Z'
  },
  {
    id: 2,
    type: 'feedback_created',
    user: { id: 2, name: '김철수', email: 'kim@example.com' },
    metadata: { trackName: '메인 배너', revNo: 3 },
    createdAt: '2025-01-15T11:20:00Z'
  },
  {
    id: 3,
    type: 'file_uploaded',
    user: { id: 1, name: '홍길동', email: 'hong@example.com' },
    metadata: { fileName: 'header.psd', revNo: 3 },
    createdAt: '2025-01-15T09:15:00Z'
  },
  {
    id: 4,
    type: 'revision_created',
    user: { id: 1, name: '홍길동', email: 'hong@example.com' },
    metadata: { revNo: 3 },
    createdAt: '2025-01-15T09:00:00Z'
  },
  {
    id: 5,
    type: 'feedback_completed',
    user: { id: 2, name: '김철수', email: 'kim@example.com' },
    metadata: { revNo: 2 },
    createdAt: '2025-01-14T16:45:00Z'
  },
  {
    id: 6,
    type: 'revision_submitted',
    user: { id: 1, name: '홍길동', email: 'hong@example.com' },
    metadata: { revNo: 2, fileCount: 3 },
    createdAt: '2025-01-14T14:20:00Z'
  },
  {
    id: 7,
    type: 'member_invited',
    user: { id: 1, name: '홍길동', email: 'hong@example.com' },
    metadata: { invitedEmail: 'lee@example.com' },
    createdAt: '2025-01-13T10:00:00Z'
  },
  {
    id: 8,
    type: 'feedback_created',
    user: { id: 2, name: '김철수', email: 'kim@example.com' },
    metadata: { trackName: '로고', revNo: 2 },
    createdAt: '2025-01-14T13:30:00Z'
  }
]

export function ProjectTimeline({ projectId }: ProjectTimelineProps) {
  const [activities, setActivities] = useState<TimelineActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTimeline()
  }, [projectId])

  async function loadTimeline() {
    try {
      setIsLoading(true)

      // TODO: 백엔드 API 연결
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/project/${projectId}/timeline`, {
      //   credentials: 'include'
      // })
      // const data = await response.json()
      // setActivities(data.activities)

      // Mock 데이터 사용
      await new Promise(resolve => setTimeout(resolve, 500))
      setActivities(MOCK_ACTIVITIES)
    } catch (error) {
      console.error('타임라인 로드 실패:', error)
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
          <AvatarImage src={`/avatars/${activity.user.id}.png`} />
          <AvatarFallback>
            {activity.user.name.charAt(0)}
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
    case 'revision_created':
      return <FileText className="w-3 h-3 mr-1" />
    case 'revision_submitted':
      return <Upload className="w-3 h-3 mr-1" />
    case 'feedback_created':
      return <MessageSquare className="w-3 h-3 mr-1" />
    case 'feedback_completed':
      return <CheckCircle className="w-3 h-3 mr-1" />
    case 'file_uploaded':
      return <Upload className="w-3 h-3 mr-1" />
    case 'member_invited':
      return <UserPlus className="w-3 h-3 mr-1" />
    default:
      return null
  }
}

function getActivityMessage(activity: TimelineActivity) {
  const userName = <strong className="text-gray-900">{activity.user.name}</strong>

  switch (activity.type) {
    case 'revision_created':
      return (
        <span>
          {userName}님이 <strong className="text-gray-900">Rev {activity.metadata.revNo}</strong>을 시작했습니다
        </span>
      )
    case 'revision_submitted':
      return (
        <span>
          {userName}님이 <strong className="text-gray-900">Rev {activity.metadata.revNo}</strong>을 제출했습니다
          {activity.metadata.fileCount && ` (${activity.metadata.fileCount}개 파일)`}
        </span>
      )
    case 'feedback_created':
      return (
        <span>
          {userName}님이 <strong className="text-gray-900">{activity.metadata.trackName}</strong> 트랙에 피드백을 작성했습니다
        </span>
      )
    case 'feedback_completed':
      return (
        <span>
          {userName}님이 <strong className="text-gray-900">Rev {activity.metadata.revNo}</strong>의 검토를 완료했습니다
        </span>
      )
    case 'file_uploaded':
      return (
        <span>
          {userName}님이 <strong className="text-gray-900">{activity.metadata.fileName}</strong> 파일을 업로드했습니다
        </span>
      )
    case 'member_invited':
      return (
        <span>
          {userName}님이 <strong className="text-gray-900">{activity.metadata.invitedEmail}</strong>을 프로젝트에 초대했습니다
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
