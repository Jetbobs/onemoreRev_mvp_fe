'use client'

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
  return (
    <div className="space-y-6">
      {/* 파일 히스토리 레이아웃 */}
      <FileHistoryLayout completedFiles={completedFiles} projectId={projectId} />

    </div>
  )
}