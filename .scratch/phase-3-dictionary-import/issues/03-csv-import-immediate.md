# 03: Import CSV tạo thẻ ngay lập tức

**What to build:** Người dùng tải 1 file CSV (từ, nghĩa, từ loại tự viết sẵn) lên 1 deck của họ. Hệ thống tạo thẻ ngay từ dữ liệu thô trong file, trả kết quả ngay lập tức, không bắt người dùng chờ.

**Blocked by:** 01 (Card cần có field `partOfSpeech` tồn tại trước khi CSV có thể tạo Card kèm nó)

**Status:** ready-for-agent

- [ ] `POST /api/decks/:deckId/import-csv` nhận file multipart (field `file`)
- [ ] CSV thiếu bất kỳ cột bắt buộc nào (`term`, `meaning`, `partOfSpeech`) → trả 400, không tạo thẻ nào cả
- [ ] Deck không thuộc user hiện tại → trả lỗi phù hợp (403/404), không tạo thẻ
- [ ] CSV hợp lệ → tạo ngay 1 Card cho mỗi dòng (kèm `meanings`/`partOfSpeech`, `examples` nếu có cột `exampleEn`/`exampleVi`), cập nhật `cardCount` của deck
- [ ] Tạo `ImportJob` với `status: 'pending'`, `totalRows` bằng số dòng, `processedRows: 0`
- [ ] Response trả về nhanh (không chờ bước enrich phiên âm), kèm `jobId` của job vừa tạo
