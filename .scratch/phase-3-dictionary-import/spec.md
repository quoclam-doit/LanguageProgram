# Phase 3: Tra Phiên Âm Tự Động & Import CSV Bất Đồng Bộ (Backend)

**Status:** ready-for-agent

## Problem Statement

Người học đang phải tự gõ tay từng thẻ từ vựng một, kể cả phần khó gõ và dễ sai nhất là phiên âm IPA. Khi họ muốn nạp nhiều từ cùng lúc (ví dụ từ 1 danh sách ôn thi có sẵn), hiện không có cách nào nhập hàng loạt — phải tạo từng thẻ qua form UI, rất chậm với deck lớn.

Nghĩa tiếng Việt và từ loại (danh từ, động từ...) thì người học vẫn muốn tự nhập, vì máy dịch không đáng tin bằng tự viết theo đúng ngữ cảnh họ hiểu.

## Solution

Hai khả năng mới cho Card:

1. **Tra phiên âm tự động**: khi thêm 1 thẻ, hệ thống tự tra IPA + audio phát âm cho `term` đã nhập, qua nguồn cache nội bộ trước rồi tới Free Dictionary API công khai. Không tự dịch nghĩa — nghĩa và từ loại luôn do người dùng tự nhập, và giờ từ loại là bắt buộc.
2. **Import CSV**: người dùng tải lên 1 file CSV chứa nhiều từ (kèm nghĩa + từ loại tự viết sẵn). Hệ thống tạo thẻ ngay lập tức từ dữ liệu thô trong file, trả kết quả ngay không bắt người dùng chờ, rồi một tiến trình nền tự bổ sung phiên âm + audio cho từng thẻ vừa tạo.

## User Stories

1. Là người học, tôi muốn thấy phiên âm IPA tự động điền sẵn khi tôi gõ xong 1 từ mới, để tôi không phải tự tra và gõ tay ký hiệu IPA.
2. Là người học, tôi muốn hệ thống không bắt buộc phải có phiên âm nếu từ tôi gõ không tìm thấy trong từ điển (từ hiếm, từ lóng, gõ sai chính tả), để tôi vẫn tạo được thẻ.
3. Là người học, tôi muốn tự nhập nghĩa tiếng Việt của từ theo đúng ý tôi hiểu, không bị hệ thống tự động ghi đè.
4. Là người học, tôi muốn khai báo từ loại (danh từ/động từ/tính từ/trạng từ...) cho mỗi thẻ, để khi ôn tập tôi phân biệt được cách dùng từ.
5. Là người học, khi tạo hoặc sửa 1 thẻ mà không có từ loại, tôi muốn hệ thống báo lỗi rõ ràng để tôi biết cần bổ sung.
6. Là người học có nhiều từ vựng sẵn (ví dụ từ 1 tài liệu ôn thi), tôi muốn tải lên 1 file CSV để tạo nhiều thẻ cùng lúc, thay vì phải nhập tay từng thẻ.
7. Là người học, khi tôi tải CSV lên, tôi muốn thấy các thẻ xuất hiện trong deck ngay lập tức (kể cả khi phiên âm/audio chưa kịp bổ sung), để tôi không phải chờ đợi vô ích.
8. Là người học, sau khi import CSV, tôi muốn biết tiến trình bổ sung phiên âm đang chạy tới đâu (đã xong bao nhiêu / tổng bao nhiêu), để tôi biết khi nào dữ liệu đầy đủ.
9. Là người học, nếu file CSV tôi tải lên thiếu cột bắt buộc (từ, nghĩa, từ loại), tôi muốn nhận lỗi rõ ràng ngay khi upload, không muốn hệ thống tạo thẻ thiếu dữ liệu một cách âm thầm.
10. Là hệ thống, khi tra cùng 1 từ nhiều lần (bởi nhiều người dùng khác nhau, hoặc trong 1 lần import CSV nhiều từ trùng), tôi muốn chỉ gọi Free Dictionary API 1 lần cho mỗi từ và dùng lại kết quả đã cache, để tránh gọi API dư thừa và tăng tốc độ.
11. Là hệ thống, khi Free Dictionary API không có dữ liệu cho 1 từ (404 hoặc lỗi mạng), tôi muốn xử lý êm, để lại IPA/audio trống thay vì làm hỏng cả luồng tạo thẻ hoặc luồng import.
12. Là chủ sở hữu deck, tôi chỉ muốn import được CSV vào deck của chính mình, không phải deck người khác.

## Implementation Decisions

- **`CardMeaning`** (shared types) và `Card` model (Mongoose) có thêm field `partOfSpeech: string`, bắt buộc, cùng cấp với `text`/`langCode` trong mỗi phần tử `meanings[]` (mỗi nghĩa gắn 1 từ loại riêng — 1 từ có thể vừa là danh từ vừa là động từ với nghĩa khác nhau). Validate bắt buộc ở tầng schema Zod khi tạo/sửa Card qua API.
- **`dictionary.service`**: hàm tra cứu 1 từ chạy 2 tầng tuần tự — (1) tìm trong `DictionaryStore` theo `word` (đã lowercase/trim); (2) nếu không có, gọi Free Dictionary API lấy `phonetics` (ưu tiên bản ghi có `text` khác rỗng cho US/UK) và audio, rồi lưu (upsert) kết quả vào `DictionaryStore` với `source: 'dictionary_api'` để lần sau dùng cache. Nếu tầng 2 cũng không có (404/lỗi mạng/timeout), trả về đối tượng rỗng — không ném lỗi ra ngoài, không có tầng LLM (đã quyết định bỏ, dời sang giai đoạn tương lai).
- **Endpoint tra cứu**: `GET /api/dictionary/lookup?word=...` — yêu cầu đăng nhập (dùng chung middleware auth hiện có), trả IPA + audioUrl (không trả nghĩa, vì nghĩa không còn nằm trong luồng tự động).
- **`ImportJob`** (model mới): theo dõi 1 lần import CSV — `deckId`, `ownerId`, `status` (`pending` → `processing` → `completed`, hoặc `failed`), `totalRows`, `processedRows`, `errors: string[]`. Chỉ chủ sở hữu deck xem được job của deck đó.
- **Luồng import**: `POST /api/decks/:deckId/import-csv` nhận file CSV (multipart, field name `file`), validate deck thuộc về user hiện tại, validate CSV có đủ 3 cột bắt buộc (`term`, `meaning`, `partOfSpeech`; `exampleEn`/`exampleVi` tuỳ chọn) — nếu thiếu cột bắt buộc, từ chối toàn bộ file ngay lập tức (trả lỗi 400, không tạo thẻ nào). Nếu đủ cột: tạo ngay các `Card` từ dữ liệu thô trong file (thiếu IPA/audio), tạo `ImportJob(status: 'pending')`, cập nhật `cardCount` của deck, trả response 202 ngay kèm `jobId` — không chờ phần enrich.
- **Worker enrich nền**: sau khi response đã trả về, kích hoạt xử lý nền (không block request) lần lượt qua từng Card vừa tạo trong job đó, gọi `dictionary.service` bổ sung IPA/audio, cập nhật `processedRows` sau mỗi thẻ, set `status: 'completed'` khi xong hết (hoặc `failed` nếu toàn bộ batch lỗi bất thường — lỗi từng từ riêng lẻ không làm fail cả job, chỉ để trống IPA của từ đó).
- **Endpoint theo dõi tiến độ**: `GET /api/decks/:deckId/import-jobs/:jobId` trả `status`, `totalRows`, `processedRows`; 404 nếu job không thuộc deck của user hiện tại.

## Testing Decisions

- Test tốt chỉ xác nhận hành vi qua HTTP response (status code, body), không đọc thẳng DB để assert, không mock nội bộ service — giữ đúng phong cách đã có ở `deck_srs.test.ts`/`auth.test.ts` (Vitest + Supertest + `mongodb-memory-server`, dùng `request(app)`).
- Prior art trực tiếp: `apps/backend/src/tests/deck_srs.test.ts` (setup `beforeAll`/`afterAll` với `MongoMemoryServer`, đăng ký user lấy `authCookie`, chuỗi `it()` tuần tự dùng lại state từ bước trước).
- Với endpoint gọi Free Dictionary API: mock `global.fetch` bằng `vi.spyOn(global, 'fetch')` (built-in Node 18+, không cài thêm thư viện) trả về response giả lập cho từng test case (có dữ liệu / 404 / lỗi mạng).
- Với worker nền: test poll `GET .../import-jobs/:jobId` trong vòng lặp có giới hạn số lần thử (ví dụ tối đa ~20 lần, cách nhau ngắn) tới khi thấy `status: 'completed'`, thay vì gọi thẳng hàm nội bộ của worker — giữ test ở mức black-box.
- Module sẽ được test: `dictionary.controller` (qua route), `card.controller` (validate `partOfSpeech` bắt buộc), `import.controller` (qua route, cả CSV hợp lệ và CSV thiếu cột).

## Out of Scope

- Gemini/LLM fallback dịch nghĩa tự động — dời sang giai đoạn tương lai, không nằm trong spec này.
- Dịch nghĩa tiếng Việt tự động dưới bất kỳ hình thức nào — nghĩa luôn do người dùng tự nhập.
- Frontend UI cho tra phiên âm và import CSV — nằm trong ticket riêng của phần Frontend (không thuộc phạm vi backend spec này), dù backend cần đảm bảo response shape đủ để frontend tiêu thụ được.
- Absolute API URL cho production (Vite `VITE_API_BASE_URL`) — việc riêng bên frontend, đã ghi trong `PROJECT_PROGRESS.md` Phase 3, không phải việc backend.
- Xử lý file CSV encoding lạ (không phải UTF-8), file quá lớn (giới hạn dung lượng cụ thể để giai đoạn implement quyết định hợp lý, không cần đặc tả cứng ở đây).
- Retry tự động khi Free Dictionary API lỗi tạm thời — lỗi 1 lần là để trống IPA, không retry.

## Further Notes

- Quyết định rút gọn 2 tầng (bỏ Gemini) và yêu cầu `partOfSpeech` bắt buộc đã được thống nhất qua trao đổi trực tiếp với người dùng trong phiên làm việc trước, ghi lại trong `PROJECT_PROGRESS.md` (mục Phase 3).
- Field `partOfSpeech` là thay đổi schema ảnh hưởng ngược tới `card.controller.ts` (`createCardSchema`/`updateCardSchema`) — nên xử lý trước tiên vì mọi ticket khác (dictionary, import CSV) đều tạo Card và cần field này tồn tại.
