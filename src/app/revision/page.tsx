'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, ChevronLeft, ChevronRight, MessageSquare, Plus, Maximize2 } from 'lucide-react'
import { ImageModal } from '@/components/image-modal'
import { projectApi } from '@/lib/api'
import Link from 'next/link'
import Image from 'next/image'

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

interface RevisionPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

function RevisionPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
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
  
  const projectId = searchParams.get('projectId')
  const revNo = searchParams.get('revNo')
  const code = searchParams.get('code')

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
          x: feedback.normalX * 300, // 임시 크기, 실제로는 이미지 크기에 따라 계산
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
      setError(err?.status === 401 ? '로그인이 필요합니다.' : '리비전 정보를 불러오지 못했습니다.')
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

  // 모달 관련 함수들
  const openImageModal = (track: Track) => {
    if (!track.latestFile) return
    
    setModalImage({
      isOpen: true,
      trackId: track.id,
      trackName: track.name || track.title || `트랙 ${track.id}`,
      imageUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/files/${track.latestFile.storedFilename}`,
      storedFilename: track.latestFile.storedFilename,
      originalFilename: track.latestFile.originalFilename
    })
  }

  const closeImageModal = () => {
    setModalImage(prev => ({ ...prev, isOpen: false }))
  }

  const handleModalAddPin = (trackId: string, normalX: number, normalY: number, comment: string) => {
    const feedbackId = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newFeedback: Feedback = {
      id: feedbackId,
      trackId,
      normalX,
      normalY,
      content: comment,
      createdAt: new Date().toISOString()
    }
    
    setFeedbacks(prev => [...prev, newFeedback])
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

  const canAddTrack = () => {
    return !code && revision?.status === 'prepare'
  }

  // 파일 업로드 관련 함수들
  const handleFileSelect = (file: File, trackId: string) => {
    // 파일 미리보기를 위해 FileReader 사용
    const reader = new FileReader()
    reader.onload = (e) => {
      // 미리보기 이미지 업데이트 (실제 DOM 조작 대신 상태로 관리)
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

  const canEditTrack = () => {
    return !code && revision?.status === 'prepare'
  }

  const submitRevision = async () => {
    if (Object.keys(trackFiles).length === 0 || !revision) {
      alert('업로드할 파일을 선택해주세요.')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // 파일들을 base64로 변환
      const uploads = await Promise.all(
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
      )
      
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header skeleton */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>

          {/* Content skeleton */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-6">
                <Skeleton className="h-4 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-48 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
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
        <div className="max-w-7xl mx-auto p-6">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => router.back()}>뒤로가기</Button>
        </div>
      </div>
    )
  }

  if (!revision) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>리비전 정보를 찾을 수 없습니다.</AlertDescription>
          </Alert>
          <Button onClick={() => router.back()}>뒤로가기</Button>
        </div>
      </div>
    )
  }

  const projectTitle = revision?.project?.name || revision?.project?.title || revision?.projectName || '프로젝트'
  const revisionTitle = revision?.name || revision?.title || `Rev ${revNo}`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {code ? `${projectTitle} (게스트)` : projectTitle}
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-gray-600">{revisionTitle}</p>
              <Badge className={`text-white ${getStatusColor(revision.status)}`}>
                {getStatusText(revision.status)}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link href="/projects">
              <Button variant="outline">내 프로젝트</Button>
            </Link>
            {projectId && (
              <Link href={`/history?projectId=${projectId}`}>
                <Button variant="outline">히스토리</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Guest link for owners */}
        {!code && (revision?.invitationCode || revision?.project?.invitationCode) && (
          <div className="mb-4">
            <Link 
              href={`/revision?projectId=${projectId}&revNo=${revNo}&code=${revision.invitationCode || revision.project?.invitationCode}`}
              target="_blank"
              className="text-primary hover:underline text-sm"
            >
              게스트 페이지 열기 →
            </Link>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => {
              const prevRevNo = parseInt(revNo!) - 1
              if (prevRevNo >= 1) {
                let url = `/revision?projectId=${projectId}&revNo=${prevRevNo}`
                if (code) url += `&code=${code}`
                router.push(url)
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
              let url = `/revision?projectId=${projectId}&revNo=${nextRevNo}`
              if (code) url += `&code=${code}`
              router.push(url)
            }}
            disabled={revision.isLast}
          >
            다음 리비전
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Content with sidebar layout */}
        <div className="flex gap-6">
          {/* Main content */}
          <Card className="flex-1">
            <CardContent className="p-6">
            {/* Tracks */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">트랙 파일들</h3>
              
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
                                  // 새로 선택된 파일 미리보기
                                  <img
                                    src={URL.createObjectURL(trackFiles[track.id])}
                                    alt={trackFiles[track.id].name}
                                    className="w-full h-48 object-contain"
                                    style={{ cursor: canEditTrack() ? 'pointer' : isReviewable() ? 'crosshair' : 'default' }}
                                  />
                                ) : (
                                  // 기존 파일
                                  <Image
                                    src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/files/${track.latestFile?.storedFilename}`}
                                    alt={track.latestFile?.originalFilename || ''}
                                    width={300}
                                    height={200}
                                    className="w-full h-48 object-contain"
                                    style={{ cursor: canEditTrack() ? 'pointer' : isReviewable() ? 'crosshair' : 'default' }}
                                    onClick={(e) => {
                                      if (!canEditTrack() && isReviewable()) {
                                        e.stopPropagation()
                                        handleImageClick(e, track.id)
                                      }
                                    }}
                                  />
                                )}
                                
                                {/* 기존 피드백 핀들 */}
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

              {/* 트랙 추가 버튼 (소유자 모드이고 prepare 상태일 때만) */}
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

            {/* Description */}
            {revision.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">리비전 설명</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{revision.description}</p>
              </div>
            )}

            {/* 제출 버튼 (prepare 상태일 때만) */}
            {canEditTrack() && Object.keys(trackFiles).length > 0 && (
              <div className="mt-6 text-center">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={submitRevision}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '제출 중...' : '리비전 제출'}
                </Button>
              </div>
            )}

            {/* Action buttons */}
            {isReviewable() && (
              <div className="mt-6 text-center">
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
                      // 게스트 모드에서 나가서 일반 리비전 페이지로 이동 (code 파라미터 제거)
                      window.location.href = `/revision?projectId=${projectId}&revNo=${revNo}`
                      
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

            {!code && revision.status === 'reviewed' && revision.isLast && (
              <div className="mt-6 text-center">
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
                      
                      // 새로 생성된 리비전 페이지로 이동
                      const newRevNo = result.revision?.revNo || (revision.revNo + 1)
                      window.location.href = `/revision?projectId=${projectId}&revNo=${newRevNo}`
                      
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
                          {feedback.reply && (
                            <div className="mt-1 p-1 bg-blue-50 rounded text-blue-800">
                              <strong>답글:</strong> {feedback.reply}
                            </div>
                          )}
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
      </div>
    </div>
  )
}

export default function RevisionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">로딩 중...</div>}>
      <RevisionPageContent />
    </Suspense>
  )
}