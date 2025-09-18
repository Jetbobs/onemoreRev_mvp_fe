import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Move, 
  MessageCircle, 
  ZoomIn, 
  ZoomOut, 
  Home, 
  X, 
  Trash2, 
  MapPin,
  Plus,
  Clock,
  Eye,
  EyeOff,
  MessageCircleOff,
  Paperclip,
  File,
  FileImage,
  CheckSquare,
  Square,
  ListChecks
} from 'lucide-react';

// Props 인터페이스 - 단일 이미지용
interface FigmaCanvasProps {
  image: {
    id: string;
    src: string;
    name?: string;
  };
}

export default function FigmaCanvas({ image }: FigmaCanvasProps) {
  // 상태 관리
  const [mode, setMode] = useState('pan');
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentTranslate, setCurrentTranslate] = useState({ x: 0, y: 0 });
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [showAllBoxes, setShowAllBoxes] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [openBoxIds, setOpenBoxIds] = useState(new Set());

  // 단일 이미지를 캔버스 중앙에 배치
  const [canvasImage] = useState(() => {
    const imageWidth = 600;
    const imageHeight = 400;
    
    // 캔버스 중앙에 이미지 배치
    return {
      id: image.id,
      src: image.src,
      x: 2500 - imageWidth / 2,
      y: 2500 - imageHeight / 2,
      width: imageWidth,
      height: imageHeight
    };
  });

  const canvasRef = useRef(null);
  const viewportRef = useRef(null);

  // 초기 위치 설정 - 이미지가 중앙에 오도록
  const centerCanvas = useCallback(() => {
    const viewport = viewportRef.current;
    if (viewport) {
      // 이미지 중심을 뷰포트 중앙에 맞춤
      const viewportCenterX = viewport.offsetWidth / 2;
      const viewportCenterY = viewport.offsetHeight / 2;
      const imageCenterX = canvasImage.x + canvasImage.width / 2;
      const imageCenterY = canvasImage.y + canvasImage.height / 2;
      
      setTranslate({
        x: viewportCenterX - imageCenterX,
        y: viewportCenterY - imageCenterY
      });
    }
  }, [canvasImage]);

  useEffect(() => {
    centerCanvas();
  }, [centerCanvas]);

  // 줌 기능
  const zoom = useCallback((delta, mouseX, mouseY) => {
    setScale(prevScale => {
      const zoomIntensity = 0.002;
      const zoomSpeed = 1 - delta * zoomIntensity;
      const newScale = Math.max(0.25, Math.min(3, prevScale * zoomSpeed));
      
      if (mouseX !== undefined && mouseY !== undefined) {
        const scaleChange = newScale / prevScale;
        setTranslate(prevTranslate => ({
          x: prevTranslate.x - (mouseX - prevTranslate.x) * (scaleChange - 1),
          y: prevTranslate.y - (mouseY - prevTranslate.y) * (scaleChange - 1)
        }));
      }
      
      return newScale;
    });
  }, []);

  const zoomButton = useCallback((zoomIn) => {
    const viewport = viewportRef.current;
    if (viewport) {
      const centerX = viewport.offsetWidth / 2;
      const centerY = viewport.offsetHeight / 2;
      const delta = zoomIn ? -50 : 50;
      zoom(delta, centerX, centerY);
    }
  }, [zoom]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    zoom(e.deltaY, mouseX, mouseY);
  }, [zoom]);

  // 코멘트 추가
  const addComment = useCallback((x, y) => {
    const newComment = {
      id: `comment-${Date.now()}`,
      number: commentCount + 1,
      author: `사용자 ${commentCount + 1}`,
      text: '',
      x,
      y,
      createdAt: new Date(),
      attachments: [],
      checklist: [],
      isCompleted: false,
      hasPin: x !== undefined && y !== undefined
    };
    setComments(prev => [...prev, newComment]);
    setCommentCount(prev => prev + 1);
    
    if (newComment.hasPin) {
      setTimeout(() => setActiveCommentId(newComment.id), 100);
    }
    
    return newComment.id;
  }, [commentCount]);

  const addCommentOnly = useCallback(() => {
    const newCommentId = addComment(undefined, undefined);
    setTimeout(() => {
      const commentElement = document.getElementById(`comment-box-${newCommentId}`);
      if (commentElement) {
        commentElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, [addComment]);

  // 마우스 이벤트 핸들러
  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('button') || 
        e.target.closest('.toolbar') || 
        e.target.closest('.comment-pin') || 
        e.target.closest('.comment-box') || 
        e.target.closest('img')) return;
    
    if (mode === 'comment' && !isSpacePressed) {
      const rect = viewportRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - translate.x) / scale;
      const y = (e.clientY - rect.top - translate.y) / scale;
      addComment(x, y);
    } else if (mode === 'pan' || isSpacePressed) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setCurrentTranslate(translate);
    }
  }, [mode, isSpacePressed, translate, scale, addComment]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setTranslate({
        x: currentTranslate.x + (e.clientX - dragStart.x),
        y: currentTranslate.y + (e.clientY - dragStart.y)
      });
    }
  }, [isDragging, dragStart, currentTranslate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 코멘트 관리
  const deleteComment = useCallback((commentId) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
  }, []);

  const updateComment = useCallback((commentId, updates) => {
    setComments(prev => prev.map(c => 
      c.id === commentId ? { ...c, ...updates } : c
    ));
  }, []);

  const focusOnComment = useCallback((comment) => {
    if (comment.hasPin && comment.x !== undefined && comment.y !== undefined) {
      const viewport = viewportRef.current;
      if (viewport) {
        const viewportCenterX = viewport.offsetWidth / 2;
        const viewportCenterY = viewport.offsetHeight / 2;
        
        setTranslate({
          x: viewportCenterX - comment.x * scale,
          y: viewportCenterY - comment.y * scale
        });
      }
    }
    
    setOpenBoxIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(comment.id)) {
        newSet.delete(comment.id);
      } else {
        newSet.add(comment.id);
      }
      return newSet;
    });
    setActiveCommentId(comment.id);
  }, [scale]);

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case '+':
          case '=':
            e.preventDefault();
            zoomButton(true);
            break;
          case '-':
          case '_':
            e.preventDefault();
            zoomButton(false);
            break;
          case '0':
            e.preventDefault();
            setScale(1);
            centerCanvas();
            break;
        }
        return;
      }
      
      switch(e.key.toLowerCase()) {
        case 'v':
          setMode('pan');
          break;
        case 'c':
          setMode('comment');
          break;
        case ' ':
          e.preventDefault();
          setIsSpacePressed(true);
          break;
        case 'h':
          setShowComments(prev => !prev);
          break;
        case 'b':
          setShowAllBoxes(prev => !prev);
          break;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === ' ') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [zoomButton, centerCanvas]);

  // 시간 포맷
  const formatTime = (date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  const zoomPercentage = Math.round(scale * 100);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-900">
      <div
        ref={viewportRef}
        className={`absolute inset-0 overflow-hidden transition-all duration-300 ${
          isPanelOpen ? 'mr-80' : ''
        } ${isDragging ? 'cursor-grabbing' : mode === 'comment' && !isSpacePressed ? 'cursor-crosshair' : 'cursor-grab'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: `${20 * scale}px ${20 * scale}px`,
          backgroundPosition: `${translate.x}px ${translate.y}px`
        }}
      >
        <div
          ref={canvasRef}
          className="absolute w-[5000px] h-[5000px] origin-[0_0]"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`
          }}
        >
          <ImageCard
            key={canvasImage.id}
            image={canvasImage}
            isSelected={selectedCard === canvasImage.id}
            onSelect={() => setSelectedCard(canvasImage.id)}
            scale={scale}
            mode={mode}
            isSpacePressed={isSpacePressed}
            onAddComment={(x, y) => addComment(x, y)}
          />

          {comments.filter(c => c.hasPin && showComments).map(comment => (
            <CommentPin
              key={comment.id}
              comment={comment}
              onUpdate={(updates) => updateComment(comment.id, updates)}
              onDelete={() => deleteComment(comment.id)}
              scale={scale}
              isForceOpen={openBoxIds.has(comment.id) || showAllBoxes}
              onBoxToggle={(isOpen) => {
                if (!isOpen) {
                  setOpenBoxIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(comment.id);
                    return newSet;
                  });
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* 툴바 */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[1002] flex items-center gap-2 bg-gray-800/95 backdrop-blur-sm rounded-xl p-3 shadow-lg">
        <button
          onClick={() => setMode('pan')}
          className={`px-4 py-2 rounded-lg transition-all ${
            mode === 'pan' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <Move size={18} className="inline mr-2" />
          이동 (V)
        </button>
        <button
          onClick={() => setMode('comment')}
          className={`px-4 py-2 rounded-lg transition-all ${
            mode === 'comment' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <MessageCircle size={18} className="inline mr-2" />
          코멘트 (C)
        </button>
        <div className="w-px h-8 bg-gray-600" />
        <button
          onClick={() => setShowComments(!showComments)}
          className={`p-2 rounded-lg transition-all ${
            showComments 
              ? 'bg-white/10 text-white hover:bg-white/20' 
              : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
          }`}
        >
          {showComments ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
        <div className="w-px h-8 bg-gray-600" />
        <button
          onClick={() => zoomButton(false)}
          className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
        >
          <ZoomOut size={18} />
        </button>
        <div className="px-3 py-1 min-w-[80px] text-center text-gray-300 text-sm">
          {zoomPercentage}%
        </div>
        <button
          onClick={() => zoomButton(true)}
          className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={() => {
            setScale(1);
            centerCanvas();
          }}
          className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
        >
          <Home size={18} />
        </button>
      </div>

      {/* 코멘트 패널 토글 */}
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="absolute right-5 top-5 z-[1003] bg-gray-800/95 backdrop-blur-sm text-white px-4 py-2.5 rounded-lg hover:bg-gray-700/95 transition-all shadow-lg flex items-center gap-2"
      >
        {isPanelOpen ? <X size={18} /> : <MessageCircle size={18} />}
        {isPanelOpen ? '닫기' : `코멘트 ${comments.length > 0 ? `(${comments.length})` : ''}`}
      </button>

      {/* 코멘트 패널 */}
      <div className={`absolute right-0 top-0 w-80 h-full bg-gray-900/98 backdrop-blur-xl border-l border-white/10 z-[1004] flex flex-col transform transition-transform duration-300 ${
        isPanelOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-white text-base font-semibold">체크리스트</h2>
              <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs">
                {comments.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={addCommentOnly}
                className="p-1.5 rounded bg-blue-500 hover:bg-blue-600 text-white transition-all"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => setShowComments(!showComments)}
                className={`p-1.5 rounded transition-all ${
                  showComments 
                    ? 'text-gray-400 hover:text-white hover:bg-white/10' 
                    : 'text-orange-400 bg-orange-500/20'
                }`}
              >
                {showComments ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3">
          {comments.length === 0 ? (
            <div className="text-gray-500 text-center py-10 text-sm">
              아직 코멘트가 없습니다
            </div>
          ) : (
            <div className="space-y-2">
              {comments.map(comment => (
                <ChecklistItem
                  key={comment.id}
                  comment={comment}
                  updateComment={updateComment}
                  deleteComment={deleteComment}
                  focusOnComment={focusOnComment}
                  formatTime={formatTime}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 도움말 */}
      <div className="absolute bottom-5 left-5 bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 text-gray-400 text-xs max-w-[250px] z-[1002]">
        <strong className="text-gray-300">단축키:</strong><br />
        V - 이동 모드 | C - 코멘트 모드<br />
        H - 핀 표시/숨기기 | B - 모든 박스 열기/닫기<br />
        Ctrl + (+/-) - 확대/축소<br />
        Space + 드래그 - 캔버스 이동<br />
        Scroll - 줌
      </div>
    </div>
  );
}

// 체크리스트 아이템 컴포넌트
function ChecklistItem({ comment, updateComment, deleteComment, focusOnComment, formatTime }) {
  const [isEditingInline, setIsEditingInline] = useState(!comment.text && !comment.hasPin);
  const [inlineText, setInlineText] = useState(comment.text || '');
  
  return (
    <div className="group">
      <div
        className={`bg-white/5 hover:bg-white/[0.08] border border-transparent hover:border-blue-500/30 rounded-lg p-3 transition-all ${
          comment.isCompleted ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              {comment.hasPin && (
                <div 
                  className="bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold cursor-pointer"
                  onClick={() => focusOnComment(comment)}
                >
                  {comment.number}
                </div>
              )}
              <div>
                <div className="text-gray-300 text-xs font-medium">{comment.author}</div>
                <div className="text-gray-500 text-[10px] flex items-center gap-1">
                  <Clock size={10} />
                  {formatTime(comment.createdAt)}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateComment(comment.id, { isCompleted: !comment.isCompleted });
            }}
            className="text-blue-400 hover:text-blue-300 ml-2"
          >
            {comment.isCompleted ? <CheckSquare size={18} /> : <Square size={18} />}
          </button>
        </div>
        
        {isEditingInline ? (
          <div className="mb-2">
            <input
              type="text"
              value={inlineText}
              onChange={(e) => setInlineText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  updateComment(comment.id, { text: inlineText });
                  setIsEditingInline(false);
                }
              }}
              onBlur={() => {
                if (inlineText.trim()) {
                  updateComment(comment.id, { text: inlineText });
                  setIsEditingInline(false);
                } else if (!comment.text) {
                  deleteComment(comment.id);
                }
              }}
              placeholder="내용을 입력하세요..."
              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-gray-300 text-sm focus:outline-none focus:border-blue-400"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ) : (
          <div className={`text-gray-300 text-sm mb-2 ${comment.isCompleted ? 'line-through' : ''}`}>
            {comment.text || <span className="text-gray-500 italic">내용 없음</span>}
          </div>
        )}
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isEditingInline && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingInline(true);
                setInlineText(comment.text || '');
              }}
              className="text-gray-400 hover:text-blue-400 text-xs px-2 py-1 rounded hover:bg-blue-500/20"
            >
              수정
            </button>
          )}
          {comment.hasPin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                focusOnComment(comment);
              }}
              className="text-gray-400 hover:text-blue-400 text-xs px-2 py-1 rounded hover:bg-blue-500/20 flex items-center gap-1"
            >
              <MapPin size={12} />
              이동
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteComment(comment.id);
            }}
            className="text-gray-400 hover:text-red-400 text-xs px-2 py-1 rounded hover:bg-red-500/20 flex items-center gap-1"
          >
            <Trash2 size={12} />
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

// 이미지 카드 컴포넌트
function ImageCard({ image, isSelected, onSelect, scale, mode, isSpacePressed, onAddComment }) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: image.x, y: image.y });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    e.stopPropagation();
    
    if (mode === 'comment' && !isSpacePressed) {
      const rect = e.currentTarget.getBoundingClientRect();
      const parentRect = e.currentTarget.parentElement.getBoundingClientRect();
      
      const relativeX = (e.clientX - parentRect.left) / scale;
      const relativeY = (e.clientY - parentRect.top) / scale;
      
      onAddComment(relativeX, relativeY);
      return;
    }
    
    if (mode === 'pan' || isSpacePressed) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setInitialPos(position);
      onSelect();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const deltaX = (e.clientX - dragStart.x) / scale;
        const deltaY = (e.clientY - dragStart.y) / scale;
        setPosition({
          x: initialPos.x + deltaX,
          y: initialPos.y + deltaY
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, initialPos, scale]);

  return (
    <div
      className={`absolute bg-gray-800 rounded-lg p-1 shadow-lg transition-shadow ${
        mode === 'comment' && !isSpacePressed ? 'cursor-crosshair' : 'cursor-move'
      } ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent' : ''
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: image.width,
        height: image.height
      }}
      onMouseDown={handleMouseDown}
    >
      <img
        src={image.src}
        alt=""
        className="w-full h-full rounded object-cover"
        style={{
          imageRendering: 'crisp-edges',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden'
        }}
        draggable={false}
      />
    </div>
  );
}

// 코멘트 핀 컴포넌트
function CommentPin({ comment, onUpdate, onDelete, scale, isForceOpen, onBoxToggle }) {
  const [isBoxVisible, setIsBoxVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(!comment.text);
  const [text, setText] = useState(comment.text);
  const [isHovered, setIsHovered] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(!!comment.text);
  const [attachments, setAttachments] = useState(comment.attachments || []);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isForceOpen !== undefined) {
      setIsBoxVisible(isForceOpen);
    }
  }, [isForceOpen]);

  const handleSubmit = () => {
    const trimmedText = text.trim();
    onUpdate({ 
      text: trimmedText, 
      attachments
    });
    setIsEditing(false);
    setHasBeenSaved(true);
  };

  const handleClose = () => {
    setIsBoxVisible(false);
    if (onBoxToggle) onBoxToggle(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      const trimmedText = text.trim();
      if (trimmedText || attachments.length > 0) {
        handleSubmit();
      }
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setText(comment.text);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file)
    }));
    setAttachments([...attachments, ...newAttachments]);
    setHasBeenSaved(true);
  };

  const removeAttachment = (id) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  const pinSize = 20 / scale;
  const fontSize = 10 / scale;
  const boxOffset = 25 / scale;

  return (
    <>
      <div
        className={`comment-pin absolute bg-red-500 cursor-pointer flex items-center justify-center transition-all duration-200 z-20 ${
          isHovered ? 'brightness-110' : ''
        }`}
        style={{
          width: `${pinSize}px`,
          height: `${pinSize}px`,
          left: comment.x - pinSize / 2,
          top: comment.y - pinSize / 2,
          borderRadius: '50% 50% 50% 0',
          transform: `rotate(-45deg) scale(${isHovered ? 1.2 : 1})`,
          transformOrigin: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
        }}
        onClick={() => {
          const newState = !isBoxVisible;
          setIsBoxVisible(newState);
          if (onBoxToggle) onBoxToggle(newState);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span 
          className="text-white font-bold select-none"
          style={{
            transform: 'rotate(45deg)',
            fontSize: `${fontSize}px`,
            lineHeight: 1
          }}
        >
          {comment.number}
        </span>
      </div>

      {isBoxVisible && (
        <div
          className="comment-box absolute bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl"
          style={{
            left: comment.x + boxOffset,
            top: comment.y - boxOffset,
            minWidth: `${250 / scale}px`,
            maxWidth: `${350 / scale}px`,
            padding: `${12 / scale}px`,
            fontSize: `${14 / scale}px`,
            zIndex: 1000
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center" style={{ marginBottom: `${8 / scale}px` }}>
            <span className="text-blue-400 font-semibold" style={{ fontSize: `${12 / scale}px` }}>
              {comment.author}
            </span>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white leading-none flex items-center justify-center"
              style={{ 
                width: `${16 / scale}px`, 
                height: `${16 / scale}px`,
                fontSize: `${16 / scale}px`
              }}
            >
              ×
            </button>
          </div>
          
          {isEditing ? (
            <>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="코멘트를 입력하세요..."
                className="w-full bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-blue-400"
                style={{
                  padding: `${4 / scale}px ${8 / scale}px`,
                  fontSize: `${12 / scale}px`,
                  marginBottom: `${6 / scale}px`
                }}
                autoFocus
              />
              
              <div className="flex items-center gap-2" style={{ marginBottom: `${6 / scale}px` }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded transition-colors"
                  style={{
                    padding: `${4 / scale}px ${8 / scale}px`,
                    fontSize: `${11 / scale}px`
                  }}
                >
                  <Paperclip size={12 / scale} />
                  파일 첨부
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                  style={{
                    padding: `${4 / scale}px ${12 / scale}px`,
                    fontSize: `${11 / scale}px`
                  }}
                >
                  저장
                </button>
              </div>
            </>
          ) : (
            <div 
              className="text-gray-300 leading-relaxed cursor-text" 
              style={{ fontSize: `${12 / scale}px`, marginBottom: attachments.length > 0 ? `${6 / scale}px` : 0 }}
              onClick={() => setIsEditing(true)}
            >
              {comment.text || <span className="text-gray-500 italic">클릭하여 입력...</span>}
            </div>
          )}
          
          {attachments.length > 0 && (
            <div className="space-y-1" style={{ marginTop: `${6 / scale}px` }}>
              {attachments.map(att => (
                <div 
                  key={att.id} 
                  className="flex items-center justify-between bg-white/5 rounded"
                  style={{ padding: `${3 / scale}px ${6 / scale}px` }}
                >
                  <div className="flex items-center gap-1">
                    {att.type.startsWith('image/') ? (
                      <FileImage size={12 / scale} className="text-blue-400" />
                    ) : (
                      <File size={12 / scale} className="text-gray-400" />
                    )}
                    <span 
                      className="text-gray-300 truncate max-w-[150px]" 
                      style={{ fontSize: `${10 / scale}px` }}
                      title={att.name}
                    >
                      {att.name}
                    </span>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="text-red-400 hover:text-red-500"
                      style={{ fontSize: `${12 / scale}px` }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {!isEditing && (comment.text || attachments.length > 0) && (
            <button
              onClick={onDelete}
              className="w-full bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
              style={{
                marginTop: `${6 / scale}px`,
                padding: `${4 / scale}px`,
                fontSize: `${11 / scale}px`
              }}
            >
              삭제
            </button>
          )}
        </div>
      )}
    </>
  );
}