/**
 * 產科實習指導教師 紅色標楷體電子印章產生模組
 */

export function generateTeacherStampDataUrl(
  teacherName: string = '實習指導教師',
  customDateStr?: string
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 120;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 透明背景
  ctx.clearRect(0, 0, 300, 120);

  // 印章顏色：專業紅色印泥色
  const stampRed = '#dc2626';
  // 標楷體字型優先順序
  const kaiFont = '"DFKai-SB", "BiauKai", "Kaiti TC", "KaiTi", "STKaiti", "Microsoft JhengHei", serif';

  // 外雙層印章邊框
  ctx.strokeStyle = stampRed;
  ctx.lineWidth = 3;
  ctx.strokeRect(8, 8, 284, 104);

  ctx.lineWidth = 1;
  ctx.strokeRect(13, 13, 274, 94);

  ctx.fillStyle = stampRed;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 頂部抬頭：標楷體
  ctx.font = `bold 14px ${kaiFont}`;
  ctx.fillText('產科實習指導教師 評閱核定章', 150, 30);

  // 分隔橫線
  ctx.beginPath();
  ctx.moveTo(25, 45);
  ctx.lineTo(275, 45);
  ctx.strokeStyle = stampRed;
  ctx.lineWidth = 1;
  ctx.stroke();

  // 中間教師姓名：大號標楷體
  ctx.font = `bold 26px ${kaiFont}`;
  ctx.fillText(teacherName || '實習指導教師', 150, 68);

  // 底部核定日期（無 NIS 字樣）
  let dateFormatted = customDateStr;
  if (!dateFormatted) {
    const now = new Date();
    dateFormatted = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`;
  } else if (dateFormatted.includes('T')) {
    dateFormatted = dateFormatted.split('T')[0].replace(/-/g, '/');
  }

  ctx.font = `12px ${kaiFont}`;
  ctx.fillText(`核定日期：${dateFormatted}`, 150, 94);

  return canvas.toDataURL('image/png');
}
