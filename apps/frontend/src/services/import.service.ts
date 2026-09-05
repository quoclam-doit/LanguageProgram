import { API_BASE } from './api';

export interface ImportJobResponse {
  jobId: string;
  deckId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRows: number;
  processedRows: number;
  errors: Array<{ row: number; error: string }>;
  createdAt?: string;
}

export const importService = {
  /**
   * Uploads CSV file to import flashcards into a specific deck.
   * Uses multipart/form-data.
   */
  async importCsv(deckId: string, file: File): Promise<ImportJobResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/decks/${deckId}/import-csv`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Lỗi khi import file CSV');
    }
    return json.data;
  },

  /**
   * Polls the status of an active import job.
   */
  async getImportJobStatus(deckId: string, jobId: string): Promise<ImportJobResponse> {
    const res = await fetch(`${API_BASE}/decks/${deckId}/import-jobs/${jobId}`, {
      credentials: 'include',
    });

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || 'Lỗi khi kiểm tra tiến độ import');
    }
    return json.data;
  },
};
