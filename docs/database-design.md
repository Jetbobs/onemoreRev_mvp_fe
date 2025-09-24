# OneMoreRev MVP - 데이터베이스 설계 문서

## 프로젝트 개요

OneMoreRev는 디자이너와 클라이언트 간의 디자인 프로젝트 협업을 위한 플랫폼입니다. 이 문서는 프로젝트에 필요한 모든 데이터베이스 테이블과 관계를 상세히 정의합니다.

---

## 목차

1. [데이터베이스 구조 개요](#데이터베이스-구조-개요)
2. [테이블 상세 설계](#테이블-상세-설계)
3. [관계도](#관계도)
4. [인덱스 및 성능 최적화](#인덱스-및-성능-최적화)
5. [API 엔드포인트 매핑](#api-엔드포인트-매핑)
6. [Prisma 스키마](#prisma-스키마)

---

## 데이터베이스 구조 개요

### 주요 엔티티
- **사용자 관리**: 디자이너/클라이언트 계정 관리
- **프로젝트 관리**: 프로젝트 생성, 상태 관리, 협업
- **파일 시스템**: 버전 관리, 파일 업로드/다운로드
- **댓글 시스템**: 캔버스 피드백, 프로젝트 커뮤니케이션
- **결제 시스템**: 계약금, 중간금, 잔금 관리
- **수정 관리**: 수정 횟수 추적, 워크플로우
- **알림 시스템**: 실시간 알림, 이메일 알림
- **활동 로그**: 사용자 활동 추적, 감사

---

## 테이블 상세 설계

### 1. 사용자 관리 (users)

**목적**: 디자이너와 클라이언트의 계정 정보를 관리합니다.

| 컬럼명 | 데이터 타입 | 제약조건 | 기본값 | 설명 |
|--------|-------------|----------|--------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | - | 사용자 고유 식별자 |
| role | ENUM('DESIGNER', 'CLIENT') | NOT NULL | - | 사용자 역할 |
| name | VARCHAR(100) | NOT NULL | - | 사용자 실명 |
| email | VARCHAR(255) | UNIQUE, NOT NULL | - | 로그인용 이메일 |
| password | VARCHAR(255) | NOT NULL | - | bcrypt 해시된 비밀번호 |
| phone | VARCHAR(20) | NULL | - | 연락처 (010-1234-5678 형식) |
| profile_image | VARCHAR(500) | NULL | - | 프로필 이미지 URL |
| bio | TEXT | NULL | - | 자기소개 (디자이너용) |
| portfolio_url | VARCHAR(500) | NULL | - | 포트폴리오 링크 (디자이너용) |
| company | VARCHAR(200) | NULL | - | 소속 회사 |
| is_active | BOOLEAN | NOT NULL | TRUE | 계정 활성화 상태 |
| email_verified | BOOLEAN | NOT NULL | FALSE | 이메일 인증 상태 |
| last_login_at | TIMESTAMP | NULL | - | 마지막 로그인 시간 |
| created_at | TIMESTAMP | NOT NULL | NOW() | 계정 생성일 |
| updated_at | TIMESTAMP | NOT NULL | NOW() ON UPDATE | 정보 수정일 |

**비즈니스 규칙**:
- 이메일은 중복될 수 없음
- 비밀번호는 8자 이상, 대소문자+숫자 포함 필수
- 핸드폰번호는 010-xxxx-xxxx 형식만 허용
- 디자이너는 포트폴리오 URL 입력 권장

### 2. 프로젝트 관리 (projects)

**목적**: 디자인 프로젝트의 전체 라이프사이클을 관리합니다.

| 컬럼명 | 데이터 타입 | 제약조건 | 기본값 | 설명 |
|--------|-------------|----------|--------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | - | 프로젝트 고유 식별자 |
| title | VARCHAR(200) | NOT NULL | - | 프로젝트 제목 |
| description | TEXT | NULL | - | 프로젝트 상세 설명 |
| category | VARCHAR(50) | NULL | - | 프로젝트 카테고리 (로고, 웹디자인 등) |
| status | ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'REVIEW', 'REVISION', 'COMPLETED', 'CANCELLED') | NOT NULL | 'PENDING' | 프로젝트 진행 상태 |
| priority | ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') | NOT NULL | 'MEDIUM' | 우선순위 |
| client_id | INT | NOT NULL, FK(users.id) | - | 클라이언트 사용자 ID |
| designer_id | INT | NULL, FK(users.id) | - | 배정된 디자이너 ID |
| budget | DECIMAL(12,2) | NULL | - | 프로젝트 총 예산 |
| currency | VARCHAR(3) | NOT NULL | 'KRW' | 통화 코드 (KRW, USD 등) |
| start_date | DATE | NULL | - | 프로젝트 시작일 |
| deadline | DATETIME | NULL | - | 마감일 |
| estimated_hours | INT | NULL | - | 예상 작업 시간 |
| actual_hours | INT | NULL | 0 | 실제 작업 시간 |
| revision_count | INT | NOT NULL | 3 | 총 수정 가능 횟수 |
| used_revisions | INT | NOT NULL | 0 | 사용된 수정 횟수 |
| completion_rate | INT | NOT NULL | 0 | 완료율 (0-100%) |
| requirements | JSON | NULL | - | 프로젝트 요구사항 (구조화된 데이터) |
| deliverables | JSON | NULL | - | 결과물 목록 |
| notes | TEXT | NULL | - | 프로젝트 메모 |
| is_public | BOOLEAN | NOT NULL | FALSE | 포트폴리오 공개 여부 |
| rating | DECIMAL(2,1) | NULL | - | 프로젝트 평점 (1.0-5.0) |
| created_at | TIMESTAMP | NOT NULL | NOW() | 프로젝트 생성일 |
| updated_at | TIMESTAMP | NOT NULL | NOW() ON UPDATE | 마지막 수정일 |
| completed_at | TIMESTAMP | NULL | - | 완료일 |

**비즈니스 규칙**:
- 한 프로젝트는 하나의 클라이언트와 최대 하나의 디자이너에게 배정
- 수정 횟수는 초과할 수 없음 (추가 결제 시 별도 처리)
- 완료율은 관리자나 디자이너가 수동으로 업데이트
- 마감일 지연 시 자동 알림 발송

### 3. 파일 관리 (project_files)

**목적**: 프로젝트 관련 파일들의 버전 관리와 메타데이터를 저장합니다.

| 컬럼명 | 데이터 타입 | 제약조건 | 기본값 | 설명 |
|--------|-------------|----------|--------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | - | 파일 고유 식별자 |
| project_id | INT | NOT NULL, FK(projects.id) | - | 소속 프로젝트 ID |
| file_name | VARCHAR(255) | NOT NULL | - | 서버에 저장된 파일명 |
| original_name | VARCHAR(255) | NOT NULL | - | 업로드된 원본 파일명 |
| file_path | VARCHAR(1000) | NOT NULL | - | 파일 저장 경로 (S3 URL 등) |
| file_size | BIGINT | NOT NULL | - | 파일 크기 (bytes) |
| mime_type | VARCHAR(100) | NOT NULL | - | 파일 MIME 타입 |
| file_extension | VARCHAR(10) | NOT NULL | - | 파일 확장자 |
| uploader_id | INT | NOT NULL, FK(users.id) | - | 업로더 사용자 ID |
| upload_type | ENUM('REFERENCE', 'DRAFT', 'FINAL', 'REVISION') | NOT NULL | 'DRAFT' | 파일 유형 |
| version | INT | NOT NULL | 1 | 파일 버전 번호 |
| parent_file_id | INT | NULL, FK(project_files.id) | - | 이전 버전 파일 ID |
| is_active | BOOLEAN | NOT NULL | TRUE | 활성 상태 (삭제된 파일은 FALSE) |
| is_downloadable | BOOLEAN | NOT NULL | TRUE | 다운로드 허용 여부 |
| download_count | INT | NOT NULL | 0 | 다운로드 횟수 |
| thumbnail_path | VARCHAR(1000) | NULL | - | 썸네일 이미지 경로 |
| metadata | JSON | NULL | - | 추가 메타데이터 (해상도, 색상모드 등) |
| checksum | VARCHAR(64) | NULL | - | 파일 무결성 검증용 체크섬 |
| expires_at | TIMESTAMP | NULL | - | 파일 만료일 (임시 파일용) |
| created_at | TIMESTAMP | NOT NULL | NOW() | 업로드일 |
| updated_at | TIMESTAMP | NOT NULL | NOW() ON UPDATE | 수정일 |

**비즈니스 규칙**:
- 같은 파일명의 새 버전 업로드 시 version 자동 증가
- 최대 파일 크기: 100MB
- 허용 파일 타입: 이미지, PDF, AI, PSD, Sketch 등
- 썸네일은 이미지 파일에 대해서만 자동 생성

### 4. 결제 관리 (payments)

**목적**: 프로젝트별 결제 단계와 상태를 관리합니다.

| 컬럼명 | 데이터 타입 | 제약조건 | 기본값 | 설명 |
|--------|-------------|----------|--------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | - | 결제 고유 식별자 |
| project_id | INT | NOT NULL, FK(projects.id) | - | 관련 프로젝트 ID |
| payment_type | ENUM('DOWN_PAYMENT', 'INTERIM_PAYMENT', 'FINAL_PAYMENT', 'EXTRA_REVISION') | NOT NULL | - | 결제 유형 |
| amount | DECIMAL(12,2) | NOT NULL | - | 결제 금액 |
| currency | VARCHAR(3) | NOT NULL | 'KRW' | 통화 코드 |
| percentage | DECIMAL(5,2) | NULL | - | 전체 예산 대비 비율 |
| status | ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED') | NOT NULL | 'PENDING' | 결제 상태 |
| payment_method | VARCHAR(50) | NULL | - | 결제 수단 (카드, 계좌이체 등) |
| transaction_id | VARCHAR(200) | NULL | - | 결제 게이트웨이 거래 ID |
| receipt_url | VARCHAR(1000) | NULL | - | 영수증 URL |
| due_date | DATETIME | NULL | - | 결제 기한 |
| paid_at | TIMESTAMP | NULL | - | 결제 완료일시 |
| failed_reason | TEXT | NULL | - | 결제 실패 사유 |
| refund_amount | DECIMAL(12,2) | NULL | - | 환불 금액 |
| refunded_at | TIMESTAMP | NULL | - | 환불일시 |
| notes | TEXT | NULL | - | 결제 관련 메모 |
| created_at | TIMESTAMP | NOT NULL | NOW() | 결제 요청일 |
| updated_at | TIMESTAMP | NOT NULL | NOW() ON UPDATE | 상태 변경일 |

**비즈니스 규칙**:
- 계약금 → 중간금 → 잔금 순서로 진행
- 이전 결제가 완료되어야 다음 단계 진행 가능
- 추가 수정 요청 시 별도 결제 생성
- 결제 기한 경과 시 자동 알림

### 5. 댓글 시스템 (comments)

**목적**: 프로젝트 협업을 위한 댓글과 캔버스 피드백을 관리합니다.

| 컬럼명 | 데이터 타입 | 제약조건 | 기본값 | 설명 |
|--------|-------------|----------|--------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | - | 댓글 고유 식별자 |
| project_id | INT | NOT NULL, FK(projects.id) | - | 관련 프로젝트 ID |
| file_id | INT | NULL, FK(project_files.id) | - | 관련 파일 ID (캔버스 댓글) |
| parent_id | INT | NULL, FK(comments.id) | - | 대댓글의 부모 댓글 ID |
| author_id | INT | NOT NULL, FK(users.id) | - | 댓글 작성자 ID |
| content | TEXT | NOT NULL | - | 댓글 내용 |
| comment_type | ENUM('GENERAL', 'CANVAS', 'APPROVAL', 'REVISION_REQUEST') | NOT NULL | 'GENERAL' | 댓글 유형 |
| position_x | DECIMAL(8,4) | NULL | - | 캔버스 X 좌표 (비율) |
| position_y | DECIMAL(8,4) | NULL | - | 캔버스 Y 좌표 (비율) |
| canvas_width | INT | NULL | - | 댓글 작성 시 캔버스 너비 |
| canvas_height | INT | NULL | - | 댓글 작성 시 캔버스 높이 |
| is_resolved | BOOLEAN | NOT NULL | FALSE | 해결 완료 여부 |
| resolved_by | INT | NULL, FK(users.id) | - | 해결 처리자 ID |
| resolved_at | TIMESTAMP | NULL | - | 해결 완료일시 |
| priority | ENUM('LOW', 'MEDIUM', 'HIGH') | NOT NULL | 'MEDIUM' | 우선순위 |
| tags | JSON | NULL | - | 태그 목록 |
| attachments | JSON | NULL | - | 첨부파일 정보 |
| is_private | BOOLEAN | NOT NULL | FALSE | 내부 댓글 여부 |
| likes_count | INT | NOT NULL | 0 | 좋아요 수 |
| replies_count | INT | NOT NULL | 0 | 대댓글 수 |
| created_at | TIMESTAMP | NOT NULL | NOW() | 댓글 작성일 |
| updated_at | TIMESTAMP | NOT NULL | NOW() ON UPDATE | 댓글 수정일 |
| deleted_at | TIMESTAMP | NULL | - | 삭제일 (소프트 삭제) |

**비즈니스 규칙**:
- 캔버스 댓글은 position_x, position_y 필수
- 대댓글은 최대 2단계까지만 허용
- 해결된 댓글은 더 이상 수정 불가
- 프라이빗 댓글은 프로젝트 팀원만 확인 가능

### 6. 수정 요청 관리 (revisions)

**목적**: 프로젝트 수정 요청의 상세 내역과 진행 상황을 추적합니다.

| 컬럼명 | 데이터 타입 | 제약조건 | 기본값 | 설명 |
|--------|-------------|----------|--------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | - | 수정 요청 고유 식별자 |
| project_id | INT | NOT NULL, FK(projects.id) | - | 관련 프로젝트 ID |
| revision_number | INT | NOT NULL | - | 수정 회차 번호 |
| requested_by | INT | NOT NULL, FK(users.id) | - | 수정 요청자 ID |
| assigned_to | INT | NULL, FK(users.id) | - | 수정 담당자 ID |
| title | VARCHAR(200) | NOT NULL | - | 수정 요청 제목 |
| description | TEXT | NOT NULL | - | 수정 요청 상세 내용 |
| status | ENUM('REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'REJECTED') | NOT NULL | 'REQUESTED' | 수정 상태 |
| priority | ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') | NOT NULL | 'MEDIUM' | 우선순위 |
| category | VARCHAR(50) | NULL | - | 수정 카테고리 |
| estimated_hours | INT | NULL | - | 예상 작업 시간 |
| actual_hours | INT | NULL | - | 실제 작업 시간 |
| due_date | DATETIME | NULL | - | 수정 완료 기한 |
| before_files | JSON | NULL | - | 수정 전 파일 목록 |
| after_files | JSON | NULL | - | 수정 후 파일 목록 |
| comments_count | INT | NOT NULL | 0 | 관련 댓글 수 |
| approval_required | BOOLEAN | NOT NULL | TRUE | 승인 필요 여부 |
| approved_by | INT | NULL, FK(users.id) | - | 승인자 ID |
| approved_at | TIMESTAMP | NULL | - | 승인일시 |
| rejected_reason | TEXT | NULL | - | 거절 사유 |
| cost | DECIMAL(10,2) | NULL | - | 추가 비용 (유료 수정) |
| created_at | TIMESTAMP | NOT NULL | NOW() | 수정 요청일 |
| updated_at | TIMESTAMP | NOT NULL | NOW() ON UPDATE | 상태 변경일 |
| started_at | TIMESTAMP | NULL | - | 작업 시작일 |
| completed_at | TIMESTAMP | NULL | - | 완료일 |

**비즈니스 규칙**:
- 수정 회차는 프로젝트별로 자동 증가
- 무료 수정 횟수 초과 시 추가 비용 발생
- 수정 완료 후 클라이언트 승인 필요
- 긴급 수정은 우선순위 높음으로 자동 설정

### 7. 알림 시스템 (notifications)

**목적**: 사용자별 알림 메시지와 읽음 상태를 관리합니다.

| 컬럼명 | 데이터 타입 | 제약조건 | 기본값 | 설명 |
|--------|-------------|----------|--------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | - | 알림 고유 식별자 |
| user_id | INT | NOT NULL, FK(users.id) | - | 수신자 사용자 ID |
| project_id | INT | NULL, FK(projects.id) | - | 관련 프로젝트 ID |
| notification_type | VARCHAR(50) | NOT NULL | - | 알림 유형 |
| title | VARCHAR(200) | NOT NULL | - | 알림 제목 |
| message | TEXT | NOT NULL | - | 알림 내용 |
| data | JSON | NULL | - | 추가 데이터 (링크, 버튼 등) |
| priority | ENUM('LOW', 'MEDIUM', 'HIGH') | NOT NULL | 'MEDIUM' | 우선순위 |
| channel | ENUM('IN_APP', 'EMAIL', 'SMS', 'PUSH') | NOT NULL | 'IN_APP' | 알림 채널 |
| is_read | BOOLEAN | NOT NULL | FALSE | 읽음 여부 |
| read_at | TIMESTAMP | NULL | - | 읽음 처리일시 |
| is_delivered | BOOLEAN | NOT NULL | FALSE | 전송 완료 여부 |
| delivered_at | TIMESTAMP | NULL | - | 전송 완료일시 |
| action_url | VARCHAR(1000) | NULL | - | 클릭 시 이동할 URL |
| expires_at | TIMESTAMP | NULL | - | 알림 만료일 |
| created_at | TIMESTAMP | NOT NULL | NOW() | 알림 생성일 |
| updated_at | TIMESTAMP | NOT NULL | NOW() ON UPDATE | 상태 변경일 |

**알림 유형**:
- `PROJECT_CREATED`: 프로젝트 생성
- `PROJECT_ASSIGNED`: 프로젝트 배정
- `COMMENT_ADDED`: 새 댓글 등록
- `REVISION_REQUESTED`: 수정 요청
- `PAYMENT_DUE`: 결제 기한 임박
- `FILE_UPLOADED`: 새 파일 업로드
- `PROJECT_COMPLETED`: 프로젝트 완료

### 8. 활동 로그 (activity_logs)

**목적**: 시스템 내 모든 사용자 활동을 추적하고 감사합니다.

| 컬럼명 | 데이터 타입 | 제약조건 | 기본값 | 설명 |
|--------|-------------|----------|--------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | - | 로그 고유 식별자 |
| user_id | INT | NULL, FK(users.id) | - | 활동 수행자 ID (시스템 작업은 NULL) |
| project_id | INT | NULL, FK(projects.id) | - | 관련 프로젝트 ID |
| entity_type | VARCHAR(50) | NULL | - | 대상 엔티티 타입 |
| entity_id | INT | NULL | - | 대상 엔티티 ID |
| action | VARCHAR(100) | NOT NULL | - | 수행한 액션 |
| description | TEXT | NOT NULL | - | 활동 상세 설명 |
| before_data | JSON | NULL | - | 변경 전 데이터 |
| after_data | JSON | NULL | - | 변경 후 데이터 |
| ip_address | VARCHAR(45) | NULL | - | 접속 IP 주소 |
| user_agent | TEXT | NULL | - | 브라우저 정보 |
| session_id | VARCHAR(255) | NULL | - | 세션 식별자 |
| request_id | VARCHAR(100) | NULL | - | 요청 추적 ID |
| api_endpoint | VARCHAR(200) | NULL | - | 호출된 API 엔드포인트 |
| response_status | INT | NULL | - | HTTP 응답 상태 코드 |
| processing_time | INT | NULL | - | 처리 시간 (ms) |
| created_at | TIMESTAMP | NOT NULL | NOW() | 활동 발생일시 |

**주요 액션 타입**:
- `LOGIN`, `LOGOUT`: 로그인/로그아웃
- `CREATE`, `UPDATE`, `DELETE`: 데이터 조작
- `UPLOAD`, `DOWNLOAD`: 파일 업로드/다운로드
- `COMMENT`, `REPLY`: 댓글 작성
- `APPROVE`, `REJECT`: 승인/거절

### 9. 사용자 세션 (user_sessions)

**목적**: 로그인 세션과 보안을 관리합니다.

| 컬럼명 | 데이터 타입 | 제약조건 | 기본값 | 설명 |
|--------|-------------|----------|--------|------|
| id | VARCHAR(255) | PRIMARY KEY | - | 세션 고유 식별자 |
| user_id | INT | NOT NULL, FK(users.id) | - | 사용자 ID |
| refresh_token | VARCHAR(500) | NULL | - | 리프레시 토큰 |
| device_info | JSON | NULL | - | 디바이스 정보 |
| ip_address | VARCHAR(45) | NULL | - | 로그인 IP |
| user_agent | TEXT | NULL | - | 브라우저 정보 |
| is_active | BOOLEAN | NOT NULL | TRUE | 세션 활성 상태 |
| last_activity | TIMESTAMP | NOT NULL | NOW() | 마지막 활동 시간 |
| expires_at | TIMESTAMP | NOT NULL | - | 세션 만료 시간 |
| created_at | TIMESTAMP | NOT NULL | NOW() | 세션 생성일 |

---

## 관계도

### 핵심 관계
1. **User ↔ Project**: 1:N (클라이언트), 1:N (디자이너)
2. **Project ↔ ProjectFile**: 1:N
3. **Project ↔ Payment**: 1:N
4. **Project ↔ Comment**: 1:N
5. **Project ↔ Revision**: 1:N
6. **User ↔ Notification**: 1:N
7. **Comment ↔ Comment**: 1:N (대댓글)
8. **ProjectFile ↔ Comment**: 1:N (캔버스 댓글)

### 참조 무결성
- 모든 외래키는 CASCADE DELETE 또는 SET NULL 정책 적용
- 사용자 삭제 시 관련 데이터는 익명화 처리
- 프로젝트 삭제 시 하위 데이터는 모두 삭제 (CASCADE)

---

## 인덱스 및 성능 최적화

### 기본 인덱스
```sql
-- 사용자 테이블
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- 프로젝트 테이블
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_designer ON projects(designer_id);
CREATE INDEX idx_projects_deadline ON projects(deadline);
CREATE INDEX idx_projects_created ON projects(created_at);

-- 파일 테이블
CREATE INDEX idx_files_project ON project_files(project_id);
CREATE INDEX idx_files_uploader ON project_files(uploader_id);
CREATE INDEX idx_files_active ON project_files(is_active);
CREATE INDEX idx_files_type ON project_files(upload_type);

-- 댓글 테이블
CREATE INDEX idx_comments_project ON comments(project_id);
CREATE INDEX idx_comments_file ON comments(file_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_created ON comments(created_at);

-- 결제 테이블
CREATE INDEX idx_payments_project ON payments(project_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);

-- 알림 테이블
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
```

### 복합 인덱스
```sql
-- 프로젝트 검색 최적화
CREATE INDEX idx_projects_client_status ON projects(client_id, status);
CREATE INDEX idx_projects_designer_status ON projects(designer_id, status);

-- 파일 버전 관리 최적화
CREATE INDEX idx_files_project_version ON project_files(project_id, version);

-- 댓글 정렬 최적화
CREATE INDEX idx_comments_project_created ON comments(project_id, created_at);

-- 활동 로그 검색 최적화
CREATE INDEX idx_activity_user_created ON activity_logs(user_id, created_at);
CREATE INDEX idx_activity_project_created ON activity_logs(project_id, created_at);
```

### 파티셔닝 전략
```sql
-- 활동 로그 월별 파티셔닝
ALTER TABLE activity_logs PARTITION BY RANGE (MONTH(created_at)) (
    PARTITION p202401 VALUES LESS THAN (2),
    PARTITION p202402 VALUES LESS THAN (3),
    -- ... 월별 파티션 추가
);

-- 알림 테이블 분기별 파티셔닝
ALTER TABLE notifications PARTITION BY RANGE (QUARTER(created_at)) (
    PARTITION q2024_1 VALUES LESS THAN (2),
    PARTITION q2024_2 VALUES LESS THAN (3),
    -- ... 분기별 파티션 추가
);
```

---

## API 엔드포인트 매핑

### 인증 관련
- `POST /api/auth/register` → users 테이블
- `POST /api/auth/login` → users, user_sessions 테이블
- `POST /api/auth/logout` → user_sessions 테이블
- `POST /api/auth/refresh` → user_sessions 테이블

### 프로젝트 관리
- `GET /api/projects` → projects 테이블 (목록 조회)
- `POST /api/projects` → projects 테이블 (생성)
- `GET /api/projects/:id` → projects, project_files 테이블 (상세 조회)
- `PUT /api/projects/:id` → projects 테이블 (수정)
- `DELETE /api/projects/:id` → projects 테이블 (삭제)

### 파일 관리
- `POST /api/projects/:id/files` → project_files 테이블 (업로드)
- `GET /api/projects/:id/files` → project_files 테이블 (목록)
- `DELETE /api/files/:id` → project_files 테이블 (삭제)
- `GET /api/files/:id/download` → project_files 테이블 (다운로드)

### 댓글 시스템
- `POST /api/projects/:id/comments` → comments 테이블 (댓글 작성)
- `GET /api/projects/:id/comments` → comments 테이블 (댓글 목록)
- `PUT /api/comments/:id` → comments 테이블 (댓글 수정)
- `DELETE /api/comments/:id` → comments 테이블 (댓글 삭제)

### 결제 관리
- `GET /api/projects/:id/payments` → payments 테이블 (결제 내역)
- `POST /api/payments/:id/process` → payments 테이블 (결제 처리)
- `PUT /api/payments/:id/status` → payments 테이블 (상태 변경)

---

## Prisma 스키마

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id             Int       @id @default(autoincrement())
  role           Role      @default(CLIENT)
  name           String    @db.VarChar(100)
  email          String    @unique @db.VarChar(255)
  password       String    @db.VarChar(255)
  phone          String?   @db.VarChar(20)
  profileImage   String?   @map("profile_image") @db.VarChar(500)
  bio            String?   @db.Text
  portfolioUrl   String?   @map("portfolio_url") @db.VarChar(500)
  company        String?   @db.VarChar(200)
  isActive       Boolean   @default(true) @map("is_active")
  emailVerified  Boolean   @default(false) @map("email_verified")
  lastLoginAt    DateTime? @map("last_login_at")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  // 관계
  clientProjects    Project[]     @relation("ClientProjects")
  designerProjects  Project[]     @relation("DesignerProjects")
  uploadedFiles     ProjectFile[]
  comments          Comment[]
  revisions         Revision[]
  notifications     Notification[]
  activityLogs      ActivityLog[]
  sessions          UserSession[]

  @@map("users")
}

model Project {
  id              Int           @id @default(autoincrement())
  title           String        @db.VarChar(200)
  description     String?       @db.Text
  category        String?       @db.VarChar(50)
  status          ProjectStatus @default(PENDING)
  priority        Priority      @default(MEDIUM)
  clientId        Int           @map("client_id")
  designerId      Int?          @map("designer_id")
  budget          Decimal?      @db.Decimal(12, 2)
  currency        String        @default("KRW") @db.VarChar(3)
  startDate       DateTime?     @map("start_date") @db.Date
  deadline        DateTime?
  estimatedHours  Int?          @map("estimated_hours")
  actualHours     Int           @default(0) @map("actual_hours")
  revisionCount   Int           @default(3) @map("revision_count")
  usedRevisions   Int           @default(0) @map("used_revisions")
  completionRate  Int           @default(0) @map("completion_rate")
  requirements    Json?
  deliverables    Json?
  notes           String?       @db.Text
  isPublic        Boolean       @default(false) @map("is_public")
  rating          Decimal?      @db.Decimal(2, 1)
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")
  completedAt     DateTime?     @map("completed_at")

  // 관계
  client        User           @relation("ClientProjects", fields: [clientId], references: [id])
  designer      User?          @relation("DesignerProjects", fields: [designerId], references: [id])
  files         ProjectFile[]
  payments      Payment[]
  comments      Comment[]
  revisions     Revision[]
  notifications Notification[]
  activityLogs  ActivityLog[]

  @@map("projects")
}

model ProjectFile {
  id              Int         @id @default(autoincrement())
  projectId       Int         @map("project_id")
  fileName        String      @map("file_name") @db.VarChar(255)
  originalName    String      @map("original_name") @db.VarChar(255)
  filePath        String      @map("file_path") @db.VarChar(1000)
  fileSize        BigInt      @map("file_size")
  mimeType        String      @map("mime_type") @db.VarChar(100)
  fileExtension   String      @map("file_extension") @db.VarChar(10)
  uploaderId      Int         @map("uploader_id")
  uploadType      UploadType  @default(DRAFT) @map("upload_type")
  version         Int         @default(1)
  parentFileId    Int?        @map("parent_file_id")
  isActive        Boolean     @default(true) @map("is_active")
  isDownloadable  Boolean     @default(true) @map("is_downloadable")
  downloadCount   Int         @default(0) @map("download_count")
  thumbnailPath   String?     @map("thumbnail_path") @db.VarChar(1000)
  metadata        Json?
  checksum        String?     @db.VarChar(64)
  expiresAt       DateTime?   @map("expires_at")
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")

  // 관계
  project      Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  uploader     User          @relation(fields: [uploaderId], references: [id])
  parentFile   ProjectFile?  @relation("FileVersions", fields: [parentFileId], references: [id])
  childFiles   ProjectFile[] @relation("FileVersions")
  comments     Comment[]

  @@map("project_files")
}

model Payment {
  id             Int           @id @default(autoincrement())
  projectId      Int           @map("project_id")
  paymentType    PaymentType   @map("payment_type")
  amount         Decimal       @db.Decimal(12, 2)
  currency       String        @default("KRW") @db.VarChar(3)
  percentage     Decimal?      @db.Decimal(5, 2)
  status         PaymentStatus @default(PENDING)
  paymentMethod  String?       @map("payment_method") @db.VarChar(50)
  transactionId  String?       @map("transaction_id") @db.VarChar(200)
  receiptUrl     String?       @map("receipt_url") @db.VarChar(1000)
  dueDate        DateTime?     @map("due_date")
  paidAt         DateTime?     @map("paid_at")
  failedReason   String?       @map("failed_reason") @db.Text
  refundAmount   Decimal?      @map("refund_amount") @db.Decimal(12, 2)
  refundedAt     DateTime?     @map("refunded_at")
  notes          String?       @db.Text
  createdAt      DateTime      @default(now()) @map("created_at")
  updatedAt      DateTime      @updatedAt @map("updated_at")

  // 관계
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@map("payments")
}

model Comment {
  id            Int         @id @default(autoincrement())
  projectId     Int         @map("project_id")
  fileId        Int?        @map("file_id")
  parentId      Int?        @map("parent_id")
  authorId      Int         @map("author_id")
  content       String      @db.Text
  commentType   CommentType @default(GENERAL) @map("comment_type")
  positionX     Decimal?    @map("position_x") @db.Decimal(8, 4)
  positionY     Decimal?    @map("position_y") @db.Decimal(8, 4)
  canvasWidth   Int?        @map("canvas_width")
  canvasHeight  Int?        @map("canvas_height")
  isResolved    Boolean     @default(false) @map("is_resolved")
  resolvedBy    Int?        @map("resolved_by")
  resolvedAt    DateTime?   @map("resolved_at")
  priority      Priority    @default(MEDIUM)
  tags          Json?
  attachments   Json?
  isPrivate     Boolean     @default(false) @map("is_private")
  likesCount    Int         @default(0) @map("likes_count")
  repliesCount  Int         @default(0) @map("replies_count")
  createdAt     DateTime    @default(now()) @map("created_at")
  updatedAt     DateTime    @updatedAt @map("updated_at")
  deletedAt     DateTime?   @map("deleted_at")

  // 관계
  project    Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  file       ProjectFile? @relation(fields: [fileId], references: [id], onDelete: Cascade)
  author     User         @relation(fields: [authorId], references: [id])
  resolver   User?        @relation("CommentResolver", fields: [resolvedBy], references: [id])
  parent     Comment?     @relation("CommentReplies", fields: [parentId], references: [id])
  replies    Comment[]    @relation("CommentReplies")

  @@map("comments")
}

model Revision {
  id             Int            @id @default(autoincrement())
  projectId      Int            @map("project_id")
  revisionNumber Int            @map("revision_number")
  requestedBy    Int            @map("requested_by")
  assignedTo     Int?           @map("assigned_to")
  title          String         @db.VarChar(200)
  description    String         @db.Text
  status         RevisionStatus @default(REQUESTED)
  priority       Priority       @default(MEDIUM)
  category       String?        @db.VarChar(50)
  estimatedHours Int?           @map("estimated_hours")
  actualHours    Int?           @map("actual_hours")
  dueDate        DateTime?      @map("due_date")
  beforeFiles    Json?          @map("before_files")
  afterFiles     Json?          @map("after_files")
  commentsCount  Int            @default(0) @map("comments_count")
  approvalRequired Boolean       @default(true) @map("approval_required")
  approvedBy     Int?           @map("approved_by")
  approvedAt     DateTime?      @map("approved_at")
  rejectedReason String?        @map("rejected_reason") @db.Text
  cost           Decimal?       @db.Decimal(10, 2)
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")
  startedAt      DateTime?      @map("started_at")
  completedAt    DateTime?      @map("completed_at")

  // 관계
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  requester User    @relation(fields: [requestedBy], references: [id])
  assignee  User?   @relation("RevisionAssignee", fields: [assignedTo], references: [id])
  approver  User?   @relation("RevisionApprover", fields: [approvedBy], references: [id])

  @@map("revisions")
}

model Notification {
  id               Int      @id @default(autoincrement())
  userId           Int      @map("user_id")
  projectId        Int?     @map("project_id")
  notificationType String   @map("notification_type") @db.VarChar(50)
  title            String   @db.VarChar(200)
  message          String   @db.Text
  data             Json?
  priority         Priority @default(MEDIUM)
  channel          NotificationChannel @default(IN_APP)
  isRead           Boolean  @default(false) @map("is_read")
  readAt           DateTime? @map("read_at")
  isDelivered      Boolean  @default(false) @map("is_delivered")
  deliveredAt      DateTime? @map("delivered_at")
  actionUrl        String?  @map("action_url") @db.VarChar(1000)
  expiresAt        DateTime? @map("expires_at")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  // 관계
  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  project Project? @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@map("notifications")
}

model ActivityLog {
  id              Int      @id @default(autoincrement())
  userId          Int?     @map("user_id")
  projectId       Int?     @map("project_id")
  entityType      String?  @map("entity_type") @db.VarChar(50)
  entityId        Int?     @map("entity_id")
  action          String   @db.VarChar(100)
  description     String   @db.Text
  beforeData      Json?    @map("before_data")
  afterData       Json?    @map("after_data")
  ipAddress       String?  @map("ip_address") @db.VarChar(45)
  userAgent       String?  @map("user_agent") @db.Text
  sessionId       String?  @map("session_id") @db.VarChar(255)
  requestId       String?  @map("request_id") @db.VarChar(100)
  apiEndpoint     String?  @map("api_endpoint") @db.VarChar(200)
  responseStatus  Int?     @map("response_status")
  processingTime  Int?     @map("processing_time")
  createdAt       DateTime @default(now()) @map("created_at")

  // 관계
  user    User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  project Project? @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@map("activity_logs")
}

model UserSession {
  id           String   @id @db.VarChar(255)
  userId       Int      @map("user_id")
  refreshToken String?  @map("refresh_token") @db.VarChar(500)
  deviceInfo   Json?    @map("device_info")
  ipAddress    String?  @map("ip_address") @db.VarChar(45)
  userAgent    String?  @map("user_agent") @db.Text
  isActive     Boolean  @default(true) @map("is_active")
  lastActivity DateTime @default(now()) @map("last_activity")
  expiresAt    DateTime @map("expires_at")
  createdAt    DateTime @default(now()) @map("created_at")

  // 관계
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_sessions")
}

// 열거형 정의
enum Role {
  DESIGNER
  CLIENT
}

enum ProjectStatus {
  PENDING
  ASSIGNED
  IN_PROGRESS
  REVIEW
  REVISION
  COMPLETED
  CANCELLED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum UploadType {
  REFERENCE
  DRAFT
  FINAL
  REVISION
}

enum PaymentType {
  DOWN_PAYMENT
  INTERIM_PAYMENT
  FINAL_PAYMENT
  EXTRA_REVISION
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
  CANCELLED
}

enum CommentType {
  GENERAL
  CANVAS
  APPROVAL
  REVISION_REQUEST
}

enum RevisionStatus {
  REQUESTED
  ACCEPTED
  IN_PROGRESS
  REVIEW
  COMPLETED
  REJECTED
}

enum NotificationChannel {
  IN_APP
  EMAIL
  SMS
  PUSH
}
```

---

## 보안 고려사항

### 데이터 암호화
- 비밀번호: bcrypt 해시 (최소 12 rounds)
- 민감한 개인정보: AES-256 암호화
- API 통신: HTTPS 필수

### 접근 제어
- 역할 기반 접근 제어 (RBAC)
- 프로젝트별 권한 관리
- API 레이트 리미팅

### 데이터 무결성
- 외래키 제약조건
- 체크 제약조건
- 트랜잭션 관리

### 백업 및 복구
- 일일 자동 백업
- 포인트 인 타임 복구
- 재해 복구 계획

---

## 성능 모니터링

### 주요 메트릭
- 쿼리 실행 시간
- 커넥션 풀 사용률
- 슬로우 쿼리 로그
- 디스크 I/O 모니터링

### 알림 기준
- 응답 시간 > 1초
- 커넥션 풀 사용률 > 80%
- 슬로우 쿼리 발생
- 디스크 사용률 > 90%

---

이 문서는 OneMoreRev MVP 프로젝트의 데이터베이스 설계 가이드로, 실제 구현 시 참고하여 사용하시기 바랍니다.