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
| **Phase 3** | Dictionary Pipeline 3 Tầng & Async Import CSV Background Queue | 🔄 **Giai đoạn tiếp theo** | **0%** |
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

### 🔄 Phase 3: Tra Từ Tự Động (Dictionary Pipeline) & Import CSV Bất Đồng Bộ (Giai đoạn tiếp theo)
- [ ] **Global `DictionaryStore` Collection:** Cache từ vựng dùng chung toàn hệ thống (`word`, `ipa`, `meanings`, `translations`).
- [ ] **Luồng Tra Từ 3 Tầng:** `DB Cache` $\rightarrow$ `Free Dictionary API` $\rightarrow$ `Gemini Flash LLM Fallback` $\rightarrow$ `User Nhập Thủ Công`.
- [ ] **Async CSV Import Queue:** Backend tiếp nhận file CSV $\rightarrow$ Lưu thô trả kết quả ngay $\rightarrow$ Worker ngầm chạy bổ sung phiên âm IPA, dịch nghĩa và audio.

---

### ⏳ Phase 4: Trắc Nghiệm Phản Xạ (Quiz Module) & Gamification
- [ ] **Discriminated Union Question Schemas:** 5 dạng bài tập (`mcq`, `fill_blank`, `matching`, `listening`, `ordering`).
- [ ] **Quiz Engine & UI Renderer:** Bộ giao diện làm trắc nghiệm có tính giờ, nộp bài & hiển thị lời giải.
- [ ] **Gamification Rules:** 
  - Cộng **+10 XP** cho SRS Card / **+5 XP** cho Quiz question.
  - Cập nhật Level: $\text{Level} = \lfloor \sqrt{\text{XP}/100} \rfloor$.
  - Tính toán Streak hàng ngày theo múi giờ cá nhân (`timezone`).

---

### ⏳ Phase 5: Admin Dashboard & Production Deploy
- [ ] **Admin Dashboard:** Quản lý tài khoản (Khóa/Mở) và duyệt các bộ thẻ công khai (`status: 'draft' | 'pending' | 'approved'`).
- [ ] **Production Deployment:** Deploy Frontend lên **Vercel**, Backend lên **Render**.
- [ ] **UptimeRobot:** Cấu hình ping định kỳ 10 phút/lần giữ warm backend server.
