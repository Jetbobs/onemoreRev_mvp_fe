'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Download } from 'lucide-react'

interface ModalPin {
  id: string
  normalX: number
  normalY: number
  comment: string
  createdAt: string
}

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  trackId: string
  trackName: string
  imageUrl: string
  storedFilename: string
  originalFilename: string
  pins: ModalPin[]
  onAddPin: (trackId: string, x: number, y: number, comment: string) => void
  isReviewable: boolean
}

export function ImageModal({
  isOpen,
  onClose,
  trackId,
  trackName,
  imageUrl,
  storedFilename,
  originalFilename,
  pins,
  onAddPin,
  isReviewable
}: ImageModalProps) {
  const [newPin, setNewPin] = useState<{ x: number; y: number } | null>(null)
  const [comment, setComment] = useState('')
  const [activePinId, setActivePinId] = useState<string | null>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const trackPins = pins

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!isReviewable || newPin) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height

    setNewPin({ x, y })
  }

  const handleSubmitComment = () => {
    if (newPin && comment.trim()) {
      onAddPin(trackId, newPin.x, newPin.y, comment.trim())
      setNewPin(null)
      setComment('')
    }
  }

  const handleCancelPin = () => {
    setNewPin(null)
    setComment('')
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/files/${storedFilename}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = originalFilename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('다운로드 실패:', error)
      alert('파일 다운로드에 실패했습니다.')
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] p-6">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold">{trackName}</DialogTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            다운로드
          </Button>
        </DialogHeader>
        
        <div className="flex gap-6 h-full">
          {/* 이미지 영역 */}
          <div className="flex-1 relative">
            <div className="relative inline-block max-w-full">
              <img
                ref={imageRef}
                src={imageUrl}
                alt={originalFilename}
                className={`max-w-full h-auto ${isReviewable ? 'cursor-crosshair' : 'cursor-default'}`}
                onClick={handleImageClick}
                onError={(e) => {
                  console.error('모달 이미지 로딩 실패:', e.currentTarget.src);
                  console.error('imageUrl:', imageUrl);
                  console.error('storedFilename:', storedFilename);
                }}
                onLoad={() => {
                  console.log('모달 이미지 로딩 성공:', imageUrl);
                }}
                style={{
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
              
              {/* 기존 핀들 */}
              {trackPins.map((pin, index) => (
                <div key={pin.id}>
                  <button
                    className="absolute w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold transform -translate-x-1/2 -translate-y-1/2 hover:bg-red-600 hover:scale-110 transition-all z-10"
                    style={{
                      left: `${pin.normalX * 100}%`,
                      top: `${pin.normalY * 100}%`
                    }}
                    onClick={() => setActivePinId(activePinId === pin.id ? null : pin.id)}
                  >
                    {index + 1}
                  </button>
                  
                  {/* 말풍선 */}
                  {activePinId === pin.id && (
                    <div
                      className="absolute z-20 bg-white border border-gray-200 rounded-lg p-3 shadow-lg max-w-xs transform -translate-x-1/2"
                      style={{
                        left: `${pin.normalX * 100}%`,
                        top: `${pin.normalY * 100 + 5}%`
                      }}
                    >
                      <div className="text-sm text-gray-800 mb-2">{pin.comment}</div>
                      <div className="text-xs text-gray-500">{formatDateTime(pin.createdAt)}</div>
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-white"></div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* 새 핀 */}
              {newPin && (
                <div
                  className="absolute w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold transform -translate-x-1/2 -translate-y-1/2 animate-pulse z-10"
                  style={{
                    left: `${newPin.x * 100}%`,
                    top: `${newPin.y * 100}%`
                  }}
                >
                  {trackPins.length + 1}
                </div>
              )}
            </div>
            
            {/* 새 핀 코멘트 입력 */}
            {newPin && (
              <Card className="absolute bottom-4 right-4 w-80 z-30">
                <CardContent className="p-4">
                  <div className="mb-3">
                    <Badge variant="secondary" className="text-sm">
                      새 피드백 #{trackPins.length + 1}
                    </Badge>
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="피드백을 입력하세요..."
                    className="w-full p-2 border border-gray-300 rounded-md resize-none"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!comment.trim()}
                      size="sm"
                      className="flex-1"
                    >
                      완료
                    </Button>
                    <Button
                      onClick={handleCancelPin}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      취소
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* 피드백 목록 사이드바 */}
          <div className="w-80 border-l pl-6">
            <h3 className="font-semibold text-lg mb-4">
              피드백 목록 ({trackPins.length})
            </h3>
            
            {trackPins.length === 0 ? (
              <div className="text-gray-500 text-sm">
                {isReviewable ? '이미지를 클릭하여 피드백을 남겨보세요.' : '아직 피드백이 없습니다.'}
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {trackPins.map((pin, index) => (
                  <Card key={pin.id} className="p-3">
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800 mb-1">{pin.comment}</div>
                        <div className="text-xs text-gray-500">{formatDateTime(pin.createdAt)}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}