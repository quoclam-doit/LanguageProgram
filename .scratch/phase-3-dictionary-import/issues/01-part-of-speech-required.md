# 01: Thêm `partOfSpeech` bắt buộc vào Card

**What to build:** Khi người dùng tạo hoặc sửa 1 thẻ từ vựng, mỗi nghĩa (`meanings[]`) phải kèm từ loại (danh từ/động từ/tính từ/...). Thiếu từ loại thì API từ chối rõ ràng thay vì lưu thẻ thiếu dữ liệu.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] `CardMeaning` trong `packages/shared/src/index.ts` có thêm field `partOfSpeech: string` (bắt buộc)
- [x] `Card` Mongoose schema (`apps/backend/src/models/Card.ts`) yêu cầu `partOfSpeech` trên mỗi phần tử `meanings[]`
- [x] `POST /api/cards/deck/:deckId` trả 400 nếu bất kỳ nghĩa nào thiếu `partOfSpeech`
- [x] `PUT /api/cards/:id` trả 400 nếu `meanings` được gửi lên mà thiếu `partOfSpeech` ở phần tử nào
- [x] `POST /api/cards/deck/:deckId` trả 201 và lưu đúng `partOfSpeech` khi gửi hợp lệ
- [x] Test hiện có ở `deck_srs.test.ts` (tạo card bước 3) vẫn pass sau khi cập nhật fixture kèm `partOfSpeech`

## Comments

- Code review (Standards + Spec, xem `code-review` skill) phát hiện: nếu chỉ sửa backend thì form "Thêm Từ Vựng" ở `DeckDetail.tsx` sẽ vỡ (thiếu `partOfSpeech`). Đã fix bổ sung ngoài phạm vi ban đầu của ticket: `apps/frontend/src/services/card.service.ts` (dùng chung type `CardMeaning` từ `@app/shared` thay vì khai báo riêng) + `apps/frontend/src/pages/DeckDetail.tsx` (thêm dropdown "Từ loại", gửi kèm `partOfSpeech`, hiển thị badge từ loại trong danh sách thẻ). Quyết định theo xác nhận của user.
- 17/17 backend test pass, typecheck sạch cả backend lẫn frontend. Chưa commit — chờ user xác nhận.
