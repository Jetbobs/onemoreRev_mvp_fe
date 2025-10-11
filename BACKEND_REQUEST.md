# 백엔드 수정 요청: 리비전 제출 로그에 revisionNo 추가

## 요청 날짜
2025-10-11

## 요청자
프론트엔드 팀

## 문제 상황

프로젝트 타임라인에서 **리비전 제출** 활동의 리비전 번호가 표시되지 않습니다.

### 현재 타임라인 표시 예시:
- ✅ 홍길동님이 **Rev 2**를 시작했습니다
- ❌ 홍길동님이 **Rev** 을 제출했습니다 (번호 없음)
- ✅ 게스트님이 **Rev 2**의 검토를 완료했습니다

---

## 원인 분석

`/api/v1/project/logs` API 응답에서 **리비전 제출 로그의 params에 `revisionNo`가 누락**되어 있습니다.

### 현재 백엔드 로그 데이터 비교:

#### 1. 리비전 생성 (정상 ✅)
```json
{
  "msg": "리비전을 생성하였습니다. (리비전 ID: 83, 리비전 번호: 2)",
  "params": {
    "revisionId": 83,
    "revisionNo": 2,        // ← revisionNo 있음 ✅
    "projectId": 26
  }
}
```

#### 2. 리비전 제출 (문제 ❌)
```json
{
  "msg": "리비전을 제출하였습니다. (리비전 ID: 82, 업로드된 파일 수: 2개)",
  "params": {
    "revisionId": 82,
    "projectId": 26,
    "projectName": "트랙필터",
    "fileCount": 2,
    "description": ""
    // ← revisionNo 없음 ❌
  }
}
```

#### 3. 리뷰 완료 (정상 ✅)
```json
{
  "msg": "게스트가 리뷰를 완료하였습니다. (게스트명: 트랙, 리비전 번호: 1)",
  "params": {
    "revisionId": 82,
    "revisionNo": 1,        // ← revisionNo 있음 ✅
    "projectId": 26,
    ...
  }
}
```

---

## 요청 사항

**리비전 제출 로그를 기록하는 백엔드 코드에서 `params`에 `revisionNo` 추가 요청**

### 수정 전 (현재):
```javascript
await activityLogService.createLog({
  projectId: revision.projectId,
  userId: userId,
  msg: `리비전을 제출하였습니다. (리비전 ID: ${revisionId}, 업로드된 파일 수: ${fileCount}개)`,
  params: {
    revisionId: revisionId,
    projectId: revision.projectId,
    projectName: project.name,
    fileCount: fileCount,
    description: description || ''
  }
});
```

### 수정 후 (요청):
```javascript
await activityLogService.createLog({
  projectId: revision.projectId,
  userId: userId,
  msg: `리비전을 제출하였습니다. (리비전 ID: ${revisionId}, 업로드된 파일 수: ${fileCount}개)`,
  params: {
    revisionId: revisionId,
    revisionNo: revision.revNo,     // ← 추가 요청
    projectId: revision.projectId,
    projectName: project.name,
    fileCount: fileCount,
    description: description || ''
  }
});
```

---

## 기대 결과

수정 후 API 응답:
```json
{
  "msg": "리비전을 제출하였습니다. (리비전 ID: 82, 업로드된 파일 수: 2개)",
  "params": {
    "revisionId": 82,
    "revisionNo": 1,        // ← 추가됨 ✅
    "projectId": 26,
    "projectName": "트랙필터",
    "fileCount": 2,
    "description": ""
  }
}
```

프론트엔드 타임라인 표시:
- ✅ 홍길동님이 **Rev 1**을 제출했습니다 (2개 파일)
- ✅ 홍길동님이 **Rev 2**를 제출했습니다 (1개 파일)

---

## 영향 범위

- **수정 파일**: 리비전 제출 API 컨트롤러/서비스
- **API 엔드포인트**: 리비전 제출 처리 로직
- **DB 변경**: 없음 (기존 params JSON에 필드만 추가)
- **하위 호환성**: 영향 없음 (필드 추가만 있고 제거 없음)

---

## 참고 정보

- **관련 API**: `/api/v1/project/logs`
- **프론트엔드 파일**: `src/components/project-timeline.tsx`
- **테스트 프로젝트 ID**: 26
- **테스트 리비전 ID**: 82, 83, 84, 85

---

## 우선순위
🔴 **Medium** - UI 표시 문제로 사용자 경험에 영향

## 예상 작업 시간
⏱️ 약 10분 (필드 1개 추가)

---

감사합니다!
