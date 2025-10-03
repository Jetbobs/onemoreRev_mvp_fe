import React, { useState, useEffect } from 'react';
import { MoreVertical, X, Trash2, Search, Filter, Folder, File, FileImage, Download, Calendar, HardDrive, Eye, LayoutGrid, LayoutList, Check } from 'lucide-react';

interface FileHistoryLayoutProps {
  completedFiles?: any[];
  projectId?: string;
}

const FileHistoryLayout: React.FC<FileHistoryLayoutProps> = ({ completedFiles = [], projectId }) => {
  const [historyData, setHistoryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 백엔드에서 히스토리 데이터 가져오기
  useEffect(() => {
    if (projectId) {
      loadProjectHistory();
    }
  }, [projectId]);

  async function loadProjectHistory() {
    if (!projectId) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log('[file-history] 히스토리 로딩 시작, projectId:', projectId);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/project/history?projectId=${projectId}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('[file-history] 히스토리 데이터:', data);
      console.log('[file-history] 히스토리 JSON:', JSON.stringify(data, null, 2));

      if (!data.success) {
        throw new Error(data.message || '히스토리 로드 실패');
      }

      setHistoryData(data);

    } catch (err: any) {
      console.error('[file-history] 히스토리 로드 실패:', err);
      setError(`히스토리를 불러올 수 없습니다: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  // 완료된 파일들을 기존 items 형식으로 변환
  const convertCompletedFilesToItems = () => {
    if (completedFiles.length === 0) return [];
    
    return [{
      id: Date.now(),
      thumbnail: completedFiles[0]?.url || "https://picsum.photos/400/300?random=new",
      date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
      files: completedFiles.map((file, index) => ({
        id: `completed-${file.id || index}`,
        name: file.name || `완료된_파일_${index + 1}.jpeg`,
        type: file.type || "jpeg",
        size: file.size || "2.0 MB",
        selected: false
      })),
      totalSize: `${completedFiles.length * 2} MB`,
      lastAccessed: "방금 전"
    }];
  };

  const [items, setItems] = useState([
    ...convertCompletedFilesToItems(),
    {
      id: 1,
      thumbnail: "https://picsum.photos/400/300?random=1",
      date: "2025년 1월 15일",
      files: [
        { id: 'f1-1', name: "메인_배너_최종.jpeg", type: "jpeg", size: "2.5 MB", selected: false },
        { id: 'f1-2', name: "서브_배너_v2.png", type: "png", size: "1.8 MB", selected: false },
        { id: 'f1-3', name: "로고_디자인.ai", type: "ai", size: "15.2 MB", selected: false },
        { id: 'f1-4', name: "웹_목업.psd", type: "psd", size: "45.8 MB", selected: false }
      ],
      totalSize: "65.3 MB",
      lastAccessed: "2시간 전"
    },
    {
      id: 2,
      thumbnail: "https://picsum.photos/400/300?random=2",
      date: "2025년 1월 14일",
      files: [
        { id: 'f2-1', name: "프로필_사진.jpeg", type: "jpeg", size: "854 KB", selected: false },
        { id: 'f2-2', name: "아이콘_세트.png", type: "png", size: "2.1 MB", selected: false },
        { id: 'f2-3', name: "포스터_디자인.psd", type: "psd", size: "78.4 MB", selected: false }
      ],
      totalSize: "81.3 MB",
      lastAccessed: "어제"
    },
    {
      id: 3,
      thumbnail: "https://picsum.photos/400/300?random=3",
      date: "2025년 1월 12일",
      files: [
        { id: 'f3-1', name: "썸네일_01.png", type: "png", size: "1.2 MB", selected: false },
        { id: 'f3-2', name: "썸네일_02.png", type: "png", size: "1.4 MB", selected: false },
        { id: 'f3-3', name: "썸네일_03.jpeg", type: "jpeg", size: "989 KB", selected: false },
        { id: 'f3-4', name: "템플릿_디자인.ai", type: "ai", size: "8.5 MB", selected: false },
        { id: 'f3-5', name: "편집본.psd", type: "psd", size: "52.3 MB", selected: false }
      ],
      totalSize: "64.4 MB",
      lastAccessed: "3일 전"
    },
    {
      id: 4,
      thumbnail: "https://picsum.photos/400/300?random=4",
      date: "2025년 1월 10일",
      files: [
        { id: 'f4-1', name: "브로셔_앞면.ai", type: "ai", size: "23.2 MB", selected: false },
        { id: 'f4-2', name: "브로셔_뒷면.ai", type: "ai", size: "18.5 MB", selected: false },
        { id: 'f4-3', name: "미리보기.jpeg", type: "jpeg", size: "1.8 MB", selected: false }
      ],
      totalSize: "43.5 MB",
      lastAccessed: "5일 전"
    },
    {
      id: 5,
      thumbnail: "https://picsum.photos/400/300?random=5",
      date: "2025년 1월 8일",
      files: [
        { id: 'f5-1', name: "배경_이미지.jpeg", type: "jpeg", size: "3.2 MB", selected: false },
        { id: 'f5-2', name: "패턴_디자인.png", type: "png", size: "845 KB", selected: false },
        { id: 'f5-3', name: "명함_디자인.ai", type: "ai", size: "5.2 MB", selected: false },
        { id: 'f5-4', name: "SNS_템플릿.psd", type: "psd", size: "38.9 MB", selected: false },
        { id: 'f5-5', name: "아이콘.png", type: "png", size: "125 KB", selected: false }
      ],
      totalSize: "48.3 MB",
      lastAccessed: "1주 전"
    },
    {
      id: 6,
      thumbnail: "https://picsum.photos/400/300?random=6",
      date: "2025년 1월 7일",
      files: [
        { id: 'f6-1', name: "로고_변형.ai", type: "ai", size: "12.3 MB", selected: false },
        { id: 'f6-2', name: "최종_시안.psd", type: "psd", size: "67.2 MB", selected: false }
      ],
      totalSize: "79.5 MB",
      lastAccessed: "1주 전"
    },
    {
      id: 7,
      thumbnail: "https://picsum.photos/400/300?random=7",
      date: "2025년 1월 5일",
      files: [
        { id: 'f7-1', name: "배너_세트.png", type: "png", size: "4.5 MB", selected: false },
        { id: 'f7-2', name: "모바일_목업.psd", type: "psd", size: "32.1 MB", selected: false },
        { id: 'f7-3', name: "아이콘_팩.ai", type: "ai", size: "8.7 MB", selected: false }
      ],
      totalSize: "45.3 MB",
      lastAccessed: "2주 전"
    },
    {
      id: 8,
      thumbnail: "https://picsum.photos/400/300?random=8",
      date: "2025년 1월 3일",
      files: [
        { id: 'f8-1', name: "헤더_이미지.jpeg", type: "jpeg", size: "1.9 MB", selected: false },
        { id: 'f8-2', name: "풋터_디자인.png", type: "png", size: "780 KB", selected: false }
      ],
      totalSize: "2.7 MB",
      lastAccessed: "2주 전"
    }
  ]);

  // completedFiles가 변경될 때마다 items 업데이트
  React.useEffect(() => {
    if (completedFiles && completedFiles.length > 0) {
      setItems(prev => [...convertCompletedFilesToItems(), ...prev.slice(convertCompletedFilesToItems().length)]);
    }
  }, [completedFiles]);

  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredItem, setHoveredItem] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [selectedItems, setSelectedItems] = useState([]);

  const handleRemoveItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSelectFile = (itemId, fileId) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          files: item.files.map(file => 
            file.id === fileId ? { ...file, selected: !file.selected } : file
          )
        };
      }
      return item;
    }));
  };

  const handleSelectAllFiles = (itemId) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const allSelected = item.files.every(file => file.selected);
        return {
          ...item,
          files: item.files.map(file => ({ ...file, selected: !allSelected }))
        };
      }
      return item;
    }));
  };

  const getSelectedFilesCount = (itemId) => {
    const item = items.find(i => i.id === itemId);
    return item ? item.files.filter(f => f.selected).length : 0;
  };

  const getFileIcon = (type) => {
    switch(type) {
      case 'jpeg':
      case 'png':
        return <FileImage className="w-4 h-4 text-green-500" />;
      case 'psd':
        return <FileImage className="w-4 h-4 text-blue-600" />;
      case 'ai':
        return <FileImage className="w-4 h-4 text-orange-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredItems = items.filter(item =>
    item.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.files.some(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 로딩 중이거나 에러가 있을 때
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">히스토리를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Folder className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                파일 히스토리
                {historyData && ` - ${historyData.projectName}`}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white dark:bg-gray-600 shadow-sm' 
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="리스트 뷰"
                >
                  <LayoutList className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white dark:bg-gray-600 shadow-sm' 
                      : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="그리드 뷰"
                >
                  <LayoutGrid className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="파일 검색"
                  className="pl-10 pr-4 py-2 w-64 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'list' ? (
          /* List View - 리비전별로 표시 */
          <div className="grid gap-4">
            {historyData && historyData.revisions && historyData.revisions.length > 0 ? (
              historyData.revisions.map((revision: any) => {
                const getStatusText = (status: string) => {
                  switch(status) {
                    case 'prepare': return '준비중';
                    case 'submitted': return '제출됨';
                    case 'reviewed': return '검토됨';
                    default: return status;
                  }
                };

                const getStatusColor = (status: string) => {
                  switch(status) {
                    case 'prepare': return 'bg-yellow-100 text-yellow-800';
                    case 'submitted': return 'bg-blue-100 text-blue-800';
                    case 'reviewed': return 'bg-green-100 text-green-800';
                    default: return 'bg-gray-100 text-gray-800';
                  }
                };

                const formatDateTime = (dateString: string) => {
                  const date = new Date(dateString);
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const hours = String(date.getHours()).padStart(2, '0');
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  return `${month}/${day} ${hours}:${minutes}`;
                };

                const formatFileSize = (bytes: number) => {
                  if (bytes < 1024) return `${bytes} B`;
                  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
                  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
                };

                const getTotalSize = () => {
                  const total = revision.files.reduce((sum: number, file: any) => sum + file.fileSize, 0);
                  return formatFileSize(total);
                };

                // 첫 번째 파일의 이미지를 썸네일로 사용
                const thumbnailUrl = revision.files.length > 0
                  ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/files/${revision.files[0].storedFilename}`
                  : null;

                return (
                  <div
                    key={revision.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
                  >
                    <div className="flex gap-4 p-4">
                      {/* Thumbnail Image */}
                      {thumbnailUrl ? (
                        <div className="relative flex-shrink-0 self-center overflow-hidden rounded-lg">
                          <img
                            src={thumbnailUrl}
                            alt="썸네일"
                            className="w-80 h-44 object-cover cursor-pointer hover:scale-105 transition-transform duration-300 ease-out"
                            onMouseEnter={() => setHoveredItem(revision.id)}
                            onMouseLeave={() => setHoveredItem(null)}
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = 'none';
                            }}
                          />
                          {/* Hover Overlay */}
                          {hoveredItem === revision.id && (
                            <div className="absolute inset-0 bg-black bg-opacity-20 transition-opacity duration-300 pointer-events-none"></div>
                          )}
                        </div>
                      ) : (
                        <div className="flex-shrink-0 self-center w-80 h-44 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-sm">이미지 없음</span>
                        </div>
                      )}

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-4">
                            {/* Revision Title */}
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                Rev {revision.revNo}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(revision.status)}`}>
                                {getStatusText(revision.status)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {formatDateTime(revision.createdAt)}
                              </span>
                            </div>

                            {revision.files && revision.files.length > 0 ? (
                              <>
                                {/* Select All Button */}
                                <div className="flex items-center justify-between mb-2">
                                  <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">
                                    전체 선택
                                  </button>
                                  <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">
                                    다운로드
                                  </button>
                                </div>

                                {/* File List */}
                                <div className="space-y-2 mb-3">
                                  {revision.files.map((file: any) => {
                                    const track = revision.createdTracks.find((t: any) => t.id === file.trackId);
                                    return (
                                      <div key={file.id} className="flex items-center gap-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 p-1 -ml-1 rounded">
                                        <FileImage className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        <span className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer flex-1 truncate">
                                          {track?.name || `트랙 ${file.trackId}`}: {file.originalFilename}
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-500 text-xs">
                                          {formatFileSize(file.fileSize)}
                                        </span>
                                        {/* Download Button */}
                                        <button
                                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                                          onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/files/${file.storedFilename}`;
                                            link.download = file.originalFilename;
                                            link.click();
                                          }}
                                        >
                                          <Download className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Summary Info */}
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-700">
                                  <div className="flex items-center gap-1">
                                    <Folder className="w-3 h-3" />
                                    <span>{revision.files.length}개 파일</span>
                                  </div>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <HardDrive className="w-3 h-3" />
                                    <span>총 {getTotalSize()}</span>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="text-sm text-gray-500 dark:text-gray-400 py-4">
                                파일이 없습니다
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                리비전이 없습니다
              </div>
            )}
          </div>
        ) : (
          /* Grid Gallery View - 리비전별로 표시 */
          <div className="space-y-8">
            {historyData && historyData.revisions && historyData.revisions.length > 0 ? (
              historyData.revisions.map((revision: any) => {
                const getStatusText = (status: string) => {
                  switch(status) {
                    case 'prepare': return '준비중';
                    case 'submitted': return '제출됨';
                    case 'reviewed': return '검토됨';
                    default: return status;
                  }
                };

                const getStatusColor = (status: string) => {
                  switch(status) {
                    case 'prepare': return 'bg-yellow-100 text-yellow-800';
                    case 'submitted': return 'bg-blue-100 text-blue-800';
                    case 'reviewed': return 'bg-green-100 text-green-800';
                    default: return 'bg-gray-100 text-gray-800';
                  }
                };

                const formatDateTime = (dateString: string) => {
                  const date = new Date(dateString);
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const hours = String(date.getHours()).padStart(2, '0');
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  return `${month}/${day} ${hours}:${minutes}`;
                };

                return (
                  <div key={revision.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    {/* 리비전 헤더 */}
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        Rev {revision.revNo}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(revision.status)}`}>
                        {getStatusText(revision.status)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDateTime(revision.createdAt)}
                      </span>
                    </div>

                    {/* 파일 그리드 */}
                    {revision.files && revision.files.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {revision.files.map((file: any) => {
                          const track = revision.createdTracks.find((t: any) => t.id === file.trackId);
                          return (
                            <div
                              key={file.id}
                              className="group relative"
                            >
                              <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                                <img
                                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/files/${file.storedFilename}`}
                                  alt={file.originalFilename}
                                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                                  onError={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    img.style.display = 'none';
                                    const parent = img.parentElement;
                                    if (parent) {
                                      parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-sm">로드 실패</div>';
                                    }
                                  }}
                                />

                                {/* Hover Overlay with Download Button */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                                  <button
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white rounded-full hover:bg-gray-100"
                                    onClick={() => {
                                      // 다운로드 기능
                                      const link = document.createElement('a');
                                      link.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/files/${file.storedFilename}`;
                                      link.download = file.originalFilename;
                                      link.click();
                                    }}
                                    title="다운로드"
                                  >
                                    <Download className="w-5 h-5 text-gray-700" />
                                  </button>
                                </div>
                              </div>

                              {/* 파일 정보 */}
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {track?.name || `트랙 ${file.trackId}`}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {file.originalFilename}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        파일이 없습니다
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                리비전이 없습니다
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              파일 히스토리가 없습니다
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              업로드한 파일들이 여기에 표시됩니다
            </p>
          </div>
        )}

        {/* Selected Items Actions (Grid View) */}
        {viewMode === 'grid' && selectedItems.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 py-3 flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {selectedItems.length}개 선택됨
            </span>
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
              <Download className="w-4 h-4" />
              다운로드
            </button>
            <button 
              onClick={() => {
                setItems(items.filter(item => !selectedItems.includes(item.id)));
                setSelectedItems([]);
              }}
              className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </button>
            <button 
              onClick={() => setSelectedItems([])}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
            >
              취소
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileHistoryLayout;