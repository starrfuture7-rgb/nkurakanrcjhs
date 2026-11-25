/**
 * Minimal, dependency-free PDF 1.4 generator for Nkurakan R/C JHS learning materials.
 * Ensures every curriculum outline, class note, assignment, or BECE study guide
 * downloads as a genuine, standards-compliant .pdf document.
 */

function escapePdfText(input: string): string {
  return input
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapText(text: string, maxChars: number): string[] {
  const paragraphs = text.split(/\r?\n/);
  const lines: string[] = [];

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      lines.push('');
      continue;
    }
    const words = trimmed.split(/\s+/);
    let current = '';
    for (const word of words) {
      if ((current + ' ' + word).trim().length > maxChars) {
        if (current) lines.push(current);
        current = word;
      } else {
        current = current ? `${current} ${word}` : word;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

export interface PdfDocumentInput {
  schoolName: string;
  location: string;
  title: string;
  subtitle: string;
  metaLine: string;
  body: string;
}

export function generateLearningMaterialPdf(doc: PdfDocumentInput): Buffer {
  const bodyLines = wrapText(doc.body, 82);
  const linesPerPage = 42;
  const pagesContent: string[][] = [];

  for (let i = 0; i < Math.max(1, bodyLines.length); i += linesPerPage) {
    pagesContent.push(bodyLines.slice(i, i + linesPerPage));
  }

  const objects: string[] = [];
  const addObject = (content: string): number => {
    objects.push(content);
    return objects.length;
  };

  // 1: Catalog, 2: Pages placeholder, 3: Regular Font, 4: Bold Font
  const catalogId = addObject('');
  const pagesId = addObject('');
  const regularFontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const boldFontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  const pageIds: number[] = [];

  pagesContent.forEach((pageLines, pageIndex) => {
    const streamCommands: string[] = [];

    // Header band in burgundy / navy text
    streamCommands.push('0.447 0.110 0.180 rg');
    streamCommands.push('50 755 495 2 re f');

    streamCommands.push('0.059 0.137 0.259 rg');
    streamCommands.push('BT');
    streamCommands.push('/F2 11 Tf');
    streamCommands.push(`50 765 Td (${escapePdfText(doc.schoolName)}) Tj`);
    streamCommands.push('ET');

    streamCommands.push('0.35 0.35 0.35 rg');
    streamCommands.push('BT');
    streamCommands.push('/F1 8.5 Tf');
    streamCommands.push(`50 740 Td (${escapePdfText(doc.location)}) Tj`);
    streamCommands.push('ET');

    let cursorY = 710;

    if (pageIndex === 0) {
      streamCommands.push('0.067 0.110 0.188 rg');
      streamCommands.push('BT');
      streamCommands.push('/F2 16 Tf');
      streamCommands.push(`50 ${cursorY} Td (${escapePdfText(doc.title.slice(0, 70))}) Tj`);
      streamCommands.push('ET');
      cursorY -= 20;

      streamCommands.push('0.447 0.110 0.180 rg');
      streamCommands.push('BT');
      streamCommands.push('/F2 10 Tf');
      streamCommands.push(`50 ${cursorY} Td (${escapePdfText(doc.subtitle)}) Tj`);
      streamCommands.push('ET');
      cursorY -= 15;

      streamCommands.push('0.35 0.35 0.35 rg');
      streamCommands.push('BT');
      streamCommands.push('/F1 9 Tf');
      streamCommands.push(`50 ${cursorY} Td (${escapePdfText(doc.metaLine)}) Tj`);
      streamCommands.push('ET');
      cursorY -= 14;

      streamCommands.push('0.85 0.83 0.78 rg');
      streamCommands.push(`50 ${cursorY} 495 1 re f`);
      cursorY -= 22;
    }

    streamCommands.push('0.12 0.14 0.18 rg');
    for (const line of pageLines) {
      if (cursorY < 60) break;
      if (line.trim()) {
        const isHeading =
          line.endsWith(':') ||
          /^(WEEK|UNIT|TOPIC|SECTION|OBJECTIVE|PART|ACTIVITY|QUESTIONS)/i.test(line.trim());
        streamCommands.push('BT');
        streamCommands.push(`${isHeading ? '/F2' : '/F1'} 10.5 Tf`);
        streamCommands.push(`50 ${cursorY} Td (${escapePdfText(line)}) Tj`);
        streamCommands.push('ET');
      }
      cursorY -= 15;
    }

    // Footer
    streamCommands.push('0.45 0.45 0.45 rg');
    streamCommands.push('BT');
    streamCommands.push('/F1 8 Tf');
    streamCommands.push(
      `50 38 Td (${escapePdfText(`Nkurakan R/C JHS · Academic Resource · Page ${pageIndex + 1} of ${pagesContent.length}`)}) Tj`
    );
    streamCommands.push('ET');

    const streamStr = streamCommands.join('\n');
    const contentId = addObject(
      `<< /Length ${Buffer.byteLength(streamStr, 'utf8')} >>\nstream\n${streamStr}\nendstream`
    );
    const pageId = addObject(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${regularFontId} 0 R /F2 ${boldFontId} 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    pageIds.push(pageId);
  });

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];

  objects.forEach((obj, index) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${index + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'utf8');
}
