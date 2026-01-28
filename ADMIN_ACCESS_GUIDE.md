# 관리자 페이지 접속 가이드

관리자 페이지에 접속하는 방법을 단계별로 상세하게 안내합니다.

---

## 📍 접속 URL

### 로컬 개발 환경
- **로그인 페이지**: `http://localhost:5173/admin/login`
- **대시보드**: `http://localhost:5173/admin/dashboard` (로그인 후 자동 이동)

### 프로덕션 환경
- **로그인 페이지**: `https://your-domain.com/admin/login`
- **대시보드**: `https://your-domain.com/admin/dashboard` (로그인 후 자동 이동)

---

## 🚀 접속 전 확인사항

### 1단계: 서버가 실행 중인지 확인

**클라이언트 서버 (프론트엔드)**
```bash
# 클라이언트 디렉토리로 이동
cd rasset-voc/client

# 서버 실행 확인
# 터미널에 다음과 같은 메시지가 보여야 합니다:
# VITE v5.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
```

**백엔드 서버 (API)**
```bash
# 서버 디렉토리로 이동
cd rasset-voc/server

# 서버 실행 확인
# 터미널에 다음과 같은 메시지가 보여야 합니다:
# Server running on port 3000
# ✅ Supabase connected
```

**서버가 실행되지 않았다면:**
```bash
# 클라이언트 서버 시작
cd rasset-voc/client
npm run dev

# 백엔드 서버 시작 (새 터미널)
cd rasset-voc/server
npm run dev
```

---

### 2단계: 환경 변수 확인

**서버 환경 변수** (`rasset-voc/server/.env`)
```env
# 필수 항목
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# 선택 항목
NODE_ENV=development
ALLOW_MOCK=false
CLIENT_URL=http://localhost:5173
PORT=3000
```

**클라이언트 환경 변수** (`rasset-voc/client/.env`)
```env
# 필수 항목
VITE_API_BASE_URL=http://localhost:3000/api
```

**확인 방법:**
1. `.env` 파일이 존재하는지 확인
2. `SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`가 올바르게 설정되었는지 확인
3. 서버를 재시작 (환경 변수 변경 후 반드시 필요)

---

### 3단계: 관리자 계정 확인

**Supabase Dashboard에서 확인:**

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. **Authentication** > **Users** 메뉴 클릭
4. 관리자 이메일로 사용자가 있는지 확인

**SQL로 확인:**
```sql
-- 1. Auth에 사용자가 있는지 확인
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'your-email@example.com';

-- 2. admins 테이블에 등록되어 있는지 확인
SELECT id, email, display_name, role, created_at 
FROM public.admins 
WHERE email = 'your-email@example.com';
```

**관리자 계정이 없다면:**
- [ADMIN_SETUP.md](./server/ADMIN_SETUP.md) 파일을 참고하여 계정 생성

---

## 🔐 로그인 절차

### 1단계: 로그인 페이지 접속

브라우저에서 다음 URL로 접속:
```
http://localhost:5173/admin/login
```

**예상 화면:**
- "관리자 로그인" 제목
- 이메일 입력 필드
- 비밀번호 입력 필드
- "로그인" 버튼

---

### 2단계: 로그인 정보 입력

**필수 정보:**
- **이메일**: Supabase Auth에 등록된 관리자 이메일
- **비밀번호**: 관리자 계정의 비밀번호

**주의사항:**
- 이메일과 비밀번호는 대소문자를 구분합니다
- 공백이 포함되어 있지 않은지 확인하세요

---

### 3단계: 로그인 버튼 클릭

"로그인" 버튼을 클릭하면:
1. 서버로 로그인 요청 전송
2. Supabase Auth에서 인증 확인
3. `admins` 테이블에서 권한 확인
4. 성공 시 대시보드로 자동 이동

---

## ❌ 접속 실패 시 해결 방법

### 문제 1: "페이지를 찾을 수 없습니다" (404 에러)

**원인:**
- 클라이언트 서버가 실행되지 않음
- 잘못된 URL 접속

**해결:**
1. 클라이언트 서버 실행 확인
2. URL이 `http://localhost:5173/admin/login`인지 확인
3. 브라우저 캐시 삭제 후 재시도

---

### 문제 2: "로그인에 실패했습니다" (401 에러)

**원인:**
- 이메일 또는 비밀번호 불일치
- 이메일 미확인
- `admins` 테이블에 등록되지 않음

**해결:**

**A. 이메일/비밀번호 확인**
```sql
-- Supabase Dashboard > SQL Editor에서 실행
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'your-email@example.com';
```

**B. 이메일 확인 처리**
```sql
-- 이메일이 확인되지 않았다면
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'your-email@example.com';
```

**C. admins 테이블에 추가**
```sql
-- admins 테이블에 관리자 추가
INSERT INTO public.admins (id, email, display_name, role)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
    'your-email@example.com',
    '관리자',
    'admin'
)
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email;
```

**D. 비밀번호 재설정**
1. Supabase Dashboard > Authentication > Users
2. 해당 사용자 선택
3. "Reset password" 버튼 클릭
4. 새 비밀번호 설정

---

### 문제 3: "Authentication service unavailable" (503 에러)

**원인:**
- 서버 환경 변수가 설정되지 않음
- Supabase 연결 실패

**해결:**
1. 서버의 `.env` 파일 확인
2. `SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY` 확인
3. Service Role Key가 올바른지 확인 (anon key가 아님)
4. 서버 재시작

---

### 문제 4: "Access denied. Admin privileges required." (403 에러)

**원인:**
- 로그인은 성공했지만 `admins` 테이블에 등록되지 않음

**해결:**
```sql
-- admins 테이블에 추가
INSERT INTO public.admins (id, email, display_name, role)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
    'your-email@example.com',
    '관리자',
    'admin'
)
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email;
```

---

### 문제 5: "데이터 로드 실패" (대시보드 접속 후)

**원인:**
- 토큰이 만료됨
- 서버 연결 실패
- 권한 문제

**해결:**
1. 브라우저 개발자 도구 (F12) > Console 탭 확인
2. 네트워크 탭에서 API 요청 상태 확인
3. `localStorage`에서 `admin_token` 확인
4. 토큰이 없다면 다시 로그인
5. 서버 로그 확인

---

## 🔍 디버깅 체크리스트

접속이 안 될 때 다음을 순서대로 확인하세요:

- [ ] 클라이언트 서버가 실행 중인가? (`http://localhost:5173` 접속 가능한가?)
- [ ] 백엔드 서버가 실행 중인가? (`http://localhost:3000` 접속 가능한가?)
- [ ] 서버의 `.env` 파일이 올바르게 설정되었는가?
- [ ] 클라이언트의 `.env` 파일이 올바르게 설정되었는가?
- [ ] Supabase Auth에 관리자 계정이 등록되어 있는가?
- [ ] 이메일이 확인되었는가? (`email_confirmed_at`이 NULL이 아님)
- [ ] `admins` 테이블에 관리자가 등록되어 있는가?
- [ ] `auth.users.id`와 `admins.id`가 일치하는가?
- [ ] 비밀번호가 올바른가?
- [ ] 브라우저 콘솔에 에러가 없는가?
- [ ] 서버 로그에 에러가 없는가?

---

## 🧪 빠른 테스트 방법

### 1. 완전한 확인 쿼리 실행

Supabase SQL Editor에서 실행:

```sql
-- 모든 것을 한 번에 확인
WITH user_info AS (
    SELECT 
        id,
        email,
        email_confirmed_at,
        created_at as user_created_at
    FROM auth.users 
    WHERE email = 'your-email@example.com'
),
admin_info AS (
    SELECT 
        id,
        email,
        display_name,
        role,
        created_at as admin_created_at
    FROM public.admins
    WHERE email = 'your-email@example.com'
)
SELECT 
    u.id as user_id,
    u.email,
    u.email_confirmed_at,
    u.user_created_at,
    a.id as admin_id,
    a.display_name,
    a.role,
    a.admin_created_at,
    CASE 
        WHEN u.id IS NULL THEN '❌ Auth에 사용자 없음'
        WHEN u.email_confirmed_at IS NULL THEN '⚠️ 이메일 미확인'
        WHEN a.id IS NULL THEN '⚠️ admins 테이블에 없음'
        WHEN u.id != a.id THEN '❌ ID 불일치'
        ELSE '✅ 정상'
    END as status
FROM user_info u
FULL OUTER JOIN admin_info a ON u.id = a.id;
```

**결과 해석:**
- `✅ 정상`: 모든 것이 올바르게 설정됨
- `❌ Auth에 사용자 없음`: Supabase Auth에 사용자 생성 필요
- `⚠️ 이메일 미확인`: 이메일 확인 처리 필요
- `⚠️ admins 테이블에 없음`: `admins` 테이블에 추가 필요
- `❌ ID 불일치`: `auth.users.id`와 `admins.id`가 일치하지 않음

---

### 2. 서버 로그 확인

로그인 시도 시 서버 콘솔에 다음 메시지가 표시되어야 합니다:

```
🔐 Attempting login for: your-email@example.com
✅ Admin found: your-email@example.com (admin)
```

**에러 메시지 예시:**
- `❌ Supabase login error: Invalid login credentials` → 이메일/비밀번호 불일치
- `❌ Supabase login error: Email not confirmed` → 이메일 확인 필요
- `⚠️ User is not in admins table` → `admins` 테이블에 추가 필요

---

### 3. 브라우저 개발자 도구 확인

**F12** 키를 눌러 개발자 도구 열기:

1. **Console 탭**: 에러 메시지 확인
2. **Network 탭**: 
   - `/api/admin/login` 요청이 성공했는지 확인
   - 응답 코드 확인 (200: 성공, 401: 인증 실패, 403: 권한 없음)
   - 응답 본문 확인

---

## 📝 단계별 접속 가이드 요약

### 처음부터 시작하는 경우

1. **서버 실행**
   ```bash
   # 터미널 1: 클라이언트
   cd rasset-voc/client
   npm run dev
   
   # 터미널 2: 백엔드
   cd rasset-voc/server
   npm run dev
   ```

2. **관리자 계정 확인/생성**
   - Supabase Dashboard에서 확인
   - 없으면 [ADMIN_SETUP.md](./server/ADMIN_SETUP.md) 참고하여 생성

3. **로그인 페이지 접속**
   ```
   http://localhost:5173/admin/login
   ```

4. **로그인 정보 입력**
   - 이메일: 관리자 이메일
   - 비밀번호: 관리자 비밀번호

5. **대시보드 확인**
   - 로그인 성공 시 자동으로 `/admin/dashboard`로 이동
   - 통계 및 피드백 목록 확인

---

## 🔗 관련 문서

- [관리자 계정 등록 가이드](./server/ADMIN_SETUP.md)
- [로그인 문제 디버깅 가이드](./server/DEBUG_LOGIN.md)
- [환경 변수 설정 가이드](./server/ENV_SETUP.md)

---

## 💡 추가 팁

1. **자동 로그인**: 로그인 성공 시 토큰이 `localStorage`에 저장됩니다. 브라우저를 닫아도 토큰이 유지되면 자동으로 로그인됩니다.

2. **토큰 확인**: 브라우저 개발자 도구 > Application > Local Storage > `admin_token` 확인

3. **토큰 삭제**: 로그아웃하려면 `localStorage.removeItem('admin_token')` 실행 또는 브라우저 캐시 삭제

4. **CORS 에러**: 클라이언트와 서버가 다른 포트에서 실행될 때 발생할 수 있습니다. 서버의 CORS 설정 확인

---

**문제가 계속되면:**
1. 서버 로그 확인
2. 브라우저 콘솔 확인
3. Supabase Dashboard에서 사용자 상태 확인
4. [DEBUG_LOGIN.md](./server/DEBUG_LOGIN.md) 참고
