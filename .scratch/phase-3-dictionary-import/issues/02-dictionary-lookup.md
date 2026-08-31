# 02: Tra phiên âm tự động 2 tầng

**What to build:** Người dùng gõ 1 từ, hệ thống trả về phiên âm IPA + audio phát âm — ưu tiên lấy từ cache nội bộ, nếu chưa có thì tra Free Dictionary API công khai và lưu lại cho lần sau. Không có dữ liệu thì trả rỗng, không lỗi.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Tra từ đã có trong `DictionaryStore` thì trả thẳng, không gọi Free Dictionary API
- [x] Tra từ chưa có: gọi Free Dictionary API, lấy IPA (us/uk) + audio, lưu (upsert) vào `DictionaryStore` với `source: 'dictionary_api'`
- [x] Free Dictionary API trả 404 hoặc lỗi mạng: endpoint vẫn trả thành công (không phải 500) với IPA/audio rỗng
- [x] `GET /api/dictionary/lookup?word=...` yêu cầu đăng nhập — 401 nếu không có cookie hợp lệ
- [x] Tra từ không phân biệt hoa/thường và khoảng trắng thừa (`Resilience` và `resilience` dùng chung 1 bản ghi cache)

## Comments

- Code review (Standards + Spec) phát hiện bug thật: implementation ban đầu dùng `DictionaryStore.create()` thay vì upsert như spec yêu cầu — 2 request tra cùng 1 từ mới cùng lúc sẽ bị lỗi duplicate key (E11000) trên unique index `word`, dẫn tới 500 thay vì trả kết quả đúng. Đã sửa dùng `findOneAndUpdate(..., { upsert: true })`. Cũng dọn 1 chỗ Duplicated Code (helper `findPhonetic`) theo gợi ý review.
- 22/22 backend test pass, typecheck sạch. Chưa commit.
