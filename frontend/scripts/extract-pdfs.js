import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths relative to workspace root
const PDF_DIR = path.resolve(__dirname, '../public/pdfs');
const OUTPUT_FILE = path.resolve(__dirname, '../src/data/parsedDocuments.json');

async function extractPdfText(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  try {
    const parser = new pdf.PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    return result;
  } catch (err) {
    console.error(`Error parsing PDF ${path.basename(filePath)}:`, err);
    return null;
  }
}

// Extract section headers like "Artículo 5", "Sección II", etc.
function detectSection(text, pageNum) {
  const articleRegex = /(Art\xedculo\s+\d+|Secci\xf3n\s+[A-Z0-9IVX]+|Cap\xedtulo\s+[A-Z0-9IVX]+)/i;
  const match = text.match(articleRegex);
  if (match) {
    return match[1].trim();
  }
  return `P\xe1gina ${pageNum}`;
}

// Split text into chunks with overlap
function chunkText(text, docId, docName, pageNum, maxChunkSize = 800, overlap = 150) {
  const chunks = [];
  let index = 0;
  
  while (index < text.length) {
    let endIndex = index + maxChunkSize;
    if (endIndex > text.length) {
      endIndex = text.length;
    }
    
    const chunkText = text.substring(index, endIndex).trim();
    if (chunkText.length > 50) { // Only store chunks with meaningful text length
      chunks.push({
        id: `${docId}-p${pageNum}-c${chunks.length + 1}`,
        documentId: docId,
        documentName: docName,
        pageNumber: pageNum,
        section: detectSection(chunkText, pageNum),
        text: chunkText
      });
    }
    
    if (endIndex === text.length) {
      break;
    }
    index += maxChunkSize - overlap;
  }
  
  return chunks;
}

async function main() {
  console.log('--- Iniciando extracción de PDFs ---');
  if (!fs.existsSync(PDF_DIR)) {
    console.error(`Directorio de PDFs no existe en: ${PDF_DIR}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(PDF_DIR).filter(file => file.toLowerCase().endsWith('.pdf'));
  console.log(`Encontrados ${files.length} archivos PDF en public/pdfs:`);
  
  const allParsedDocs = [];
  let totalChunks = 0;
  
  for (const file of files) {
    const filePath = path.join(PDF_DIR, file);
    const sizeBytes = fs.statSync(filePath).size;
    const sizeKB = (sizeBytes / 1024).toFixed(1);
    
    // Generate clean ID from filename: RH-00 -> rh-00
    const idMatch = file.match(/^(RH-\d+)/i);
    const docId = idMatch ? idMatch[1].toLowerCase() : `doc-${Date.now()}`;
    const originalName = file.replace(/\.pdf$/i, '');
    
    console.log(`- Procesando: ${file} (${sizeKB} KB)...`);
    
    const result = await extractPdfText(filePath);
    if (!result || !result.pages) continue;
    
    const pageCount = result.total;
    let docChunks = [];
    
    for (const page of result.pages) {
      const trimmedPageText = page.text.replace(/\r/g, '').trim();
      if (trimmedPageText.length > 10) {
        const pageChunks = chunkText(trimmedPageText, docId, originalName, page.num);
        docChunks = docChunks.concat(pageChunks);
      }
    }
    
    const docInfo = {
      id: docId,
      fileName: file,
      originalName: originalName,
      description: `Documento oficial corporativo del departamento de Recursos Humanos de Garnier.`,
      status: 'active',
      pageCount: pageCount,
      fileSize: `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB` === '0.0 MB' ? `${sizeKB} KB` : `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Sistema Garnier',
      chunks: docChunks
    };
    
    allParsedDocs.push(docInfo);
    totalChunks += docChunks.length;
    console.log(`  -> Extraído con éxito: ${pageCount} páginas, ${docChunks.length} fragmentos.`);
  }
  
  console.log(`Escribiendo base de datos vectorizada en: ${OUTPUT_FILE}`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allParsedDocs, null, 2), 'utf-8');
  console.log(`--- Fin del proceso. Total de documentos: ${allParsedDocs.length}, Chunks totales: ${totalChunks} ---`);
}

main().catch(err => {
  console.error('Error fatal durante la extracción:', err);
});
