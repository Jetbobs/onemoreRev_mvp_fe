import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, Upload, Download, Trash2, Eye, Grid, List, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Maximize2, Info } from 'lucide-react';

export default function MultiFileViewer() {
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid'); // grid, list, gallery
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, []);

  // 파일 처리
  const processFiles = (fileList: File[]) => {
    const imageFiles = fileList.filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );

    const newFiles = imageFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString()
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  // 파일 선택 토글
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map(f => f.id)));
    }
  };

  // 선택된 파일 삭제
  const deleteSelected = () => {
    setFiles(prev => prev.filter(f => !selectedFiles.has(f.id)));
    setSelectedFiles(new Set());
  };

  // 파일 크기 포맷
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 줌 조절
  const adjustZoom = (delta: number) => {
    setZoomLevel(prev => Math.max(50, Math.min(200, prev + delta)));
  };

  // 라이트박스 열기
  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setImageZoom(1); // 먼저 줌 리셋
    setLightboxOpen(true);
  };

  // 이전/다음 이미지
  const navigateImage = (direction: string) => {
    setImageZoom(1); // 먼저 줌 리셋
    if (direction === 'prev') {
      setCurrentImageIndex(prev => (prev - 1 + files.length) % files.length);
    } else {
      setCurrentImageIndex(prev => (prev + 1) % files.length);
    }
  };

  // 이미지 줌 (클릭용 - 단계별 줌)
  const toggleImageZoom = () => {
    setImageZoom(prev => {
      if (prev < 1.5) return 2;
      if (prev < 2.5) return 3;
      return 1;
    });
  };

  // 키보드 및 마우스 휠 이벤트
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      if (e.key === 'ArrowLeft') navigateImage('prev');
      if (e.key === 'ArrowRight') navigateImage('next');
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === ' ') {
        e.preventDefault();
        toggleImageZoom();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (!lightboxOpen) return;
      
      e.preventDefault();
      
      // deltaY가 음수면 위로 스크롤 (줌인), 양수면 아래로 스크롤 (줌아웃)
      if (e.deltaY < 0) {
        // 줌인: 0.1배씩 부드럽게 증가
        setImageZoom(prev => {
          const newZoom = Math.min(prev + 0.1, 3);
          return newZoom;
        });
      } else {
        // 줌아웃: 원본 크기(100%) 이하로는 줄어들지 않음
        setImageZoom(prev => {
          const newZoom = Math.max(prev - 0.1, 1);
          return newZoom;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [lightboxOpen]);

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* 헤더 툴바 */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">시안 관리</h2>
          <Badge variant="secondary">
            {files.length}개 파일
          </Badge>
          {selectedFiles.size > 0 && (
            <Badge variant="default">
              {selectedFiles.size}개 선택됨
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 뷰 모드 전환 */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'gallery' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('gallery')}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* 줌 컨트롤 */}
          {viewMode === 'grid' && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustZoom(-10)}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600 w-12 text-center">
                {zoomLevel}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustZoom(10)}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* 액션 버튼 */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSelectAll}
            disabled={files.length === 0}
          >
            {selectedFiles.size === files.length ? '전체 해제' : '전체 선택'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            파일 추가
          </Button>

          {selectedFiles.size > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => console.log('Download selected files')}
              >
                <Download className="h-4 w-4 mr-2" />
                다운로드
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteSelected}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 overflow-hidden">
        {files.length === 0 ? (
          /* 드롭존 (파일이 없을 때) */
          <div
            className={`h-full flex items-center justify-center p-8 ${
              isDragging ? 'bg-blue-50' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className={`border-2 border-dashed rounded-lg p-16 text-center transition-colors ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}>
              <Upload className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">
                시안 파일을 드래그 앤 드롭하세요
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                또는 클릭하여 파일을 선택하세요
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                파일 선택
              </Button>
              <p className="text-xs text-gray-400 mt-4">
                지원 형식: JPG, PNG, GIF, WebP, PDF
              </p>
            </div>
          </div>
        ) : (
          /* 파일 목록 */
          <ScrollArea 
            className="h-full"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {viewMode === 'grid' && (
              <div 
                className="grid gap-4 p-4"
                style={{
                  gridTemplateColumns: `repeat(auto-fill, minmax(${200 * (zoomLevel / 100)}px, 1fr))`
                }}
              >
                {files.map((file, index) => (
                  <Card 
                    key={file.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedFiles.has(file.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <CardContent className="p-2">
                      <div className="relative group">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-auto rounded cursor-pointer"
                          style={{
                            height: `${150 * (zoomLevel / 100)}px`,
                            objectFit: 'cover'
                          }}
                          onClick={() => toggleFileSelection(file.id)}
                        />
                        <Checkbox
                          checked={selectedFiles.has(file.id)}
                          className="absolute top-2 left-2 bg-white border-gray-400 rounded-full"
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={() => toggleFileSelection(file.id)}
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => openLightbox(index)}
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2 px-1">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="p-4 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={file.id}
                    className={`flex items-center gap-4 p-3 bg-white rounded-lg border hover:shadow-md transition-all ${
                      selectedFiles.has(file.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <Checkbox
                      checked={selectedFiles.has(file.id)}
                      className="border-gray-400 rounded-full"
                      onClick={(e) => e.stopPropagation()}
                      onCheckedChange={() => toggleFileSelection(file.id)}
                    />
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80"
                      onClick={() => openLightbox(index)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openLightbox(index)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'gallery' && (
              <div className="p-4">
                <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
                  {files.map((file, index) => (
                    <div
                      key={file.id}
                      className={`relative mb-4 break-inside-avoid group ${
                        selectedFiles.has(file.id) ? 'ring-2 ring-blue-500 rounded' : ''
                      }`}
                    >
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full rounded hover:opacity-95 transition-opacity cursor-pointer"
                        onClick={() => toggleFileSelection(file.id)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded pointer-events-none">
                        <Checkbox
                          checked={selectedFiles.has(file.id)}
                          className="absolute top-2 left-2 bg-white border-gray-400 rounded-full pointer-events-auto"
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={() => toggleFileSelection(file.id)}
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            openLightbox(index);
                          }}
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-b pointer-events-none">
                        <p className="text-sm truncate">{file.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 드래그 오버레이 */}
            {isDragging && files.length > 0 && (
              <div className="fixed inset-0 bg-blue-500 bg-opacity-10 flex items-center justify-center z-50 pointer-events-none">
                <div className="bg-white p-8 rounded-lg shadow-xl">
                  <Upload className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                  <p className="text-lg font-medium">파일을 여기에 놓으세요</p>
                </div>
              </div>
            )}
          </ScrollArea>
        )}
      </div>

      {/* 라이트박스 모달 */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[98vw] max-h-[98vh] py-20 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* 닫기 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-4 text-white z-50"
              onClick={() => setLightboxOpen(false)}
            >
              <X style={{ width: '28px', height: '28px' }} />
            </Button>

            {/* 이미지 정보 */}
            <div className="absolute -top-16 left-4 text-white z-50">
              <h3 className="text-lg font-semibold mb-1">
                {files[currentImageIndex]?.name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <span>{currentImageIndex + 1} / {files.length}</span>
                <span>{formatFileSize(files[currentImageIndex]?.size || 0)}</span>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {Math.round(imageZoom * 100)}%
                </Badge>
              </div>
            </div>

            {/* 이전 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 text-white z-50"
              onClick={() => navigateImage('prev')}
              disabled={files.length <= 1}
            >
              <ChevronLeft style={{ width: '32px', height: '32px' }} />
            </Button>

            {/* 메인 이미지 */}
            <div 
              className="relative flex items-center justify-center w-full h-full overflow-hidden"
              style={{ cursor: imageZoom > 1 ? 'move' : 'zoom-in' }}
              onClick={(e) => {
                // 마우스 휠 이벤트와 충돌 방지
                e.preventDefault();
                toggleImageZoom();
              }}
            >
              <div 
                className="overflow-auto max-w-full max-h-full"
                style={{
                  transform: `scale(${imageZoom})`,
                  transformOrigin: 'center center'
                }}
              >
                <img
                  src={files[currentImageIndex]?.url}
                  alt={files[currentImageIndex]?.name}
                  className="block transition-transform duration-200"
                  style={{
                    maxWidth: '90vw',
                    maxHeight: '85vh',
                    width: 'auto',
                    height: 'auto'
                  }}
                  draggable={false}
                />
              </div>
            </div>

            {/* 다음 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 text-white z-50"
              onClick={() => navigateImage('next')}
              disabled={files.length <= 1}
            >
              <ChevronRight style={{ width: '32px', height: '32px' }} />
            </Button>

            {/* 썸네일 스트립 */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
              <ScrollArea className="w-full">
                <div className="flex gap-2 justify-center">
                  {files.map((file, index) => (
                    <button
                      key={file.id}
                      className={`relative flex-shrink-0 ${
                        index === currentImageIndex ? 'ring-2 ring-white' : ''
                      }`}
                      onClick={() => {
                        setImageZoom(1);
                        setCurrentImageIndex(index);
                      }}
                    >
                      <img
                        src={file.url}
                        alt={file.name}
                        className="h-16 w-16 object-cover opacity-70 hover:opacity-100 transition-opacity"
                      />
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* 컨트롤 힌트 */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded">
              <span className="opacity-70">
                방향키: 이동 | 마우스휠: 줌 | 스페이스/클릭: 확대 | ESC: 닫기
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 숨겨진 파일 인풋 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => processFiles(Array.from(e.target.files || []))}
      />
    </div>
  );
}