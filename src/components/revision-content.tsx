'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, ChevronLeft, ChevronRight, MessageSquare, Plus, Maximize2 } from 'lucide-react'
import { ImageModal } from '@/components/image-modal'

interface Track {
  id: string
  name?: string
  title?: string
  latestFile?: {
    storedFilename: string
    originalFilename: string
    uploadedAt: string
  }
}

interface Feedback {
  id: string
  trackId: string
  normalX: number
  normalY: number
  content: string
  reply?: string
  createdAt: string
}

interface Pin {
  id: string
  trackId: string
  x: number
  y: number
  normalX: number
  normalY: number
  isNew?: boolean
}

interface Revision {
  id: string
  revNo: number
  name?: string
  title?: string
  description?: string
  status: 'prepare' | 'submitted' | 'reviewed'
  tracks?: Track[]
  feedbacks?: Feedback[]
  project?: {
    name?: string
    title?: string
    invitationCode?: string
  }
  projectName?: string
  invitationCode?: string
  isLast?: boolean
}

interface RevisionContentProps {
  projectId: string
  revNo?: string
  code?: string
  showNavigation?: boolean
  showHeader?: boolean
  className?: string
  onRevisionChange?: (revNo: number) => void
}

export function RevisionContent({
  projectId,
  revNo = '1',
  code,
  showNavigation = false,
  showHeader = false,
  className = '',
  onRevisionChange
}: RevisionContentProps) {
  const router = useRouter()

  const [revision, setRevision] = useState<Revision | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 피드백 시스템 상태
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [pins, setPins] = useState<Pin[]>([])
  const [activeBubble, setActiveBubble] = useState<string | null>(null)
  const [bubbleContent, setBubbleContent] = useState('')
  const [bubblePosition, setBubblePosition] = useState({ x: 0, y: 0, trackId: '', pinId: '' })
  const [hoveredFeedback, setHoveredFeedback] = useState<string | null>(null)

  // 트랙 추가 관련 상태
  const [isAddingTrack, setIsAddingTrack] = useState(false)
  const [newTrackName, setNewTrackName] = useState('')

  // 파일 업로드 관련 상태
  const [trackFiles, setTrackFiles] = useState<{ [key: string]: File }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 이미지 확대 모달 상태
  const [modalImage, setModalImage] = useState<{
    isOpen: boolean
    trackId: string
    trackName: string
    imageUrl: string
    storedFilename: string
    originalFilename: string
  }>({
    isOpen: false,
    trackId: '',
    trackName: '',
    imageUrl: '',
    storedFilename: '',
    originalFilename: ''
  })

  useEffect(() => {
    loadRevision()
  }, [projectId, revNo, code])

  // 기존 피드백들을 핀으로 변환
  useEffect(() => {
    if (feedbacks.length > 0 && revision?.tracks) {
      const existingPins = feedbacks.map((feedback) => {
        const track = revision.tracks?.find(t => t.id === feedback.trackId)
        if (!track) return null

        return {
          id: `feedback-pin-${feedback.id}`,
          trackId: feedback.trackId,
          x: feedback.normalX * 300,
          y: feedback.normalY * 200,
          normalX: feedback.normalX,
          normalY: feedback.normalY,
          isNew: false
        }
      }).filter(Boolean) as Pin[]

      setPins(prev => [...prev.filter(p => p.isNew), ...existingPins])
    }
  }, [feedbacks, revision])

  async function loadRevision() {
    if (!projectId || !revNo) {
      setError('projectId와 revNo 파라미터가 필요합니다.')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      let apiUrl = `/api/v1/revision/info?projectId=${encodeURIComponent(projectId)}&revNo=${encodeURIComponent(revNo)}`
      if (code) {
        apiUrl += `&code=${encodeURIComponent(code)}`
      }

      const data = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${apiUrl}`, {
        credentials: 'include'
      }).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })

      console.log('[revision] info response:', data)

      const revisionData = data?.revision || data
      setRevision(revisionData)

      // 피드백 데이터 로드
      if (revisionData?.feedbacks) {
        setFeedbacks(revisionData.feedbacks)
      }

    } catch (err: any) {
      console.error('[revision] info error:', err)

      // API 실패 시 샘플 데이터 사용
      console.log('API 호출 실패, 샘플 데이터 사용')

      const sampleRevision: Revision = {
        id: `sample-${projectId}-${revNo}`,
        revNo: parseInt(revNo),
        name: `Sample Revision ${revNo}`,
        description: `프로젝트 ${projectId}의 ${revNo}번째 리비전입니다.`,
        status: revNo === '5' ? 'reviewed' : 'prepare',
        tracks: [
          {
            id: 'track1',
            name: '메인 이미지',
            latestFile: {
              storedFilename: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Main+Design',
              originalFilename: 'main-design.png',
              uploadedAt: new Date().toISOString()
            }
          },
          {
            id: 'track2',
            name: '서브 이미지',
            latestFile: {
              storedFilename: 'https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Sub+Design',
              originalFilename: 'sub-design.png',
              uploadedAt: new Date().toISOString()
            }
          }
        ],
        feedbacks: [],
        projectName: `샘플 프로젝트 ${projectId}`,
        invitationCode: code || 'sample-code'
      }

      setRevision(sampleRevision)
      setFeedbacks([])
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
      case 'prepare': return 'bg-yellow-500 hover:bg-yellow-600'
      case 'submitted': return 'bg-blue-500 hover:bg-blue-600'
      case 'reviewed': return 'bg-green-500 hover:bg-green-600'
      default: return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  const isReviewable = () => {
    return !!code && revision?.status === 'submitted'
  }

  const canEditTrack = () => {
    return !code && (revision?.status === 'prepare' || revision?.status === 'reviewed')
  }

  const canAddTrack = () => {
    return !code && (revision?.status === 'prepare' || revision?.status === 'reviewed')
  }

  // 모달 관련 함수들
  const openImageModal = (track: Track) => {
    if (!track.latestFile) return

    setModalImage({
      isOpen: true,
      trackId: track.id,
      trackName: track.name || track.title || `트랙 ${track.id}`,
      imageUrl: track.latestFile.storedFilename.startsWith('http') ? track.latestFile.storedFilename : `${process.env.NEXT_PUBLIC_API_BASE_URL}/files/${track.latestFile.storedFilename}`,
      storedFilename: track.latestFile.storedFilename,
      originalFilename: track.latestFile.originalFilename
    })
  }

  const closeImageModal = () => {
    setModalImage(prev => ({ ...prev, isOpen: false }))
  }

  const handleModalAddPin = async (trackId: string, normalX: number, normalY: number, comment: string) => {
    if (!revision) return

    try {
      const feedbackData = {
        code: code,
        projectId: parseInt(projectId!),
        revisionId: revision.id,
        trackId: parseInt(trackId),
        normalX,
        normalY,
        content: comment
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData),
        credentials: 'include'
      })

      if (!response.ok) throw new Error('피드백 저장 실패')

      const result = await response.json()

      // 새 피드백을 목록에 추가
      const newFeedback: Feedback = {
        id: result.id || Date.now().toString(),
        trackId,
        normalX,
        normalY,
        content: comment,
        createdAt: new Date().toISOString()
      }

      setFeedbacks(prev => [...prev, newFeedback])

      console.log('모달에서 피드백 저장 성공:', newFeedback)

    } catch (error) {
      console.error('모달 피드백 저장 실패:', error)
      alert('피드백 저장에 실패했습니다.')
    }
  }

  // 피드백 관련 함수들
  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>, trackId: string) => {
    if (!isReviewable()) return

    const img = event.currentTarget
    const rect = img.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // 정규화된 좌표 계산
    const normalX = x / rect.width
    const normalY = y / rect.height

    const pinId = `pin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 새 핀 생성
    const newPin: Pin = {
      id: pinId,
      trackId,
      x,
      y,
      normalX,
      normalY,
      isNew: true
    }

    // 기존 새 핀들 제거하고 새 핀 추가
    setPins(prev => [...prev.filter(p => !p.isNew), newPin])

    // 말풍선 표시
    setActiveBubble(pinId)
    setBubbleContent('')
    setBubblePosition({
      x: event.clientX,
      y: event.clientY,
      trackId,
      pinId
    })
  }

  const handlePinClick = (pin: Pin) => {
    const existingFeedback = feedbacks.find(f =>
      f.trackId === pin.trackId &&
      Math.abs(f.normalX - pin.normalX) < 0.01 &&
      Math.abs(f.normalY - pin.normalY) < 0.01
    )

    if (existingFeedback) {
      // 기존 피드백이 있으면 내용 표시 (읽기 전용)
      setBubbleContent(existingFeedback.content)
      setActiveBubble(pin.id)
      setBubblePosition({
        x: pin.x,
        y: pin.y,
        trackId: pin.trackId,
        pinId: pin.id
      })
    }
  }

  const saveFeedback = async () => {
    if (!bubbleContent.trim() || !revision) return

    try {
      const currentPin = pins.find(p => p.id === bubblePosition.pinId)
      if (!currentPin) return

      const feedbackData = {
        code: code,
        projectId: parseInt(projectId!),
        revisionId: revision.id,
        trackId: parseInt(currentPin.trackId),
        normalX: currentPin.normalX,
        normalY: currentPin.normalY,
        content: bubbleContent.trim()
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData),
        credentials: 'include'
      })

      if (!response.ok) throw new Error('피드백 저장 실패')

      const result = await response.json()

      // 새 피드백을 목록에 추가
      const newFeedback: Feedback = {
        id: result.id || Date.now().toString(),
        trackId: currentPin.trackId,
        normalX: currentPin.normalX,
        normalY: currentPin.normalY,
        content: bubbleContent,
        createdAt: new Date().toISOString()
      }

      setFeedbacks(prev => [...prev, newFeedback])

      // 핀을 완료된 상태로 변경
      setPins(prev => prev.map(p =>
        p.id === currentPin.id
          ? { ...p, isNew: false }
          : p
      ))

      // 말풍선 닫기
      setActiveBubble(null)
      setBubbleContent('')

    } catch (error) {
      console.error('피드백 저장 오류:', error)
      alert('피드백 저장에 실패했습니다.')
    }
  }

  const closeBubble = () => {
    if (activeBubble) {
      // 새 핀이면 제거
      const currentPin = pins.find(p => p.id === activeBubble)
      if (currentPin?.isNew) {
        setPins(prev => prev.filter(p => p.id !== activeBubble))
      }
    }

    setActiveBubble(null)
    setBubbleContent('')
  }

  // 파일 업로드 관련 함수들
  const handleFileSelect = (file: File, trackId: string) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setTrackFiles(prev => ({
        ...prev,
        [trackId]: file
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleTrackImageClick = (trackId: string) => {
    if (!canEditTrack()) return

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (target.files && target.files.length > 0) {
        handleFileSelect(target.files[0], trackId)
      }
    }
    input.click()
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!canEditTrack()) return
    e.preventDefault()
    e.currentTarget.classList.add('border-primary', 'border-2')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-primary', 'border-2')
  }

  const handleDrop = (e: React.DragEvent, trackId: string) => {
    if (!canEditTrack()) return
    e.preventDefault()
    e.currentTarget.classList.remove('border-primary', 'border-2')

    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleFileSelect(files[0], trackId)
    }
  }

  const submitRevision = async () => {
    if (!revision) {
      alert('리비전 정보를 찾을 수 없습니다.')
      return
    }

    // 새로 업로드된 파일이 없고 기존 트랙도 없으면 제출 불가
    if (Object.keys(trackFiles).length === 0 && (!revision.tracks || revision.tracks.length === 0)) {
      alert('제출할 트랙 파일이 없습니다. 파일을 업로드해주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      // 새로 업로드된 파일들만 변환 (기존 파일은 그대로 두기)
      const uploads = Object.keys(trackFiles).length > 0 ? await Promise.all(
        Object.entries(trackFiles).map(async ([trackId, file]) => {
          const base64 = await fileToBase64(file)
          return {
            trackId: parseInt(trackId),
            file: {
              original_filename: file.name,
              size: file.size,
              modified_datetime: new Date(file.lastModified).toISOString(),
              data: base64
            }
          }
        })
      ) : []

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/revision/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          revisionId: revision.id,
          description: revision.description || '',
          uploads: uploads
        }),
        credentials: 'include'
      })

      if (!response.ok) throw new Error('리비전 제출 실패')

      const result = await response.json()
      console.log('[revision] submit success:', result)

      alert('리비전이 성공적으로 제출되었습니다!')

      // 페이지 새로고침
      setTimeout(() => {
        window.location.reload()
      }, 1500)

    } catch (error) {
      console.error('[revision] submit error:', error)
      alert('리비전 제출에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64 = reader.result?.toString().split(',')[1] || ''
        resolve(base64)
      }
      reader.onerror = error => reject(error)
    })
  }

  // 트랙 추가 관련 함수들
  const handleAddTrack = async () => {
    if (!newTrackName.trim() || !projectId) return

    try {
      setIsAddingTrack(true)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/track/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: parseInt(projectId),
          name: newTrackName.trim()
        }),
        credentials: 'include'
      })

      if (!response.ok) throw new Error('트랙 추가 실패')

      const result = await response.json()

      if (result.success) {
        // 페이지 리로딩
        window.location.reload()
      } else {
        throw new Error(result.message || '트랙 추가 실패')
      }

    } catch (error: any) {
      console.error('트랙 추가 오류:', error)
      alert(`트랙 추가에 실패했습니다: ${error.message}`)
    } finally {
      setIsAddingTrack(false)
      setNewTrackName('')
    }
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!revision) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>리비전 정보를 찾을 수 없습니다.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 리비전 헤더 */}
      {showHeader && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              Rev {revision.revNo}
              {code && (
                <span className="ml-2 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  게스트 모드
                </span>
              )}
            </h2>
            <Badge className={`text-white ${getStatusColor(revision.status)}`}>
              {getStatusText(revision.status)}
            </Badge>
          </div>
        </div>
      )}

      {/* 리비전 네비게이션 */}
      {showNavigation && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              const prevRevNo = parseInt(revNo!) - 1
              if (prevRevNo >= 1 && onRevisionChange) {
                onRevisionChange(prevRevNo)
              }
            }}
            disabled={parseInt(revNo!) <= 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            이전 리비전
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              const nextRevNo = parseInt(revNo!) + 1
              if (!revision?.isLast && onRevisionChange) {
                onRevisionChange(nextRevNo)
              }
            }}
            disabled={revision?.isLast}
          >
            다음 리비전
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div className="flex gap-6">
        {/* 트랙 목록 */}
        <Card className="flex-1">
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  트랙 파일들
                  {code && (
                    <span className="ml-2 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      (게스트)
                    </span>
                  )}
                </h3>
                {code && revision?.status === 'submitted' && (
                  <div className="text-sm text-gray-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                    💡 이미지를 클릭하여 피드백을 남겨보세요
                  </div>
                )}
              </div>

              {!revision.tracks || revision.tracks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">트랙이 없습니다.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {revision.tracks.map((track) => {
                    const trackPins = pins.filter(p => p.trackId === track.id)
                    const trackFeedbacks = feedbacks.filter(f => f.trackId === track.id)

                    return (
                      <Card key={track.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-3 text-center">
                            {track.name || track.title || '트랙'}
                          </h4>

                          {track.latestFile || trackFiles[track.id] ? (
                            <div className="space-y-2">
                              <div
                                className={`relative bg-gray-100 rounded-lg overflow-hidden ${
                                  canEditTrack() ? 'cursor-pointer hover:opacity-80' : ''
                                }`}
                                onClick={() => canEditTrack() && handleTrackImageClick(track.id)}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, track.id)}
                              >
                                {trackFiles[track.id] ? (
                                  <img
                                    src={URL.createObjectURL(trackFiles[track.id])}
                                    alt={trackFiles[track.id].name}
                                    className="w-full h-48 object-contain"
                                    style={{ cursor: canEditTrack() ? 'pointer' : isReviewable() ? 'crosshair' : 'default' }}
                                  />
                                ) : (
                                  <img
                                    src={track.latestFile?.storedFilename?.startsWith('http') ? track.latestFile.storedFilename : `${process.env.NEXT_PUBLIC_API_BASE_URL}/files/${track.latestFile?.storedFilename}`}
                                    alt={track.latestFile?.originalFilename || ''}
                                    className="w-full h-48 object-contain"
                                    style={{ cursor: canEditTrack() ? 'pointer' : isReviewable() ? 'crosshair' : 'default' }}
                                    onError={(e) => {
                                      console.error('이미지 로딩 실패:', e.currentTarget.src);
                                      console.error('storedFilename:', track.latestFile?.storedFilename);
                                      console.error('NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
                                    }}
                                    onLoad={() => {
                                      console.log('이미지 로딩 성공:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/files/${track.latestFile?.storedFilename}`);
                                    }}
                                    onClick={(e) => {
                                      if (!canEditTrack() && isReviewable()) {
                                        e.stopPropagation()
                                        handleImageClick(e, track.id)
                                      }
                                    }}
                                  />
                                )}

                                {/* 피드백 핀들 */}
                                {trackFeedbacks.map((feedback) => (
                                  <div
                                    key={`feedback-${feedback.id}`}
                                    className={`absolute w-2 h-2 bg-green-500 border border-white rounded-full cursor-pointer ${
                                      hoveredFeedback === feedback.id ? 'scale-150 shadow-lg' : ''
                                    }`}
                                    style={{
                                      left: `${feedback.normalX * 100}%`,
                                      top: `${feedback.normalY * 100}%`,
                                      transform: 'translate(-50%, -50%)'
                                    }}
                                    onMouseEnter={() => setHoveredFeedback(feedback.id)}
                                    onMouseLeave={() => setHoveredFeedback(null)}
                                  />
                                ))}

                                {/* 새로운/임시 핀들 */}
                                {trackPins.map((pin) => (
                                  <div
                                    key={pin.id}
                                    className={`absolute w-2 h-2 border border-white rounded-full cursor-pointer ${
                                      pin.isNew ? 'bg-red-500 animate-pulse' : 'bg-green-500'
                                    }`}
                                    style={{
                                      left: `${pin.normalX * 100}%`,
                                      top: `${pin.normalY * 100}%`,
                                      transform: 'translate(-50%, -50%)'
                                    }}
                                    onClick={() => handlePinClick(pin)}
                                  />
                                ))}

                                {/* 확대 버튼 */}
                                {track.latestFile && (
                                  <button
                                    className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-all hover:scale-110 z-10"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openImageModal(track)
                                    }}
                                    title="이미지 확대"
                                  >
                                    <Maximize2 className="h-4 w-4 text-gray-600" />
                                  </button>
                                )}
                              </div>

                              <div className="text-sm text-gray-600 space-y-1">
                                {trackFiles[track.id] ? (
                                  <>
                                    <p className="font-medium text-blue-600">{trackFiles[track.id].name}</p>
                                    <p className="text-green-600">(새 파일)</p>
                                    {canEditTrack() && (
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setTrackFiles(prev => {
                                            const newFiles = { ...prev }
                                            delete newFiles[track.id]
                                            return newFiles
                                          })
                                        }}
                                      >
                                        취소
                                      </Button>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <p className="font-medium">{track.latestFile?.originalFilename}</p>
                                    <p>업로드: {track.latestFile && new Date(track.latestFile.uploadedAt).toLocaleDateString()}</p>
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                              <p className="text-gray-500">파일 없음</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              {/* 트랙 추가 버튼 */}
              {canAddTrack() && (
                <div className="text-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const trackName = prompt('새 트랙의 이름을 입력하세요:')
                      if (trackName && trackName.trim()) {
                        setNewTrackName(trackName.trim())
                        handleAddTrack()
                      }
                    }}
                    disabled={isAddingTrack}
                    className="border-dashed border-2 border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isAddingTrack ? '트랙 추가 중...' : '트랙 추가'}
                  </Button>
                </div>
              )}
            </div>

            {/* 리비전 설명 */}
            {revision.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">리비전 설명</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{revision.description}</p>
              </div>
            )}

            {/* 디버그 정보 */}
            {process.env.NODE_ENV === 'development' && (
              <div className="p-4 bg-gray-100 rounded-lg text-xs text-gray-600 mb-4">
                <p><strong>디버그 정보:</strong></p>
                <p>code: {code || 'null'}</p>
                <p>revision.status: {revision?.status || 'null'}</p>
                <p>canEditTrack(): {canEditTrack().toString()}</p>
                <p>trackFiles 개수: {Object.keys(trackFiles).length}</p>
                <p>revision.tracks 개수: {revision?.tracks?.length || 0}</p>
                <p>isReviewable(): {isReviewable().toString()}</p>
              </div>
            )}

            {/* 액션 버튼들 */}
            {canEditTrack() && (
              <div className="text-center">
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={submitRevision}
                  disabled={isSubmitting || (Object.keys(trackFiles).length === 0 && (!revision?.tracks || revision.tracks.length === 0))}
                >
                  {isSubmitting ? '제출 중...' : '리비전 제출'}
                </Button>
                {Object.keys(trackFiles).length === 0 && (!revision?.tracks || revision.tracks.length === 0) && (
                  <p className="text-sm text-gray-500 mt-2">
                    트랙 파일을 업로드하거나 기존 파일이 있어야 제출할 수 있습니다.
                  </p>
                )}
              </div>
            )}

            {/* canEditTrack()이 false인 경우 설명 */}
            {!canEditTrack() && (
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  {code ? '게스트 모드에서는 제출할 수 없습니다.' :
                   revision?.status === 'submitted' ? '이미 제출된 리비전입니다.' :
                   revision?.status === 'reviewed' ? '이미 검토 완료된 리비전입니다.' :
                   '현재 상태에서는 제출할 수 없습니다.'}
                </p>
              </div>
            )}

            {isReviewable() && (
              <div className="text-center">
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={async () => {
                    if (!revision) {
                      alert('리비전 정보를 불러오지 못했습니다.')
                      return
                    }

                    try {
                      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/revision/review/done`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          revisionId: revision.id,
                          code: code
                        }),
                        credentials: 'include'
                      })

                      if (!response.ok) throw new Error('피드백 완료 처리 실패')

                      const result = await response.json()
                      console.log('피드백 완료 API 응답:', result)

                      alert('디자이너에게 내용을 전달하였습니다')
                      // 게스트 모드에서 나가서 일반 프로젝트 상세 페이지로 이동 (code 파라미터 제거)
                      window.location.href = `/projects/${projectId}`

                    } catch (error) {
                      console.error('피드백 완료 처리 실패:', error)
                      alert('피드백 완료 처리에 실패했습니다. 다시 시도해주세요.')
                    }
                  }}
                >
                  모든 피드백 작성 완료
                </Button>
              </div>
            )}

            {!code && revision?.status === 'reviewed' && revision.isLast && (
              <div className="text-center">
                <Button
                  onClick={async () => {
                    if (!revision) {
                      alert('리비전 정보를 불러오지 못했습니다.')
                      return
                    }

                    try {
                      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/revision/new`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          projectId: parseInt(projectId || '0')
                        }),
                        credentials: 'include'
                      })

                      if (!response.ok) throw new Error('다음 리비전 생성 실패')

                      const result = await response.json()
                      console.log('다음 리비전 생성 API 응답:', result)

                      alert('다음 리비전이 생성되었습니다')

                      // 새로 생성된 리비전으로 이동
                      const newRevNo = result.revision?.revNo || (revision.revNo + 1)
                      if (onRevisionChange) {
                        onRevisionChange(newRevNo)
                      }

                    } catch (error) {
                      console.error('다음 리비전 생성 실패:', error)
                      alert('다음 리비전 생성에 실패했습니다. 다시 시도해주세요.')
                    }
                  }}
                >
                  다음 리비전 생성
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 피드백 사이드바 */}
        <Card className="w-64 h-fit">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4" />
              <h3 className="font-semibold">피드백 목록</h3>
            </div>

            {feedbacks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                아직 피드백이 없습니다.
              </p>
            ) : (
              <div className="space-y-2">
                {feedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className={`p-2 text-xs border rounded cursor-pointer transition-colors ${
                      hoveredFeedback === feedback.id
                        ? 'bg-yellow-100 border-yellow-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onMouseEnter={() => setHoveredFeedback(feedback.id)}
                    onMouseLeave={() => setHoveredFeedback(null)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 break-words">{feedback.content}</p>
                        <p className="text-gray-500 mt-1">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 이미지 확대 모달 */}
      <ImageModal
        isOpen={modalImage.isOpen}
        onClose={closeImageModal}
        trackId={modalImage.trackId}
        trackName={modalImage.trackName}
        imageUrl={modalImage.imageUrl}
        storedFilename={modalImage.storedFilename}
        originalFilename={modalImage.originalFilename}
        pins={feedbacks.filter(f => f.trackId === modalImage.trackId).map(f => ({
          id: f.id,
          normalX: f.normalX,
          normalY: f.normalY,
          comment: f.content,
          createdAt: f.createdAt
        }))}
        onAddPin={handleModalAddPin}
        isReviewable={isReviewable()}
      />

      {/* 말풍선 */}
      {activeBubble && (
        <div
          className="fixed bg-white border border-gray-300 rounded-lg p-3 shadow-lg z-50 min-w-[200px] max-w-[300px]"
          style={{
            left: Math.min(bubblePosition.x + 20, window.innerWidth - 320),
            top: Math.max(bubblePosition.y - 10, 10)
          }}
        >
          <div className="space-y-2">
            <Textarea
              value={bubbleContent}
              onChange={(e) => setBubbleContent(e.target.value)}
              placeholder="피드백을 입력하세요..."
              className="min-h-[60px] text-sm resize-none"
              maxLength={1000}
              disabled={!pins.find(p => p.id === activeBubble)?.isNew}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={closeBubble}
              >
                취소
              </Button>
              {pins.find(p => p.id === activeBubble)?.isNew && (
                <Button
                  size="sm"
                  onClick={saveFeedback}
                  disabled={!bubbleContent.trim()}
                >
                  저장
                </Button>
              )}
            </div>
          </div>

          {/* 화살표 */}
          <div
            className="absolute w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white"
            style={{
              left: '20px',
              top: '100%'
            }}
          />
          <div
            className="absolute w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-300"
            style={{
              left: '20px',
              top: '101%'
            }}
          />
        </div>
      )}
    </div>
  )
}