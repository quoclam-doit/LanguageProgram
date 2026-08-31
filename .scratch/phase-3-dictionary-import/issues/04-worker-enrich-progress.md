# 04: Worker enrich nền + theo dõi tiến độ

**What to build:** Sau khi import CSV xong, các thẻ vừa tạo tự động được bổ sung phiên âm + audio ở nền. Người dùng theo dõi được tiến độ (bao nhiêu thẻ đã xong / tổng) tới khi hoàn tất.

**Blocked by:** 02 (cần dictionary lookup service), 03 (cần Card + ImportJob tồn tại để có gì mà enrich)

**Status:** ready-for-agent

- [ ] Sau khi 1 `ImportJob` được tạo, từng Card trong job dần được bổ sung IPA/audio qua pipeline tra cứu ở ticket 02
- [ ] `ImportJob.processedRows` tăng dần khi từng thẻ enrich xong
- [ ] `ImportJob.status` chuyển sang `completed` khi mọi thẻ trong job đã được xử lý
- [ ] `GET /api/decks/:deckId/import-jobs/:jobId` trả `status`, `totalRows`, `processedRows`
- [ ] `GET /api/decks/:deckId/import-jobs/:jobId` trả 404 nếu job không thuộc deck của user hiện tại
- [ ] 1 từ tra cứu thất bại khi enrich không làm fail cả job — chỉ để trống IPA của thẻ đó, các thẻ khác vẫn tiếp tục xử lý
