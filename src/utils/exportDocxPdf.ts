// Export Utilities for DOCX and PDF / ZIP batch export
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx';
import JSZip from 'jszip';
import { HandoverRecord } from '../types';

/**
 * Builds a formatted Word (.docx) document representation of a HandoverRecord.
 */
export async function generateRecordDocxBlob(record: HandoverRecord): Promise<Blob> {
  const intern = record.internship;
  const basic = record.basicInfo;
  const delivery = record.deliveryProcess;
  const baby = record.babyStatus;
  const maternal = record.maternalAssessment;
  const dart = record.nursingRecord;
  const signatures = record.signatures;
  const adm = record.admissionAssessment;

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 800,
              right: 800,
            },
          },
        },
        children: [
          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: '新生醫護管理專科學校 產科護理學實習個案交班記錄表',
                bold: true,
                size: 28, // 14pt
                color: '1E3A8A',
              }),
            ],
          }),

          // Subheader Meta Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: `實習單位：${intern?.unit || '5B 婦產科病房'}`, bold: true, size: 19 })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: `實習週次：第 ${intern?.week || '1'} 週`, bold: true, size: 19 })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: `填寫日期：${intern?.date || '-'}`, bold: true, size: 19 })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: `實習護生：${intern?.studentName || '-'} (${intern?.studentId || '-'})`, bold: true, size: 19, color: '1D4ED8' })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: `指導教師：${intern?.instructor || '指導教師'}`, bold: true, size: 19 })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: `個案床號：${basic?.bedNumber || '-'} 床 (${basic?.patientName || '-'})`, bold: true, size: 19, color: 'B91C1C' })] })],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 160, after: 60 } }),

          // Section 1: Basic Demographic & Clinical Information
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({
                text: '一、基本資料與入院概況',
                bold: true,
                size: 22,
                color: '1E40AF',
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `產婦姓名：${basic?.patientName || '-'}`, size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `入院日期：${basic?.admissionDate || '-'}`, size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `預產日 (EDC)：${basic?.expectedDeliveryDate || '-'}`, size: 18 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `懷孕週數 (GA)：${basic?.gestationalWeeks || '-'}`, size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `生產史 (G/P)：${basic?.obstetricHistory || '-'}`, size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `主治/主護：${basic?.attendingPhysician || '-'} / ${basic?.primaryNurse || '-'}`, size: 18 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    columnSpan: 3,
                    children: [
                      new Paragraph({ children: [new TextRun({ text: `主診斷：${basic?.primaryDiagnosis || basic?.diagnosis || '未填寫'}`, bold: true, size: 19 })] }),
                      new Paragraph({ children: [new TextRun({ text: `次診斷：${basic?.secondaryDiagnoses?.filter(Boolean).join('、') || '無特殊次診斷'}`, size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: `入院經過：${basic?.admissionCourse || '無特別記錄'}`, size: 18 })] }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Optional: Admission Assessment
          ...(adm?.enabled ? [
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 140, after: 60 },
              children: [
                new TextRun({
                  text: '【附表】入院護理評估紀錄',
                  bold: true,
                  size: 21,
                  color: '0369A1',
                }),
              ],
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `生命徵象：T: ${adm.vitalSigns?.temperature || '-'} °C, P: ${adm.vitalSigns?.pulse || '-'} 次/分, R: ${adm.vitalSigns?.respiration || '-'} 次/分, BP: ${adm.vitalSigns?.systolicBP || '-'}/${adm.vitalSigns?.diastolicBP || '-'} mmHg, SpO2: ${adm.vitalSigns?.spO2 || '-'}%`, size: 17 })] })] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `身型數值：身高 ${adm.height || '-'} cm, 孕前 ${adm.prePregnancyWeight || '-'} kg, 目前 ${adm.currentWeight || '-'} kg, 計算 BMI: ${adm.bmi || '-'}`, size: 17 })] })] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `過敏與血型：藥物過敏(${adm.drugAllergy || '無'}), 食物過敏(${adm.foodAllergy || '無'}), 血型(${adm.patientBloodType || '-'}${adm.patientRh || ''})`, size: 17 })] })] }),
                  ],
                }),
              ],
            }),
          ] : []),

          // Section 2: Delivery Process & Newborn Status
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 60 },
            children: [
              new TextRun({
                text: '二、分娩過程與新生兒評估',
                bold: true,
                size: 22,
                color: '1E40AF',
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `分娩方式：${delivery?.deliveryMode || '-'}`, bold: true, size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `娩出時間：${delivery?.deliveryTime || '-'}`, size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `失血量 (EBL)：${delivery?.bloodLoss || '-'} ml`, bold: true, color: 'B91C1C', size: 18 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    columnSpan: 3,
                    children: [
                      new Paragraph({ children: [new TextRun({ text: `胎盤剝離方式：${delivery?.placentaExpulsionMode || '-'} | 胎盤重量：${delivery?.placentaWeight || '-'} g | 會陰裂傷等級：${delivery?.perinealLaceration || '-'}`, size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: `產程耗時：第一產程(${delivery?.naturalDelivery?.stage1Time || '-'}), 第二產程(${delivery?.naturalDelivery?.stage2Time || '-'}), 第三產程(${delivery?.naturalDelivery?.stage3Time || '-'}), 總產程(${delivery?.naturalDelivery?.totalLaborTime || '-'})`, size: 18 })] }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `新生兒體重：${baby?.weight || '-'} g`, size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `Apgar 計分：1分(${baby?.apgar1Min || '-'}) / 5分(${baby?.apgar5Min || '-'})`, bold: true, size: 18 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `哺餵方式：${baby?.feedingType || '-'} (${baby?.dailyIntake || '-'})`, size: 18 })] })] }),
                ],
              }),
            ],
          }),

          // Section 3: Maternal Status & REEDA Wound Assessment
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 60 },
            children: [
              new TextRun({
                text: '三、產後評估與 REEDA 會陰傷口評估',
                bold: true,
                size: 22,
                color: '1E40AF',
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: `宮底高度：${maternal?.uterus?.fundalHeight || '-'}`, bold: true, size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: `宮縮硬度：${maternal?.uterus?.contraction || '-'} | 位置: ${maternal?.uterus?.position || '-'}`, size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: `惡露性質：${maternal?.uterus?.lochiaType || '-'} (${maternal?.uterus?.lochiaColor || '-'}, ${maternal?.uterus?.lochiaAmount || '-'})`, size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: `乳房外觀與質地：${maternal?.breast?.skinAppearance || '-'} / ${maternal?.breast?.consistency || '-'}`, size: 18 })] }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: 'REEDA 會陰傷口量表：', bold: true, size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: `R(紅): ${maternal?.wound?.perineal?.redness || '-'} | E(腫): ${maternal?.wound?.perineal?.edema || '-'} | E(瘀): ${maternal?.wound?.perineal?.ecchymosis || '-'}`, size: 17 })] }),
                      new Paragraph({ children: [new TextRun({ text: `D(分泌物): ${maternal?.wound?.perineal?.discharge || '-'} | A(近似): ${maternal?.wound?.perineal?.approximation || '-'}`, size: 17 })] }),
                      new Paragraph({ children: [new TextRun({ text: `剖腹產評估：疼痛(${maternal?.wound?.cesarean?.pain || '-'}) | 敷料(${maternal?.wound?.cesarean?.dressing || '-'})`, size: 17 })] }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Section 4: Handover Notes & DART Nursing Focus
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 60 },
            children: [
              new TextRun({
                text: '四、ISBAR 交班事項與 DART 焦點護理記錄',
                bold: true,
                size: 22,
                color: '1E40AF',
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: '交班注意事項 (ISBAR)：', bold: true, size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: record.handoverNotes || '無特殊交班事項。', size: 17 })] }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: `焦點 (Focus)：${dart?.focus || '產後護理指導'}`, bold: true, size: 19, color: '1E40AF' })] }),
                      new Paragraph({ children: [new TextRun({ text: `D (主客觀資料)：${dart?.data || '-'}`, size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: `A (護理措施)：${dart?.action || '-'}`, size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: `R (成效評估)：${dart?.response || '-'}`, size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: `T (衛教指導)：${dart?.teaching || '-'}`, size: 18 })] }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Section 5: Evaluation & Digital Signatures
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 140, after: 60 },
            children: [
              new TextRun({
                text: '五、護生簽署與指導教師評閱簽核',
                bold: true,
                size: 22,
                color: '1E40AF',
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: `護生簽名：${intern?.studentName || '-'}`, bold: true, size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: `簽署狀態：${signatures?.studentSignature ? '✓ 已完成手寫簽名' : '待簽署'}`, size: 17 })] }),
                      new Paragraph({ children: [new TextRun({ text: `簽署時間：${signatures?.studentSignedAt || '尚未完成簽署'}`, size: 16, color: '64748B' })] }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ children: [new TextRun({ text: `實習核定成績：${signatures?.score || '尚未給分'}`, bold: true, size: 19, color: '047857' })] }),
                      new Paragraph({ children: [new TextRun({ text: `教師評語：${signatures?.instructorComment || '(無特別評語)'}`, size: 17 })] }),
                      new Paragraph({ children: [new TextRun({ text: `指導教師簽章：${signatures?.instructorSignature ? '已簽署核定' : '待批閱簽章'}`, bold: true, size: 17 })] }),
                      new Paragraph({ children: [new TextRun({ text: `核章時間：${signatures?.instructorSignedAt || '-'}`, size: 16, color: '64748B' })] }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Downloads a single record as Word (.docx).
 */
export async function exportSingleRecordDocx(record: HandoverRecord): Promise<void> {
  const blob = await generateRecordDocxBlob(record);
  const studentName = record.internship?.studentName || '護生';
  const weekNumber = record.internship?.week || '1';
  const bedNumber = record.basicInfo?.bedNumber || '個案';
  const fileName = `產科實習作業_第${weekNumber}週_${studentName}_${bedNumber}床_${new Date().toISOString().slice(0, 10)}.docx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Bulk exports multiple selected records into a packaged .zip file containing .docx documents.
 */
export async function bulkExportRecordsDocxZip(
  records: HandoverRecord[],
  zipTitle: string = '產科實習作業批次匯出'
): Promise<void> {
  if (records.length === 0) return;

  const zip = new JSZip();
  const folder = zip.folder(zipTitle) || zip;

  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    const blob = await generateRecordDocxBlob(rec);
    const sName = rec.internship?.studentName || `護生_${i + 1}`;
    const sId = rec.internship?.studentId || '未填學號';
    const wk = rec.internship?.week || '1';
    const bed = rec.basicInfo?.bedNumber || `床號${i + 1}`;
    const safeDocName = `${(i + 1).toString().padStart(2, '0')}_第${wk}週_${sName}_${sId}_${bed}床.docx`;
    folder.file(safeDocName, blob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${zipTitle}_${records.length}份_${new Date().toISOString().slice(0, 10)}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Print / Save multiple records as formatted PDF with complete clinical details and styling.
 */
export function printRecordsAsPdf(records: HandoverRecord[]): void {
  if (records.length === 0) return;

  const printWindow = window.open('', '_blank', 'width=1150,height=900');
  if (!printWindow) {
    alert('無法開啟列印視窗，請檢查瀏覽器是否封鎖了彈出視窗。');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <meta charset="utf-8" />
      <title>產科實習作業 完整排版列印 / PDF 匯出 (${records.length} 份)</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm 12mm;
        }
        *, *:before, *:after {
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "PingFang TC", "Microsoft JhengHei", "Segoe UI", Roboto, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 0;
          font-size: 12px;
          line-height: 1.45;
          background-color: #f8fafc;
        }
        .page-container {
          background-color: #ffffff;
          max-width: 210mm;
          margin: 0 auto 20px auto;
          padding: 12mm 15mm;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        .page-break {
          page-break-after: always;
          break-after: page;
        }
        .header-box {
          border-bottom: 2px solid #0f172a;
          padding-bottom: 8px;
          margin-bottom: 10px;
          text-align: center;
        }
        .school-name {
          font-size: 12px;
          font-weight: bold;
          color: #475569;
          letter-spacing: 1px;
        }
        .header-title {
          color: #0f172a;
          font-size: 18px;
          font-weight: 900;
          letter-spacing: -0.5px;
          margin: 3px 0 2px 0;
        }
        .sub-header-bar {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #64748b;
        }
        .meta-table, .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        .meta-table td {
          border: 1px solid #cbd5e1;
          padding: 5px 8px;
          background-color: #f8fafc;
          font-size: 11.5px;
        }
        .data-table th, .data-table td {
          border: 1px solid #cbd5e1;
          padding: 5px 7px;
          text-align: left;
          font-size: 11.5px;
          vertical-align: top;
        }
        .data-table th {
          background-color: #f1f5f9;
          font-weight: bold;
          color: #1e293b;
          width: 18%;
        }
        .section-header {
          font-size: 13px;
          font-weight: bold;
          color: #0f172a;
          background-color: #f1f5f9;
          padding: 4px 8px;
          margin-top: 10px;
          margin-bottom: 5px;
          border-left: 4px solid #0284c7;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .tag-badge {
          display: inline-block;
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 10.5px;
          font-weight: bold;
          background: #e0f2fe;
          color: #0369a1;
        }
        .reeda-table {
          width: 100%;
          border-collapse: collapse;
          margin: 4px 0;
          font-size: 11px;
        }
        .reeda-table th, .reeda-table td {
          border: 1px solid #cbd5e1;
          padding: 4px 6px;
          text-align: center;
        }
        .reeda-table th {
          background-color: #f8fafc;
          font-weight: bold;
        }
        .signature-box {
          border: 1px dashed #94a3b8;
          background: #ffffff;
          padding: 4px;
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .signature-img {
          max-height: 44px;
          max-width: 160px;
          object-fit: contain;
        }
        .seal-stamp {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border: 2px solid #b91c1c;
          color: #b91c1c;
          border-radius: 50%;
          font-weight: 900;
          font-size: 10.5px;
          text-align: center;
          line-height: 1.1;
          padding: 2px;
          transform: rotate(-5deg);
        }
        @media print {
          body {
            background-color: #ffffff;
          }
          .page-container {
            box-shadow: none;
            margin: 0;
            padding: 0;
            max-width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="background:#0f172a; padding:12px; color:#fff; text-align:center; position:sticky; top:0; z-index:999; box-shadow:0 2px 8px rgba(0,0,0,0.2);">
        <span style="font-weight:bold; font-size:14px; margin-right:16px;">產科實習作業全覽列印預覽（共 ${records.length} 份）</span>
        <button onclick="window.print()" style="padding:7px 20px; font-size:13px; font-weight:bold; background:#0284c7; color:#fff; border:none; border-radius:6px; cursor:pointer;">
          🖨️ 立即列印或儲存為 PDF
        </button>
        <button onclick="window.close()" style="margin-left:10px; padding:7px 14px; font-size:13px; background:#334155; color:#f8fafc; border:none; border-radius:6px; cursor:pointer;">
          關閉視窗
        </button>
      </div>

      ${records.map((r, idx) => {
        const intern = r.internship;
        const basic = r.basicInfo;
        const delivery = r.deliveryProcess;
        const baby = r.babyStatus;
        const maternal = r.maternalAssessment;
        const dart = r.nursingRecord;
        const signatures = r.signatures;
        const adm = r.admissionAssessment;

        // Calculate REEDA Total
        const rVal = parseInt(maternal?.wound?.perineal?.redness || '0', 10) || 0;
        const e1Val = parseInt(maternal?.wound?.perineal?.edema || '0', 10) || 0;
        const e2Val = parseInt(maternal?.wound?.perineal?.ecchymosis || '0', 10) || 0;
        const dVal = parseInt(maternal?.wound?.perineal?.discharge || '0', 10) || 0;
        const aVal = parseInt(maternal?.wound?.perineal?.approximation || '0', 10) || 0;
        const reedaTotal = rVal + e1Val + e2Val + dVal + aVal;

        return `
          <div class="page-container ${idx < records.length - 1 ? 'page-break' : ''}">
            
            <!-- Document Header -->
            <div class="header-box">
              <div class="school-name">新生醫護管理專科學校 · 護理科五專臨床實習</div>
              <h1 class="header-title">產科護理學實習個案交班過程記錄表</h1>
              <div class="sub-header-bar">
                <span>實習單位：<strong>${intern?.unit || '5B 產科病房'}</strong></span>
                <span>實習週次：<strong>第 ${intern?.week || '1'} 週</strong></span>
                <span>列印產出時間：<strong>${new Date().toLocaleString('zh-TW')}</strong></span>
              </div>
            </div>

            <!-- Meta Top Table -->
            <table class="meta-table">
              <tr>
                <td style="width:25%"><strong>實習護生：</strong><span style="color:#0369a1; font-weight:bold;">${intern?.studentName || '-'}</span> (${intern?.studentId || '-'})</td>
                <td style="width:25%"><strong>指導教師：</strong>${intern?.instructor || '指導教師'}</td>
                <td style="width:25%"><strong>個案床號：</strong><span style="color:#b91c1c; font-weight:bold;">${basic?.bedNumber || '-'} 床</span></td>
                <td style="width:25%"><strong>產婦姓名：</strong><strong>${basic?.patientName || '-'}</strong></td>
              </tr>
            </table>

            <!-- Section 1: Basic Information -->
            <div class="section-header">
              <span>一、產婦基本資料與主訴診斷</span>
              <span class="tag-badge">G/P: ${basic?.obstetricHistory || '-'} | GA: ${basic?.gestationalWeeks || '-'}</span>
            </div>
            <table class="data-table">
              <tr>
                <th>入院日期 / EDC</th>
                <td>${basic?.admissionDate || '-'} / 預產期：${basic?.expectedDeliveryDate || '-'}</td>
                <th>主治 / 主護</th>
                <td>${basic?.attendingPhysician || '-'} / ${basic?.primaryNurse || '-'}</td>
              </tr>
              <tr>
                <th>主診斷 (Primary)</th>
                <td colspan="3"><strong style="color:#0f172a;">${basic?.primaryDiagnosis || basic?.diagnosis || '未填寫主診斷'}</strong></td>
              </tr>
              <tr>
                <th>次診斷 (Secondary)</th>
                <td colspan="3">${basic?.secondaryDiagnoses?.filter(Boolean).join('、') || '無特殊次診斷'}</td>
              </tr>
              <tr>
                <th>入院主訴與經過</th>
                <td colspan="3">${basic?.admissionCourse ? basic.admissionCourse.replace(/\n/g, '<br/>') : '無特別記載'}</td>
              </tr>
            </table>

            ${adm?.enabled ? `
              <!-- Admission Assessment Detail Block -->
              <div class="section-header" style="background:#f0fdf4; border-left-color:#16a34a;">
                <span>【補充】入院護理評估 (Admission Assessment)</span>
                <span class="tag-badge" style="background:#dcfce7; color:#15803d;">BMI: ${adm.bmi || '-'}</span>
              </div>
              <table class="data-table">
                <tr>
                  <th>生命徵象 (VS)</th>
                  <td>T: ${adm.vitalSigns?.temperature || '-'} °C, P: ${adm.vitalSigns?.pulse || '-'} bpm, R: ${adm.vitalSigns?.respiration || '-'} bpm, BP: ${adm.vitalSigns?.systolicBP || '-'}/${adm.vitalSigns?.diastolicBP || '-'} mmHg, SpO2: ${adm.vitalSigns?.spO2 || '-'}%</td>
                  <th>身高體重</th>
                  <td>身高: ${adm.height || '-'} cm, 孕前: ${adm.prePregnancyWeight || '-'} kg, 目前: ${adm.currentWeight || '-'} kg</td>
                </tr>
                <tr>
                  <th>血型與過敏</th>
                  <td>血型: ${adm.patientBloodType || '-'}${adm.patientRh || ''} (配偶: ${adm.spouseBloodType || '-'}${adm.spouseRh || ''}) | 藥物過敏: ${adm.drugAllergy || '無'} | 食物過敏: ${adm.foodAllergy || '無'}</td>
                  <th>婦產科病史</th>
                  <td>月經: ${adm.menstrualStatus || '-'}, LMP: ${adm.lmp || '-'}, 抹片: ${adm.papSmear || '-'}, 乳房自檢: ${adm.breastSelfExam || '-'}</td>
                </tr>
              </table>
            ` : ''}

            <!-- Section 2: Delivery Process & Newborn -->
            <div class="section-header">
              <span>二、分娩過程與新生兒現況評估</span>
              <span class="tag-badge">分娩：${delivery?.deliveryMode || '-'}</span>
            </div>
            <table class="data-table">
              <tr>
                <th>分娩方式 / 娩出時間</th>
                <td><strong style="color:#6b21a8;">${delivery?.deliveryMode || '-'}</strong> (${delivery?.deliveryTime || '-'})</td>
                <th>失血量 / 胎盤重量</th>
                <td><strong style="color:#b91c1c;">EBL: ${delivery?.bloodLoss || '-'} ml</strong> | 胎盤: ${delivery?.placentaWeight || '-'} g</td>
              </tr>
              <tr>
                <th>胎盤剝離 / 會陰裂傷</th>
                <td>剝離方式：${delivery?.placentaExpulsionMode || '-'}</td>
                <td>裂傷等級：<strong>${delivery?.perinealLaceration || '-'}</strong></td>
              </tr>
              <tr>
                <th>產程時間細項</th>
                <td colspan="3">
                  第一產程: <strong>${delivery?.naturalDelivery?.stage1Time || '-'}</strong> | 
                  第二產程: <strong>${delivery?.naturalDelivery?.stage2Time || '-'}</strong> | 
                  第三產程: <strong>${delivery?.naturalDelivery?.stage3Time || '-'}</strong> | 
                  第四產程: <strong>${delivery?.naturalDelivery?.stage4Time || '-'}</strong> | 
                  總產程: <strong style="color:#0369a1;">${delivery?.naturalDelivery?.totalLaborTime || '-'}</strong>
                </td>
              </tr>
              <tr>
                <th>新生兒狀況</th>
                <td>體重: <strong>${baby?.weight || '-'} g</strong> | 身高: ${baby?.height || '-'} cm</td>
                <th>Apgar 計分</th>
                <td>1 分鐘: <strong style="color:#0284c7;">${baby?.apgar1Min || '-'} 分</strong> | 5 分鐘: <strong style="color:#16a34a;">${baby?.apgar5Min || '-'} 分</strong></td>
              </tr>
              <tr>
                <th>哺餵與特殊狀況</th>
                <td>哺餵方式: ${baby?.feedingType || '-'} (${baby?.formulaBrand || ''}) | 今日奶量: ${baby?.dailyIntake || '-'}</td>
                <th>寶寶位置 / 特殊情況</th>
                <td>${baby?.location || '嬰兒室'} ${baby?.specialConditions ? `(${baby.specialConditions})` : ''}</td>
              </tr>
            </table>

            <!-- Section 3: Maternal Postpartum Assessment & REEDA -->
            <div class="section-header">
              <span>三、產後身心狀況與 REEDA 會陰傷口評估</span>
              <span class="tag-badge">REEDA 總分：${reedaTotal} 分</span>
            </div>
            <table class="data-table">
              <tr>
                <th>乳房評估 (Breast)</th>
                <td colspan="3">外觀: ${maternal?.breast?.skinAppearance || '-'} | 質地: ${maternal?.breast?.consistency || '-'} | 乳頭: ${maternal?.breast?.nippleShape || '-'} (${maternal?.breast?.nippleIntegrity || '-'}) | 泌乳: 右(${maternal?.breast?.lactationRight || '-'} ${maternal?.breast?.lactationRightAmount || ''}ml) 左(${maternal?.breast?.lactationLeft || '-'} ${maternal?.breast?.lactationLeftAmount || ''}ml)</td>
              </tr>
              <tr>
                <th>子宮與惡露 (Uterus)</th>
                <td colspan="3">
                  宮底高度: <strong style="color:#0369a1;">${maternal?.uterus?.fundalHeight || '-'}</strong> | 
                  宮縮硬度: ${maternal?.uterus?.contraction || '-'} | 
                  子宮位置: ${maternal?.uterus?.position || '-'} | 
                  疼痛評分: ${maternal?.uterus?.painScore || '-'} 分 | 
                  惡露: <strong style="color:#b91c1c;">${maternal?.uterus?.lochiaType || '-'}</strong> (${maternal?.uterus?.lochiaColor || '-'}, ${maternal?.uterus?.lochiaAmount || '-'}) | 血塊: ${maternal?.uterus?.bloodClots || '無'}
                </td>
              </tr>
              <tr>
                <th>會陰傷口 REEDA 量表</th>
                <td colspan="3">
                  <table class="reeda-table">
                    <tr>
                      <th>Redness (紅)</th>
                      <th>Edema (腫)</th>
                      <th>Ecchymosis (瘀斑)</th>
                      <th>Discharge (分泌物)</th>
                      <th>Approximation (癒合近似)</th>
                      <th>REEDA 總計</th>
                    </tr>
                    <tr>
                      <td>${maternal?.wound?.perineal?.redness || '0'} 分</td>
                      <td>${maternal?.wound?.perineal?.edema || '0'} 分</td>
                      <td>${maternal?.wound?.perineal?.ecchymosis || '0'} 分</td>
                      <td>${maternal?.wound?.perineal?.discharge || '0'} 分</td>
                      <td>${maternal?.wound?.perineal?.approximation || '0'} 分</td>
                      <td><strong style="color:${reedaTotal > 3 ? '#b91c1c' : '#16a34a'}; font-size:12.5px;">${reedaTotal} 分</strong></td>
                    </tr>
                  </table>
                </td>
              </tr>
              ${maternal?.wound?.cesarean?.pain || maternal?.wound?.cesarean?.dressing ? `
                <tr>
                  <th>剖腹產傷口評估</th>
                  <td colspan="3">疼痛情形: ${maternal.wound?.cesarean?.pain || '-'} | 敷料狀況: ${maternal.wound?.cesarean?.dressing || '-'} | 傷口外觀: ${maternal.wound?.cesarean?.color || '-'} | 換藥日: ${maternal.wound?.cesarean?.dressingChangeDate || '-'}</td>
                </tr>
              ` : ''}
            </table>

            <!-- Section 4: ISBAR & DART -->
            <div class="section-header">
              <span>四、ISBAR 臨床交班要點與 DART 焦點護理記錄</span>
              <span class="tag-badge">焦點：${dart?.focus || '產後護理'}</span>
            </div>
            <table class="data-table">
              <tr>
                <th style="width:18%;">ISBAR 交班事項</th>
                <td colspan="3" style="background:#fafafa; font-style:normal;">${r.handoverNotes ? r.handoverNotes.replace(/\n/g, '<br/>') : '無特殊交班記錄事項'}</td>
              </tr>
              <tr>
                <th>D (主客觀資料)</th>
                <td colspan="3">${dart?.data ? dart.data.replace(/\n/g, '<br/>') : '-'}</td>
              </tr>
              <tr>
                <th>A (護理措施)</th>
                <td colspan="3">${dart?.action ? dart.action.replace(/\n/g, '<br/>') : '-'}</td>
              </tr>
              <tr>
                <th>R (評估成效)</th>
                <td colspan="3">${dart?.response ? dart.response.replace(/\n/g, '<br/>') : '-'}</td>
              </tr>
              <tr>
                <th>T (衛教指導)</th>
                <td colspan="3">${dart?.teaching ? dart.teaching.replace(/\n/g, '<br/>') : '-'}</td>
              </tr>
            </table>

            <!-- Section 5: Signatures & Teacher Review Evaluation -->
            <div class="section-header">
              <span>五、護生簽名與指導教師評核簽章</span>
              <span class="tag-badge" style="background:#dcfce7; color:#15803d;">核定成績：${signatures?.score || '尚未評分'}</span>
            </div>
            <table class="data-table">
              <tr>
                <th style="width:18%;">實習護生手寫簽名</th>
                <td style="width:32%;">
                  <div class="signature-box">
                    ${signatures?.studentSignature ? `
                      <img src="${signatures.studentSignature}" class="signature-img" alt="護生簽名" />
                    ` : `
                      <span style="color:#94a3b8; font-size:11px;">待護生個人簽章</span>
                    `}
                  </div>
                  <div style="font-size:10px; color:#64748b; margin-top:3px;">簽署時間：${signatures?.studentSignedAt || '-'}</div>
                </td>
                <th style="width:18%;">實習成績等第</th>
                <td style="width:32%;">
                  <div style="font-size:16px; font-weight:900; color:#15803d;">${signatures?.score || '待指導教師核定'}</div>
                  <div style="font-size:10.5px; color:#64748b;">核定時間：${signatures?.instructorSignedAt || '-'}</div>
                </td>
              </tr>
              <tr>
                <th>指導教師具體評語</th>
                <td colspan="3" style="background:#f8fafc; font-weight:500;">
                  ${signatures?.instructorComment ? signatures.instructorComment.replace(/\n/g, '<br/>') : '（尚無特別指導評語）'}
                </td>
              </tr>
              <tr>
                <th>指導教師審核簽章</th>
                <td colspan="3">
                  <div style="display:flex; align-items:center; justify-content:space-between; min-height:44px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                      ${signatures?.instructorSignature ? `
                        <img src="${signatures.instructorSignature}" class="signature-img" alt="指導教師簽章" />
                      ` : `
                        <span style="color:#94a3b8; font-size:11px;">（待指導教師批閱簽章）</span>
                      `}
                    </div>
                    <div style="text-align:right; font-size:10px; color:#64748b;">
                      審核狀態：<span style="color:#15803d; font-weight:bold;">${signatures?.instructorSignature || signatures?.score ? '✓ 評核完畢' : '待教師批閱'}</span>
                    </div>
                  </div>
                </td>
              </tr>
            </table>

          </div>
        `;
      }).join('')}
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
