export function downloadCsvTemplate(): void {
  const headers = ['term', 'partOfSpeech', 'meaning', 'exampleEn', 'exampleVi'];
  const sampleRows = [
    ['abandon', 'verb', 'từ bỏ / bỏ rơi', 'Never abandon your dreams.', 'Đừng bao giờ từ bỏ ước mơ của bạn.'],
    ['accurate', 'adjective', 'chính xác', 'The test results were accurate.', 'Kết quả kiểm tra rất chính xác.'],
    ['ambition', 'noun', 'hoài bão / khát vọng', 'She has a strong ambition to succeed.', 'Cô ấy có khát vọng mạnh mẽ để thành công.'],
  ];

  const csvContent = [
    headers.join(','),
    ...sampleRows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  // UTF-8 BOM for Excel Vietnamese Unicode support
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'oxford_flashcard_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
