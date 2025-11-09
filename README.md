# OCR-CAPTCHA PWA Solver (nincompoops 팀 프로젝트)

## 💡 프로젝트 개요 및 목표

본 프로젝트는 SvelteKit 기반의 Progressive Web App(PWA) 형태로, 웹 브라우저 클라이언트 측에서 OCR(광학 문자 인식) 엔진을 활용하여 캡차(Captcha) 이미지를 인식하고 텍스트를 추출하는 솔버 애플리케이션 개발을 목표로 합니다.

**주요 목표:**
1.  **클라이언트 측 OCR:** Tesseract.js를 사용하여 브라우저에서 직접 OCR 처리를 수행하여 서버 부하를 줄입니다.
2.  **PWA 구현:** `vite-plugin-pwa`를 통합하여 오프라인 사용 및 빠른 로딩을 지원합니다.
3.  **OCR 정확도 개선:** Canvas API를 활용한 이미지 전처리(그레이스케일, 대비 개선 등) 로직을 적용하여 인식률을 높입니다.
4.  **다국어 지원:** 영어(`eng`) 및 한국어(`kor`) 캡차 이미지 인식을 지원합니다.

---

## 🛠️ 기술 스택

| 영역 | 구성 요소 | 비고 |
| :--- | :--- | :--- |
| **프론트엔드** | SvelteKit | 높은 성능과 간결한 컴포넌트 구조 |
| **언어** | TypeScript | 타입 안정성 및 코드 품질 향상 |
| **스타일링** | Tailwind CSS | Utility-first 기반의 빠른 UI 개발 |
| **빌드 도구** | Vite | SvelteKit의 기본 번들러 |
| **OCR 엔진** | Tesseract.js | 클라이언트 측(Wasm) OCR 처리 엔진 |
| **전처리** | Canvas API (Native) | Jimp 모듈 충돌 문제를 해결하고 브라우저 네이티브 기능 활용 |
| **PWA** | `vite-plugin-pwa` | 서비스 워커 및 매니페스트 통합 |

---

## 로컬 개발 환경 설정

### 사전 요구사항

* Node.js 18+ (현재 프로젝트는 Node.js 버전 호환성을 위해 `engine-strict=true` 설정됨)
* Git

### 프로젝트 실행

1.  프로젝트 루트로 이동합니다.
    ```sh
    cd nincompoops/ocr-captcha/OCR-CAPTCHA-e9b8c84364217769a15145a8c8308c2e73deab69/ocr-captcha-pwa
    ```

2.  의존성을 설치합니다.
    ```sh
    npm install
    ```

3.  개발 서버를 실행합니다.
    ```sh
    npm run dev
    ```
    브라우저에서 `http://localhost:5173` (또는 콘솔에 표시된 주소)로 접속하면 자동으로 `/ocr` 페이지로 리디렉션됩니다.

### 프로덕션 빌드 및 미리보기 (PWA 테스트)

PWA 기능(캐싱, 오프라인 모드)을 테스트하려면 빌드 후 미리보기 서버를 사용해야 합니다.

1.  프로덕션 빌드를 수행합니다. (이 과정에서 서비스 워커가 생성됩니다.)
    ```sh
    npm run build
    ```

2.  로컬 미리보기 서버를 실행합니다.
    ```sh
    npm run preview
    ```
    브라우저에서 `http://localhost:4173` (또는 콘솔에 표시된 주소)로 접속하여 PWA 기능을 테스트합니다.