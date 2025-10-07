// API 설정 파일
export const API_CONFIG = {
  // 백엔드 API URL
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000',

  // 타임아웃 설정 (밀리초)
  TIMEOUT: 30000,

  // API 엔드포인트
  ENDPOINTS: {
    // 인증 (Auth)
    SIGNUP: '/api/v1/signup',
    LOGIN: '/api/v1/login',
    LOGOUT: '/api/v1/logout',
    PROFILE: '/api/v1/user/profile',

    // 프로젝트 (Projects)
    PROJECT_NEW: '/api/v1/project/new',
    PROJECT_LIST: '/api/v1/project/list',
    PROJECT_INFO: '/api/v1/project/info',
    PROJECT_DETAIL: '/api/v1/project',
    PROJECT_HISTORY: '/api/v1/project/history',
    PROJECT_LOGS: '/api/v1/project/logs',
    PROJECT_PAYCHECKPOINT_PAID: '/api/v1/project/paycheckpoint/paid',

    // 리비전 (Revisions)
    REVISION_NEW: '/api/v1/revision/new',
    REVISION_INFO: '/api/v1/revision/info',
    REVISION_SUBMIT: '/api/v1/revision/submit',
    REVISION_REVIEW_DONE: '/api/v1/revision/review/done',

    // 트랙 (Tracks)
    TRACK_ADD: '/api/v1/track/add',

    // 피드백 (Feedback)
    FEEDBACK: '/api/v1/feedback',
    FEEDBACK_REPLY: '/api/v1/feedback/reply',

    // 파일 (Files)
    FILES: '/api/v1/files',

    // 툴 (Tool)
    CONVERT_IMAGE: '/api/tool/convert_img',
  }
} as const

// 환경별 설정
export const ENV = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const
