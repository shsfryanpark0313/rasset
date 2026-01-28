# 로그인 "fetch failed" 에러 해결 가이드

## 🔍 현재 에러 분석

**에러 메시지:**
- `POST http://localhost:3000/api/admin/login` → `401 Unauthorized`
- 응답: `{success: false, message: 'Login failed', error: 'fetch failed'}`

**의미:**
"fetch failed"는 Supabase API 호출이 실패했다는 의미입니다. 이는 다음 중 하나일 수 있습니다:

1. **서버가 실행되지 않음**
2. **Supabase 환경 변수가 설정되지 않음**
3. **Supabase 연결 실패** (네트워크 문제 또는 잘못된 인증 정보)

---

## ✅ 단계별 해결 방법

### 1단계: 백엔드 서버 실행 확인

**터미널에서 확인:**
```bash
# 서버 디렉토리로 이동
cd rasset-voc/server

# 서버 실행
npm run dev
```

**예상 출력:**
```
🚀 Server running on http://localhost:3000
✅ Production mode - Mock disabled
```

**서버가 실행되지 않았다면:**
- 포트 3000이 다른 프로그램에서 사용 중인지 확인
- `package.json`의 `dev` 스크립트 확인
- 서버 로그에 에러가 있는지 확인

---

### 2단계: 서버 환경 변수 확인

**파일 위치:** `rasset-voc/server/.env`

**필수 항목:**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**확인 방법:**
1. `.env` 파일이 존재하는지 확인
2. `SUPABASE_URL`이 올바른지 확인 (Supabase Dashboard > Settings > API > Project URL)
3. `SUPABASE_SERVICE_ROLE_KEY`가 올바른지 확인 (Supabase Dashboard > Settings > API > Service Role Key)
   - ⚠️ **주의**: `anon key`가 아니라 `service_role key`여야 합니다!

**환경 변수 확인 후:**
- 서버를 **재시작**해야 합니다 (환경 변수 변경은 재시작 후 적용)

---

### 3단계: 서버 로그 확인

로그인 시도 시 서버 콘솔에 다음 메시지가 표시되어야 합니다:

**정상적인 경우:**
```
🔐 Attempting login for: gngss@gngss.co.kr
✅ Admin found: gngss@gngss.co.kr (admin)
✅ Login successful for: gngss@gngss.co.kr
```

**에러가 있는 경우:**
```
❌ Supabase admin client is not initialized
```
→ 환경 변수가 설정되지 않았습니다.

```
❌ Supabase login error: fetch failed
```
→ Supabase API 호출 실패 (네트워크 문제 또는 잘못된 인증 정보)

---

### 4단계: Supabase 연결 테스트

**서버 콘솔에서 확인:**
서버 시작 시 다음 메시지가 표시되어야 합니다:
- `✅ Supabase connected` (정상)
- `⚠️ [DEV MODE] Supabase credentials missing` (환경 변수 없음)

**수동 테스트:**
Supabase Dashboard > SQL Editor에서 실행:
```sql
-- 연결 테스트
SELECT NOW() as current_time;
```

---

### 5단계: 네트워크 연결 확인

**브라우저에서 직접 테스트:**
```
http://localhost:3000/health
```

**예상 응답:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**연결이 안 되면:**
- 서버가 실행 중인지 확인
- 방화벽이 포트 3000을 차단하는지 확인
- 다른 프로그램이 포트 3000을 사용하는지 확인

---

## 🔧 빠른 해결 체크리스트

다음을 순서대로 확인하세요:

- [ ] **백엔드 서버가 실행 중인가?**
  ```bash
  cd rasset-voc/server
  npm run dev
  ```

- [ ] **서버의 `.env` 파일이 존재하는가?**
  - 파일 위치: `rasset-voc/server/.env`

- [ ] **`SUPABASE_URL`이 올바른가?**
  - Supabase Dashboard > Settings > API > Project URL 확인

- [ ] **`SUPABASE_SERVICE_ROLE_KEY`가 올바른가?**
  - Supabase Dashboard > Settings > API > Service Role Key 확인
  - ⚠️ `anon key`가 아니라 `service_role key`여야 합니다!

- [ ] **서버를 재시작했는가?**
  - 환경 변수 변경 후 반드시 서버 재시작 필요

- [ ] **서버 로그에 에러가 없는가?**
  - 서버 콘솔에서 에러 메시지 확인

- [ ] **`http://localhost:3000/health` 접속이 되는가?**
  - 브라우저에서 직접 접속 테스트

---

## 🧪 디버깅 명령어

### 서버 상태 확인
```bash
# 서버 디렉토리로 이동
cd rasset-voc/server

# 환경 변수 확인 (Windows PowerShell)
Get-Content .env

# 환경 변수 확인 (Linux/Mac)
cat .env

# 서버 실행
npm run dev
```

### 클라이언트에서 API 테스트
브라우저 개발자 도구 (F12) > Console 탭에서 실행:
```javascript
// API 연결 테스트
fetch('http://localhost:3000/health')
  .then(res => res.json())
  .then(data => console.log('✅ 서버 연결 성공:', data))
  .catch(err => console.error('❌ 서버 연결 실패:', err));
```

---

## 💡 자주 발생하는 문제

### 문제 1: "Supabase admin client is not initialized"

**원인:** 환경 변수가 설정되지 않음

**해결:**
1. `rasset-voc/server/.env` 파일 확인
2. `SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY` 설정
3. 서버 재시작

---

### 문제 2: "fetch failed" (Supabase API 호출 실패)

**원인:**
- 잘못된 Supabase URL 또는 Service Role Key
- 네트워크 연결 문제
- Supabase 프로젝트가 일시 중지됨

**해결:**
1. Supabase Dashboard에서 프로젝트 상태 확인
2. Settings > API에서 URL과 Key 재확인
3. Service Role Key가 올바른지 확인 (anon key가 아님)
4. 네트워크 연결 확인

---

### 문제 3: 서버가 시작되지 않음

**원인:**
- 포트 3000이 이미 사용 중
- 의존성 패키지 미설치

**해결:**
```bash
# 의존성 설치
cd rasset-voc/server
npm install

# 포트 변경 (선택사항)
# .env 파일에 추가: PORT=3001
```

---

## 📞 추가 도움말

문제가 계속되면 다음 정보를 확인하세요:

1. **서버 로그 전체 내용** (에러 메시지 포함)
2. **`.env` 파일 내용** (민감한 정보는 제외)
3. **브라우저 콘솔 에러** (F12 > Console)
4. **네트워크 탭** (F12 > Network > `/api/admin/login` 요청)

---

## ✅ 성공 확인

로그인이 성공하면:
- 서버 로그: `✅ Login successful for: gngss@gngss.co.kr`
- 브라우저: `/admin/dashboard`로 자동 이동
- 대시보드에 통계 및 피드백 목록 표시
