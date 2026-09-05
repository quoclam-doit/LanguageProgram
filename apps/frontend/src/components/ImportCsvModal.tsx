import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  UploadSimple,
  FileCsv,
  X,
  CheckCircle,
  Warning,
  DownloadSimple,
  CircleNotch,
  Sparkle,
  XCircle,
} from '@phosphor-icons/react';
import { parseCsvPreview, CsvPreviewResult } from '../utils/csvParser';
import { importService, ImportJobResponse } from '../services/import.service';
import { downloadCsvTemplate } from '../services/csvTemplate.service';

interface ImportCsvModalProps {
  deckId: string;
  deckTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({
  deckId,
  deckTitle,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvPreviewResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobResult, setJobResult] = useState<ImportJobResponse | null>(null);

  // Polling Effect for Import Job progress (every 2s)
  useEffect(() => {
    if (!jobResult || !jobResult.jobId) return;
    if (jobResult.status === 'completed' || jobResult.status === 'failed') return;

    const interval = setInterval(async () => {
      try {
        const updated = await importService.getImportJobStatus(deckId, jobResult.jobId);
        setJobResult(updated);
        if (updated.status === 'completed') {
          onSuccess();
        }
      } catch (err) {
        console.error('Polling job status error:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobResult?.status, jobResult?.jobId, deckId, onSuccess]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setJobResult(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Vui lòng chọn file có định dạng chuẩn .csv!');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCsvPreview(text);
      setPreview(parsed);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError(null);
    setJobResult(null);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Vui lòng chọn file có định dạng chuẩn .csv!');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCsvPreview(text);
      setPreview(parsed);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleSubmit = async () => {
    if (!selectedFile || !preview?.isValid || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await importService.importCsv(deckId, selectedFile);
      setJobResult(res);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải file CSV lên máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = jobResult?.totalRows || 1;
  const processed = jobResult?.processedRows || 0;
  const progressPercent = Math.min(Math.round((processed / total) * 100), 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
              Import từ vựng hàng loạt
            </span>
            <h3 className="mt-1 font-heading text-xl font-bold text-slate-900">
              Nhập từ vựng vào "{deckTitle}"
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X weight="bold" className="h-5 w-5" />
          </button>
        </div>

        {/* Success / Polling / Failed Progress View */}
        {jobResult ? (
          <div className="my-6 py-4 space-y-5">
            {/* Status Icon */}
            <div className="text-center">
              {jobResult.status === 'completed' && (
                <CheckCircle weight="fill" className="mx-auto h-14 w-14 text-emerald-500 animate-bounce" />
              )}
              {jobResult.status === 'failed' && (
                <XCircle weight="fill" className="mx-auto h-14 w-14 text-rose-500" />
              )}
              {(jobResult.status === 'pending' || jobResult.status === 'processing') && (
                <CircleNotch weight="bold" className="mx-auto h-14 w-14 text-indigo-600 animate-spin" />
              )}

              <h4 className="mt-3 font-heading text-lg font-bold text-slate-900">
                {jobResult.status === 'completed' && 'Hoàn thành Import Từ Vựng!'}
                {jobResult.status === 'failed' && 'Lỗi Xử Lý Import CSV'}
                {jobResult.status === 'pending' && 'Đã nhận file, đang chuẩn bị...'}
                {jobResult.status === 'processing' && 'Đang bổ sung phiên âm IPA & Audio...'}
              </h4>

              <p className="mt-1 text-sm text-slate-600">
                Đã tạo thành công <strong>{jobResult.totalRows}</strong> thẻ từ vựng vào bộ thẻ.
              </p>
            </div>

            {/* Progress Bar Component */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-700">
                  {jobResult.status === 'processing' && (
                    <Sparkle weight="fill" className="h-4 w-4 text-indigo-600 animate-spin" />
                  )}
                  <span>Tiến độ Enrich dữ liệu:</span>
                </span>
                <span className="font-mono text-indigo-600">
                  {processed} / {jobResult.totalRows} thẻ ({progressPercent}%)
                </span>
              </div>

              {/* Bar Track */}
              <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    jobResult.status === 'completed'
                      ? 'bg-emerald-500'
                      : jobResult.status === 'failed'
                      ? 'bg-rose-500'
                      : 'bg-indigo-600'
                  }`}
                />
              </div>

              {/* Status Badge */}
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Trạng thái tác vụ:</span>
                {jobResult.status === 'pending' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 font-bold text-amber-700">
                    <CircleNotch weight="bold" className="h-3 w-3 animate-spin text-amber-600" />
                    Đang xếp hàng...
                  </span>
                )}
                {jobResult.status === 'processing' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 font-bold text-indigo-700">
                    <Sparkle weight="fill" className="h-3 w-3 animate-spin text-indigo-600" />
                    Đang chạy làm giàu dữ liệu nền...
                  </span>
                )}
                {jobResult.status === 'completed' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-bold text-emerald-700">
                    <CheckCircle weight="fill" className="h-3 w-3 text-emerald-600" />
                    Đã xong 100%
                  </span>
                )}
                {jobResult.status === 'failed' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 font-bold text-rose-700">
                    <XCircle weight="fill" className="h-3 w-3 text-rose-600" />
                    Thất bại
                  </span>
                )}
              </div>
            </div>

            {/* Error Rows Display if any */}
            {jobResult.errors && jobResult.errors.length > 0 && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 space-y-1 max-h-32 overflow-y-auto">
                <p className="font-bold flex items-center gap-1">
                  <Warning weight="fill" className="h-4 w-4 text-rose-600" />
                  Các dòng bị bỏ qua do lỗi:
                </p>
                {jobResult.errors.map((err, idx) => (
                  <p key={idx} className="font-mono text-[11px]">
                    • Dòng {err.row}: {err.error}
                  </p>
                ))}
              </div>
            )}

            {/* Footer Action */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="btn-primary rounded-xl px-6 py-2.5 text-xs font-bold"
              >
                {jobResult.status === 'completed' ? 'Hoàn tất & Xem từ vựng' : 'Đóng cửa sổ'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Download Template Strip */}
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-200 p-3.5">
              <div className="flex items-center gap-2.5">
                <FileCsv weight="duotone" className="h-6 w-6 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Chưa có file CSV mẫu?</p>
                  <p className="text-[11px] text-slate-500">Tải file mẫu chuẩn các cột `term, partOfSpeech, meaning`</p>
                </div>
              </div>
              <button
                onClick={downloadCsvTemplate}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <DownloadSimple weight="bold" className="h-3.5 w-3.5 text-emerald-600" />
                <span>Tải Mẫu</span>
              </button>
            </div>

            {/* Drop Zone / Picker */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`relative rounded-3xl border-2 border-dashed p-6 text-center transition cursor-pointer ${
                selectedFile
                  ? 'border-indigo-400 bg-indigo-50/40'
                  : 'border-slate-300 bg-slate-50/50 hover:border-indigo-400 hover:bg-indigo-50/20'
              }`}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <UploadSimple weight="duotone" className="mx-auto h-10 w-10 text-indigo-500" />
              {selectedFile ? (
                <div className="mt-2">
                  <p className="text-sm font-bold text-slate-800">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Nhấn để chọn file khác
                  </p>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-sm font-bold text-slate-700">Thả file .CSV vào đây hoặc nhấn để chọn</p>
                  <p className="text-xs text-slate-400">Hỗ trợ file UTF-8 CSV</p>
                </div>
              )}
            </div>

            {/* Error Banner */}
            {error && (
              <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
                <Warning weight="fill" className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Validation & Preview Section */}
            {preview && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Xem trước dữ liệu ({preview.totalRows} dòng từ vựng)
                  </span>
                  {preview.isValid ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle weight="fill" className="h-3.5 w-3.5" />
                      Đủ cột hợp lệ
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      <Warning weight="fill" className="h-3.5 w-3.5" />
                      Thiếu cột: {preview.missingColumns.join(', ')}
                    </span>
                  )}
                </div>

                {/* Table Preview */}
                <div className="max-h-48 overflow-auto rounded-2xl border border-slate-200 bg-slate-50 text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="p-2.5 border-b border-slate-200">#</th>
                        <th className="p-2.5 border-b border-slate-200">term</th>
                        <th className="p-2.5 border-b border-slate-200">partOfSpeech</th>
                        <th className="p-2.5 border-b border-slate-200">meaning</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {preview.rows.map((r, i) => (
                        <tr key={i} className="hover:bg-white">
                          <td className="p-2.5 text-slate-400 font-mono">{i + 1}</td>
                          <td className="p-2.5 font-bold text-slate-900">{r.term || '—'}</td>
                          <td className="p-2.5 font-mono text-indigo-600">{r.partofspeech || r.pos || '—'}</td>
                          <td className="p-2.5 text-slate-700">{r.meaning || r.meaningvi || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!selectedFile || !preview?.isValid || isSubmitting}
                className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <CircleNotch weight="bold" className="h-4 w-4 animate-spin" />
                    <span>Đang tải lên...</span>
                  </>
                ) : (
                  <>
                    <UploadSimple weight="bold" className="h-4 w-4" />
                    <span>Import {preview?.totalRows ? `${preview.totalRows} Thẻ` : 'File CSV'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
