# 🚀 서버 실행 가이드 (SERVER_START_GUIDE.md)

RASSET VOC 시스템은 **프론트엔드(화면)**와 **백엔드(데이터)**가 분리되어 있습니다.
정상적으로 서비스를 이용하려면 **두 개의 서버를 동시에 실행**해야 합니다.

---

## 📂 프로젝트 구조 이해

이 프로젝트는 두 개의 독립적인 애플리케이션으로 구성됩니다:

1.  **Backend Server (백엔드)**
    *   **위치**: `rasset-voc/server`
    *   **포트**: `3000` (`http://localhost:3000`)
    *   **역할**: 데이터베이스 통신, API 제공, 데이터 처리

2.  **Client Application (프론트엔드)**
    *   **위치**: `rasset-voc/client`
    *   **포트**: `5173` (`http://localhost:5173`)
    *   **역할**: 사용자 화면(웹 페이지), 설문 조사 UI, 관리자 대시보드

**스크린샷의 에러("사이트에 연결할 수 없음")는 주로 프론트엔드 서버(5173 포트)가 꺼져있을 때 발생합니다.**

---

## ✅ 단계별 실행 방법

**두 개의 터미널(명령 프롬프트)** 창을 열어서 각각 실행해야 합니다.

### 1️⃣ 첫 번째 터미널: 백엔드 서버 실행

데이터 처리를 담당하는 서버를 먼저 켭니다.

1.  터미널을 열고 `server` 폴더로 이동합니다.
    ```bash
    cd rasset-voc/server
    ```
2.  패키지를 설치합니다 (최초 실행 시 1회).
    ```bash
    npm install
    ```
3.  서버를 실행합니다.
    ```bash
    npm run dev
    ```
4.  **성공 확인**: 다음과 같은 메시지가 나오면 성공입니다.
    ```
    🚀 Server running on http://localhost:3000
    ✅ Supabase connected
    ```

### 2️⃣ 두 번째 터미널: 프론트엔드 실행

사용자가 보는 화면을 켭니다. **새로운 터미널 창**을 열어주세요.

1.  터미널을 열고 `client` 폴더로 이동합니다.
    ```bash
    cd rasset-voc/client
    ```
2.  패키지를 설치합니다 (최초 실행 시 1회).
    ```bash
    npm install
    ```
3.  개발 서버를 실행합니다.
    ```bash
    npm run dev
    ```
4.  **성공 확인**: 다음과 같은 메시지가 나오면 성공입니다.
    ```
    VITE v5.x.x  ready in xxx ms
    
      ➜  Local:   http://localhost:5173/
      ➜  Network: use --host to expose
    ```

---

## 🔍 접속 테스트

서버 두 개가 모두 켜져 있는 상태에서 브라우저로 접속합니다.

*   **관리자 페이지**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
*   **태블릿 설문**: [http://localhost:5173/tablet](http://localhost:5173/tablet)
*   **모바일 설문**: [http://localhost:5173/survey](http://localhost:5173/survey)

---

## ❌ 자주 발생하는 문제 (Troubleshooting)

### Q. `npm run dev` 실패 (Missing script: "dev")
*   **원인**: 잘못된 폴더에 있습니다.
*   **해결**: `client`나 `server` 폴더 안으로 들어갔는지 확인하세요. `ls` (맥/리눅스) 또는 `dir` (윈도우) 명령어로 `package.json` 파일이 있는지 확인하세요.

### Q. 포트가 이미 사용 중임 (EADDRINUSE)
*   **원인**: 이미 다른 터미널에서 서버가 실행 중입니다.
*   **해결**: 실행 중인 터미널을 찾아서 끄거나, 작업 관리자에서 Node.js 프로세스를 종료하세요.

### Q. "사이트에 연결할 수 없음" (localhost에서 연결을 거부했습니다)
*   **원인**: 프론트엔드 서버(Client)가 실행되지 않았습니다.
*   **해결**: '2️⃣ 두 번째 터미널: 프론트엔드 실행' 단계를 따라하세요.

### Q. "Network Error" 또는 데이터가 안 나옴
*   **원인**: 프론트엔드는 켜졌는데, 백엔드 서버(Server)가 꺼져있거나 DB 연결이 끊겼습니다.
*   **해결**: '1️⃣ 첫 번째 터미널: 백엔드 서버 실행' 단계를 확인하고 에러 로그가 있는지 보세요.
