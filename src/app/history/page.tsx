'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, ChevronLeft, Download } from 'lucide-react'
import Image from 'next/image'
import { downloadFile, getFileExtension } from '@/lib/utils'

interface Track {
  id: number
  name: string
}

interface RevisionFile {
  trackId: number
  storedFilename: string
  originalFilename: string
}

interface SrcFile {
  id: number
  trackId: number
  originalFilename: string
  storedFilename: string
  fileSize: number
  mimeType: string
  uploadedAt: string
}

interface Revision {
  id: number
  revNo: number
  status: 'prepare' | 'submitted' | 'reviewed'
  createdAt: string
  files: RevisionFile[]
  createdTracks: Track[]
  srcFiles?: SrcFile[]
}

interface HistoryData {
  success: boolean
  projectName: string
  revisions: Revision[]
  message?: string
}

function HistoryPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [historyData, setHistoryData] = useState<HistoryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allTracks, setAllTracks] = useState<Track[]>([])
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [isAllSelected, setIsAllSelected] = useState(false)

  const projectId = searchParams.get('projectId')

  useEffect(() => {
    loadProjectHistory()
  }, [projectId])

  async function loadProjectHistory() {
    if (!projectId) {
      setError('프로젝트 ID가 필요합니다.')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/project/history?projectId=${projectId}`,
        { credentials: 'include' }
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data: HistoryData = await response.json()
      console.log('히스토리 데이터:', data)
      
      if (!data.success) {
        throw new Error(data.message || '히스토리 로드 실패')
      }
      
      setHistoryData(data)
      
      // 모든 트랙 수집
      if (data.revisions.length > 0) {
        const trackIds = new Set<number>()
        data.revisions.forEach(rev => {
          rev.files.forEach(file => {
            trackIds.add(file.trackId)
          })
        })
        
        const trackMap = new Map<number, Track>()
        data.revisions.forEach(rev => {
          rev.createdTracks.forEach(track => {
            trackMap.set(track.id, track)
          })
        })
        
        const tracks: Track[] = []
        trackIds.forEach(trackId => {
          const track = trackMap.get(trackId)
          if (track) {
            tracks.push(track)
          } else {
            tracks.push({
              id: trackId,
              name: `트랙 ${trackId}`
            })
          }
        })
        
        tracks.sort((a, b) => a.id - b.id)
        setAllTracks(tracks)
      }
      
    } catch (err) {
      console.error('히스토리 로드 실패:', err)
      setError(`히스토리를 불러올 수 없습니다: ${(err as Error).message}`)
    } finally {
      setIsLoading(false)
    }
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
      case 'prepare': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'reviewed': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${month}/${day} ${hours}:${minutes}`
  }

  const handleDownload = async (filename: string, originalFilename: string) => {
    await downloadFile(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/files/${filename}`,
      originalFilename
    )
  }

  const toggleFileSelection = (revisionId: number, trackId: number) => {
    const fileKey = `${revisionId}-${trackId}`
    setSelectedFiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fileKey)) {
        newSet.delete(fileKey)
      } else {
        newSet.add(fileKey)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedFiles(new Set())
      setIsAllSelected(false)
    } else {
      const allFiles = new Set<string>()
      historyData?.revisions.forEach(revision => {
        revision.files.forEach(file => {
          allFiles.add(`${revision.id}-${file.trackId}`)
        })
      })
      setSelectedFiles(allFiles)
      setIsAllSelected(true)
    }
  }

  const handleBulkDownload = async () => {
    if (selectedFiles.size === 0) {
      alert('다운로드할 파일을 선택해주세요.')
      return
    }

    const filesToDownload: Array<{ filename: string; originalFilename: string }> = []

    historyData?.revisions.forEach(revision => {
      revision.files.forEach(file => {
        const fileKey = `${revision.id}-${file.trackId}`
        if (selectedFiles.has(fileKey)) {
          filesToDownload.push({
            filename: file.storedFilename,
            originalFilename: file.originalFilename
          })
        }
      })
    })

    for (const file of filesToDownload) {
      await handleDownload(file.filename, file.originalFilename)
      // 브라우저가 다운로드를 처리할 시간 확보
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    alert(`${filesToDownload.length}개 파일 다운로드를 시작했습니다.`)
  }

  const renderTrackCell = (track: Track, revision: Revision) => {
    const revisionFile = revision.files.find(f => f.trackId === track.id)
    const srcFile = revision.srcFiles?.find(f => f.trackId === track.id)
    const fileKey = `${revision.id}-${track.id}`
    const isSelected = selectedFiles.has(fileKey)

    return (
      <td key={`${revision.id}-${track.id}`} className="p-3 border-r border-gray-200 text-center min-h-[80px]">
        {revisionFile ? (
          <div className="flex flex-col items-center space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleFileSelection(revision.id, track.id)}
                className="w-4 h-4 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="relative w-full h-15 bg-gray-100 rounded border overflow-hidden group">
              <Image
                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/files/${revisionFile.storedFilename}`}
                alt={revisionFile.originalFilename}
                width={80}
                height={60}
                className="w-full h-15 object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement
                  img.style.display = 'none'
                  const parent = img.parentElement
                  if (parent) {
                    parent.innerHTML = '<div class="w-full h-15 bg-gray-200 flex items-center justify-center text-xs text-gray-500">로드 실패</div>'
                  }
                }}
              />
              {/* 이미지 다운로드 버튼 */}
              <button
                className="absolute top-1 right-1 p-1 h-6 w-6 bg-white/80 rounded hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownload(revisionFile.storedFilename, revisionFile.originalFilename)
                }}
                title={`${revisionFile.originalFilename} 다운로드`}
              >
                <Download className="h-3 w-3 text-gray-600" />
              </button>

              {/* 원본 파일 다운로드 버튼 (PSD/AI) */}
              {srcFile && (
                <button
                  className="absolute bottom-1 right-1 flex flex-col items-center justify-center w-7 h-7 bg-black/90 text-white rounded-full hover:bg-black transition-all hover:scale-110 border-2 border-white shadow-lg z-10"
                  onClick={(e) => {
                    e.stopPropagation()
                    downloadFile(
                      `${process.env.NEXT_PUBLIC_API_BASE_URL}/files/${srcFile.storedFilename}`,
                      srcFile.originalFilename
                    )
                  }}
                  title={`원본 파일 다운로드: ${srcFile.originalFilename}`}
                >
                  <Download className="h-3 w-3" />
                  <span className="text-[7px] leading-none font-bold mt-0.5">
                    {getFileExtension(srcFile.originalFilename)}
                  </span>
                </button>
              )}
            </div>
            <div className="text-xs text-gray-500 text-center truncate max-w-[100px]" title={track.name}>
              {track.name}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-1">
            <div className="w-full h-15 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
              <span className="text-xs text-gray-400">-</span>
            </div>
            <div className="text-xs text-gray-500 text-center">
              {track.name}
            </div>
          </div>
        )}
      </td>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-4">
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="mb-6">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="p-3 text-center font-semibold text-gray-700">
                        <Skeleton className="h-4 w-16" />
                      </th>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <th key={i} className="p-3 text-center font-semibold text-gray-700">
                          <Skeleton className="h-4 w-20" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 text-left">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </td>
                        {Array.from({ length: 3 }).map((_, j) => (
                          <td key={j} className="p-3 text-center">
                            <Skeleton className="h-15 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
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
        <div className="max-w-6xl mx-auto p-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!historyData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>히스토리 데이터를 찾을 수 없습니다.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          뒤로가기
        </Button>
        
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              {historyData.projectName} 히스토리
            </h1>
            <p className="text-gray-600">
              {historyData.revisions.length}개의 리비전
            </p>
          </div>
          <Button
            onClick={handleBulkDownload}
            disabled={selectedFiles.size === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            다운로드 ({selectedFiles.size})
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-0">
            {historyData.revisions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                리비전이 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="p-3 text-center font-semibold text-gray-700 w-12">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 cursor-pointer"
                          title="전체선택"
                        />
                      </th>
                      <th className="p-3 text-center font-semibold text-gray-700 sticky left-12 bg-gray-50 z-10">
                        리비전
                      </th>
                      {allTracks.map((track) => (
                        <th key={track.id} className="p-3 text-center font-semibold text-gray-700 min-w-[100px]">
                          {track.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.revisions.map((revision) => (
                      <tr key={revision.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 text-center border-r border-gray-200 sticky left-0 bg-white z-10 w-12">
                          {/* 빈 셀 - 리비전 행에는 체크박스 없음 */}
                        </td>
                        <td className="p-3 text-left border-r border-gray-200 sticky left-12 bg-white z-10">
                          <div className="space-y-1">
                            <div className="font-bold text-primary text-lg">
                              Rev {revision.revNo}
                            </div>
                            <Badge className={`text-xs ${getStatusColor(revision.status)}`}>
                              {getStatusText(revision.status)}
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDateTime(revision.createdAt)}
                            </div>
                          </div>
                        </td>
                        {allTracks.map((track) => renderTrackCell(track, revision))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">로딩 중...</div>}>
      <HistoryPageContent />
    </Suspense>
  )
}