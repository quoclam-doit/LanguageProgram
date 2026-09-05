export interface CsvPreviewResult {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  isValid: boolean;
  missingColumns: string[];
}

export function parseCsvPreview(text: string): CsvPreviewResult {
  if (!text || !text.trim()) {
    return { headers: [], rows: [], totalRows: 0, isValid: false, missingColumns: ['term', 'meaning', 'partOfSpeech'] };
  }

  // Remove UTF-8 BOM if present
  const cleanText = text.replace(/^\uFEFF/, '');
  const lines = cleanText.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [], totalRows: 0, isValid: false, missingColumns: ['term', 'meaning', 'partOfSpeech'] };
  }

  // Helper to parse a single CSV row handling quotes
  const parseRow = (rowStr: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < rowStr.length; i++) {
      const char = rowStr[i];
      if (char === '"') {
        if (inQuotes && rowStr[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const rawHeaders = parseRow(lines[0]);
  const cleanHeaders = rawHeaders.map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
  const rawRows = lines.slice(1);

  const parsedRows: Record<string, string>[] = rawRows.map((line) => {
    const values = parseRow(line);
    const rowObj: Record<string, string> = {};
    cleanHeaders.forEach((h, index) => {
      rowObj[h] = values[index] || '';
    });
    return rowObj;
  });

  const firstRow = parsedRows[0] || {};
  const hasTerm = 'term' in firstRow;
  const hasMeaning = 'meaning' in firstRow || 'meaningvi' in firstRow;
  const hasPartOfSpeech = 'partofspeech' in firstRow || 'pos' in firstRow;

  const missingColumns: string[] = [];
  if (!hasTerm) missingColumns.push('term');
  if (!hasPartOfSpeech) missingColumns.push('partOfSpeech');
  if (!hasMeaning) missingColumns.push('meaning');

  const isValid = missingColumns.length === 0;

  return {
    headers: rawHeaders,
    rows: parsedRows.slice(0, 5), // Preview first 5 rows
    totalRows: parsedRows.length,
    isValid,
    missingColumns,
  };
}
