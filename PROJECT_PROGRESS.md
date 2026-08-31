# Bảng Theo Dõi Tiến Độ Dự Án — Language Learning App (v2.0)

> **Repository:** `https://github.com/quoclam-doit/LanguageProgram.git`  
> **Cập nhật lần cuối:** 31/08/2026  
> **Trạng thái chung:** Phase 1 & Phase 2 Đã Hoàn Thành 100% | Chuẩn bị khởi động Phase 3  

---

## 📊 Tổng Quan Tiến Độ Theo Phase

| Phase | Nội Dung Công Việc | Trạng Thái | Tiến Độ |
| :--- | :--- | :---: | :---: |
| **Phase 1** | Monorepo Setup, Express Backend, Auth HttpOnly Cookie, Vitest Suite & UI Anti-Slop | ✅ **Hoàn thành** | **100%** |
| **Phase 2** | Thẻ Học Flashcard, CRUD Deck/Card, Cloudinary Upload & Thuật Toán FSRS Engine | ✅ **Hoàn thành** | **100%** |
| **Phase 3** | Tra Phiên Âm Tự Động (2 Tầng) & Async Import CSV Background Queue | 🔄 **Đang triển khai** | **~20%** |
| **Phase 4** | Engine Trắc Nghiệm (5 Dạng Quiz) & Gamification (XP, Streak, Level) | ⏳ **Chờ xử lý** | **0%** |
| **Phase 5** | Admin Dashboard, UptimeRobot Ping & Production Deploy (Vercel + Render) | ⏳ **Chờ xử lý** | **0%** |

---

## 🚀 Chi Tiết Công Việc & Requirements Từng Phase

### ✅ Phase 1: Setup Hạ Tầng, Express Server & Auth System (100%)
- [x] **Monorepo Setup:** Khởi tạo `pnpm` workspace với 3 gói `@app/shared` (TypeScript Interfaces), `apps/backend` (Express) và `apps/frontend` (React 19 + Vite + Tailwind v4 + Motion).
- [x] **Database & Backend:** Dựng Express Server + TypeScript + Mongoose kết nối MongoDB Atlas cluster chính thức.
- [x] **Authentication API:** Hoàn thiện `/api/auth/register`, `/login`, `/logout`, `/me` lưu JWT HttpOnly Cookie (`SameSite=None; Secure`) kèm CORS Whitelist `credentials: true`.
- [x] **Integration Testing:** Viết 8 bài Integration Tests trong `apps/backend/src/tests/auth.test.ts` dùng Vitest + `mongodb-memory-server` (100% PASS).
- [x] **CI/CD Pipeline:** Cấu hình GitHub Actions workflow `.github/workflows/ci.yml` tự động build và chạy test khi push code.
- [x] **UI Overhaul (Anti-Slop):** 
  - Tái thiết kế toàn bộ giao diện thân thiện dành cho app học tiếng Anh (Phông Outfit + Plus Jakarta Sans).
  - Loại bỏ hoàn toàn các AI pill badges rập khuôn và dải chữ AI gradient.
  - Tích hợp hiệu ứng **Scroll Parallax** mượt mà với `motion/react`.
  - Chuyển đổi khối Kho Bộ Thẻ sang dạng **Slide Carousel tương tác** có ảnh bìa Unsplash và chip từ vựng mẫu.
  - Đồng bộ lại Header Navbar, Login Page & Register Page.

---

### ✅ Phase 2: Thẻ Học Flashcard Module & Động Cơ FSRS Engine (100%)
- [x] **Mongoose Schemas:** 
  - `Deck`: Quản lý bộ thẻ (ownerId, langCode, isPublic, status...).
  - `Card`: Quản lý thẻ từ vựng (term, ipa, meanings, examples, audioUrl, imageUrl...).
  - `UserCardState`: Lưu 1 bản ghi duy nhất cho mỗi cặp `(userId, cardId)` chứa thông số FSRS (`stability`, `difficulty`, `due`, `reps`, `lapses`...).
  - `ReviewLog`: Nhật ký ôn tập (append-only) phục vụ analytics.
- [x] **Services & Cloudinary:**
  - `fsrs.service.ts`: Tích hợp `ts-fsrs` SDK tính toán mốc thời gian `due` và thuật toán FSRS.
  - `cloudinary.service.ts`: Service upload ảnh minh họa & audio phát âm.
- [x] **Express Controllers & Routes:**
  - `/api/decks`: CRUD Bộ thẻ cá nhân + danh sách bộ thẻ công khai được duyệt.
  - `/api/cards`: CRUD Thẻ từ vựng (tự động cập nhật `cardCount`).
  - `/api/srs/due` & `/api/srs/review`: Truy vấn thẻ cần học và ghi nhận đánh giá FSRS `Again/Hard/Good/Easy`, cộng **+10 XP** và tính Streak.
- [x] **Vitest Test Suite:** Viết 5 bài Integration Tests trong `apps/backend/src/tests/deck_srs.test.ts` (Tổng 13/13 Vitest tests PASS 100%).
- [x] **Oxford 3000 Dataset Seed:** Script `seedOxford3000.ts` nạp sẵn bộ thẻ chuẩn Oxford 3000.
- [x] **Frontend Flashcard & Study Session UI:**
  - [`DeckList.tsx`](file:///f:/EnglishProgram/apps/frontend/src/pages/DeckList.tsx): Danh sách bộ thẻ & modal tạo bộ thẻ mới.
  - [`DeckDetail.tsx`](file:///f:/EnglishProgram/apps/frontend/src/pages/DeckDetail.tsx): Chi tiết bộ thẻ & modal thêm từ vựng.
  - [`StudySession.tsx`](file:///f:/EnglishProgram/apps/frontend/src/pages/StudySession.tsx): Giao diện học Lật thẻ 3D, nút nghe phát âm Web Speech API, 4 nút FSRS `Again`/`Hard`/`Good`/`Easy` kèm thời gian hẹn ôn (`10m`, `1d`, `3d`, `7d`), thanh tiến độ, hiệu ứng cộng XP và màn hình ăn mừng hoàn thành bài học.

---

### 🔄 Phase 3: Tra Phiên Âm Tự Động (Dictionary Pipeline Rút Gọn) & Import CSV Bất Đồng Bộ (Đang triển khai)

> **Quyết định phạm vi (31/08/2026):** Bỏ tầng Gemini Flash LLM fallback, dời sang giai đoạn tương lai. Lý do: Free Dictionary API không trả nghĩa tiếng Việt, mà nghĩa + từ loại nay do **user tự nhập luôn** (chính xác hơn dịch máy) nên không cần LLM để dịch. Pipeline rút gọn còn **2 tầng**, chỉ tự động hoá phần **phiên âm IPA + audio** — phần khó gõ tay nhất.

> **Nguồn chi tiết:** `.scratch/phase-3-dictionary-import/spec.md` + `issues/01-04-*.md` (quy trình `/to-spec` → `/to-tickets` → `/implement`). Bảng dưới dùng để **giao việc frontend** — cập nhật ngay sau mỗi ticket backend xong.

#### 🎯 Bảng giao việc Frontend (xem trước khi phân công)

| Ticket BE | Nội dung | Trạng thái BE | → Mở khóa việc gì cho FE | Giao FE được chưa? |
|:---:|---|:---:|---|:---:|
| — | *(không phụ thuộc ticket nào)* | — | Absolute API URL (`VITE_API_BASE_URL`), chuẩn bị file CSV mẫu | ✅ **Giao ngay được** |
| 01 | `partOfSpeech` bắt buộc trên Card | ✅ Done *(chưa commit)* | *(đã tự vá tạm trong `DeckDetail.tsx` — FE không cần làm gì thêm)* | ✅ Xong, khỏi giao |
| 02 | Dictionary lookup 2 tầng | ✅ Done *(chưa commit)* | Nút "Tra phiên âm tự động" cạnh ô nhập từ — endpoint `GET /api/dictionary/lookup?word=` đã sẵn sàng | ✅ **Giao được rồi** |
| 03 | Import CSV tạo thẻ ngay | ⬜ Chưa làm *(chờ 01 ✅ → sẵn sàng bắt đầu)* | Modal Import CSV (chưa cần progress bar) | 🔒 Chờ ticket 03 |
| 04 | Worker enrich nền + progress | ⬜ Chưa làm *(chờ 02, 03)* | Progress bar trong modal Import CSV | 🔒 Chờ ticket 04 |

**Đã commit chưa?** Chưa — mọi thay đổi ticket 01 vẫn ở working tree local trên `main`. FE team sẽ không thấy gì cho tới khi commit/push.

---

**Backend:**
- [x] `[Ticket 01]` Thêm field `partOfSpeech` vào `CardMeaning` (`packages/shared/src/index.ts`) + `Card` model (`Card.ts`) + cập nhật `createCardSchema`/`updateCardSchema` trong `card.controller.ts` (bắt buộc nhập). *(done, 17/17 test pass, chưa commit)*
- [x] `[Ticket 02]` `dictionary.service.ts`: hàm `lookupPhonetic(word)` chạy 2 tầng — (1) query `DictionaryStore` theo `word`; (2) nếu chưa có, gọi Free Dictionary API (`api.dictionaryapi.dev`) lấy `ipa.us/uk` + `audioUrl`, cache lại vào `DictionaryStore` (`source: 'dictionary_api'`). Nếu API không có từ → trả rỗng, không lỗi, không bắt buộc. *(done, 22/22 test pass, chưa commit)*
- [x] `[Ticket 02]` `dictionary.controller.ts` + `dictionary.routes.ts`: `GET /api/dictionary/lookup?word=...`, đăng ký route trong `server.ts`. *(done, chưa commit)*
- [ ] `[Ticket 03]` Model `ImportJob` mới: `deckId`, `ownerId`, `status: 'pending'|'processing'|'completed'|'failed'`, `totalRows`, `processedRows`, `errors[]`, `createdAt`.
- [ ] `[Ticket 03]` Middleware upload CSV (`multer`, giới hạn size/mime `.csv`).
- [ ] `[Ticket 03]` `import.controller.ts`: `POST /api/decks/:deckId/import-csv` — parse CSV (cột bắt buộc: `term`, `meaning`, `partOfSpeech`; cột tuỳ chọn: `exampleEn`, `exampleVi`) → tạo `Card` ngay lập tức → tạo `ImportJob(status='pending')` → trả response ngay, không block.
- [ ] `[Ticket 04]` `importWorker.service.ts`: chạy nền, với mỗi Card mới import gọi `dictionary.service.lookupPhonetic()` bổ sung IPA + audioUrl, cập nhật `processedRows`, set `status='completed'` khi xong.
- [ ] `[Ticket 04]` `GET /api/decks/:deckId/import-jobs/:jobId`: polling endpoint theo dõi tiến độ import.
- [ ] `[Ticket 02-04]` Vitest tests: lookup phiên âm (mock Free Dictionary API), luồng CSV import tạo đúng số Card + job hoàn tất đúng trạng thái.

**Frontend:**
- [x] `[Ticket 01]` Thêm field "Từ loại" (dropdown: danh từ/động từ/tính từ/trạng từ/...) vào form Thêm Từ Vựng ở `DeckDetail.tsx`, bắt buộc nhập. *(fix kèm theo Ticket 01 backend, để không vỡ UI — chưa commit)*
- [x] **Absolute API URL cho production**: thêm biến `VITE_API_BASE_URL`, cập nhật `api.ts`, `deck.service.ts`, `card.service.ts`, `srs.service.ts` dùng biến này thay vì path tương đối cứng (`/api/...`).
- [x] Cung cấp file CSV mẫu (`oxford_flashcard_template.csv`) với hàm `downloadCsvTemplate()` trong `csvTemplate.service.ts` + nút tải trực tiếp trên UI.
- [x] `dictionary.service.ts` (frontend): `lookupPhonetic(word)` tự động tra IPA + audio qua backend & fallback Free Dictionary API.
- [x] Nút "Tra IPA" tự động + trigger `onBlur` trên input `term` trong modal Thêm thẻ ở `DeckDetail.tsx`.
- [ ] `[🔒 chờ Ticket 03]` `import.service.ts`: `importCsv(deckId, file)` (dùng `FormData`), `getImportJobStatus(deckId, jobId)`.
- [ ] `[🔒 chờ Ticket 03]` Modal "Import CSV" (`DeckList.tsx` hoặc `DeckDetail.tsx`): file picker → preview vài dòng đầu → validate đủ cột bắt buộc trước khi submit.
- [ ] `[🔒 chờ Ticket 04]` Progress indicator: polling job status mỗi 2-3s, thanh progress `processedRows/totalRows`, badge trạng thái khi hoàn tất.

---

### ⏳ Phase 4: Trắc Nghiệm Phản Xạ (Quiz Module) & Gamification

**Backend:**
- [ ] **[Làm trước tiên] Refactor `gamification.service.ts`:** tách `awardXp(userId, amount)` và `updateStreak(user, now)` dùng chung ra khỏi `srs.controller.ts` (hiện logic XP/Streak đang nhúng cứng ở đó) + chuyển `calculateLevel()` từ `auth.controller.ts` sang service này dùng chung. Cập nhật `srs.controller.ts` gọi lại service mới, không đổi hành vi hiện tại — tránh duplicate code khi viết `quiz.controller.ts` mới.
- [ ] Model `Quiz` + `Question` (dùng Mongoose discriminator hoặc `type` + `payload: Mixed`, khớp discriminated union đã định nghĩa sẵn trong `packages/shared/src/index.ts`) + `QuizAttempt`.
- [ ] `quiz.service.ts`: auto-generate 5 dạng câu hỏi từ 1 deck — `mcq` (đáp án đúng + 3 distractor từ card khác cùng deck), `fill_blank` (ẩn `term` trong `examples[].en`), `matching` (ghép term↔meaning), `listening` (audio + MCQ), `ordering` (xáo từ trong câu ví dụ).
- [ ] `quiz.controller.ts` + routes: `POST /api/quizzes/generate` (deckId, questionCount, types[]), `GET /api/quizzes/:id` (ẩn đáp án đúng), `POST /api/quizzes/:id/submit` (chấm điểm, gọi `gamification.service` cộng **+5 XP/câu đúng**).
- [ ] Vitest tests: sinh đúng số câu/đúng loại theo yêu cầu, chấm điểm + cộng XP chính xác.

**Frontend:**
- [ ] Thêm route `/quizzes` vào `App.tsx` — hiện `Navbar.tsx` đã có link trỏ tới nhưng route chưa tồn tại (dead link).
- [ ] `quiz.service.ts`: `generateQuiz()`, `getQuiz(id)`, `submitQuiz(id, answers)`.
- [ ] `QuizList.tsx`: chọn deck, số câu, loại câu → tạo bài quiz mới.
- [ ] `QuizPlayer.tsx`: render theo `type` (MCQ, fill_blank, matching, listening, ordering) + timer đếm ngược.
- [ ] `QuizResult.tsx`: điểm số, số câu đúng/sai, `explanation` từng câu, +XP toast (style giống `StudySession.tsx`).
- [ ] Đồng bộ lại XP/Streak trong `AuthContext` sau khi nộp bài (gọi `refreshUser()`).

---

### ⏳ Phase 5: Admin Dashboard & Production Deploy

**Backend:**
- [ ] `admin.middleware.ts`: check `req.user.role === 'admin'`, trả 403 nếu không phải admin.
- [ ] Thêm field `isLocked: boolean` vào `User` model; chặn login nếu `isLocked === true`.
- [ ] `admin.controller.ts` + routes: `GET /api/admin/users`, `PATCH /api/admin/users/:id/lock`, `GET /api/admin/decks?status=pending`, `PATCH /api/admin/decks/:id/approve`, `PATCH /api/admin/decks/:id/reject`.
- [ ] Cấu hình deploy Render: build command `pnpm build:shared && pnpm build:backend`, start command `node dist/server.js`, khai báo đủ env vars (`MONGODB_URI`, `JWT_*_SECRET`, `CLOUDINARY_*`, `CLIENT_URL`).
- [ ] UptimeRobot: trỏ monitor HTTP GET vào `/api/health` (đã có sẵn), 10 phút/lần.
- [ ] Cập nhật CORS whitelist trong `server.ts` thêm domain Vercel thật khi có.

**Frontend:**
- [ ] `AdminDashboard.tsx` + route `/admin` (guard redirect nếu `user.role !== 'admin'`).
- [ ] Bảng quản lý user (khoá/mở tài khoản).
- [ ] Hàng đợi duyệt deck công khai (approve/reject).
- [ ] `admin.service.ts` gọi các API admin ở trên.
- [ ] `vercel.json`: cấu hình rewrite SPA cho React Router (tránh 404 khi refresh trang con).
- [ ] Set biến `VITE_API_BASE_URL` trên Vercel dashboard trỏ về domain Render (phần code đã làm sẵn từ Phase 3).
