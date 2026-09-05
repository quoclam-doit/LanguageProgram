export function downloadCsvTemplate(): void {
  const headers = ['term', 'partOfSpeech', 'meaning', 'exampleEn', 'exampleVi'];
  const sampleRows = [
    ['proud of', 'adjective phrase', 'tự hào về', 'She is proud of her academic achievements.', 'Cô ấy tự hào về những thành tích học tập của mình.'],
    ['familiar with', 'adjective phrase', 'quen thuộc với', 'I am familiar with the software used in the company.', 'Tôi đã quen thuộc với phần mềm được sử dụng ở công ty.'],
    ['interested in', 'adjective phrase', 'hứng thú với', 'He is interested in learning foreign languages.', 'Anh ấy rất hứng thú với việc học ngoại ngữ.'],
    ['good at', 'adjective phrase', 'giỏi về', 'She is exceptionally good at solving complex math problems.', 'Cô ấy đặc biệt giỏi về việc giải các bài toán phức tạp.'],
    ['capable of', 'adjective phrase', 'có khả năng', 'She is capable of handling high-stress situations.', 'Cô ấy có khả năng xử lý các tình huống nhiều áp lực.'],
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
  link.setAttribute('download', 'ielts_flashcard_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
