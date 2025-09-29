/**
 * 프로젝트의 시작일과 마감일을 기반으로 진행률을 계산합니다.
 * @param startDate 프로젝트 시작일
 * @param deadline 프로젝트 마감일
 * @returns 진행률 (0-100)
 */
export const calculateDateProgress = (
  startDate: Date | string | null, 
  deadline: Date | string | null
): number => {
  if (!startDate || !deadline) return 0;
  
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(deadline);
  
  // 날짜가 유효하지 않은 경우
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  
  // 아직 시작 전
  if (now < start) return 0;
  
  // 이미 마감일 지남
  if (now > end) return 100;
  
  // 진행률 계산: (현재일 - 시작일) / (마감일 - 시작일) * 100
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  
  return Math.round((elapsed / totalDuration) * 100);
};

/**
 * 날짜를 YYYY.MM.DD 형식으로 포맷합니다.
 * @param date 포맷할 날짜
 * @returns 포맷된 날짜 문자열
 */
export const formatDate = (date: Date | string | null): string => {
  if (!date) return '미정';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '미정';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}.${month}.${day}`;
};