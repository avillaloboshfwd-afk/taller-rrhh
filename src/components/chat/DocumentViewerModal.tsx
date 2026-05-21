import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, FileText, Calendar, User2, BadgeCheck } from 'lucide-react';
import type { Document, Source } from '../../types';

interface DocumentViewerModalProps {
  document: Document;
  source?: Source;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ document, source, onClose }) => {
  const [page, setPage] = useState<number>(source?.pageNumber || 1);
  const [zoom, setZoom] = useState<number>(100);

  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (page < document.pageCount) setPage((prev) => prev + 1);
  };

  // Mock text content for PDF pages based on document ID
  const getPageContent = (docId: string, pageNum: number) => {
    if (source && source.documentId === docId && source.pageNumber === pageNum) {
      return {
        title: source.section,
        text: `... Garnier garantiza que los colaboradores comprendan y respeten las normativas internas detalladas en esta sección. En el caso específico tratado, se establece un marco regulatorio claro. Los beneficios, responsabilidades y deberes correspondientes deben cumplirse a cabalidad por ambas partes, asegurando un ambiente de respeto, transparencia y eficiencia organizativa. Cualquier violación a lo aquí dispuesto será sancionada conforme al régimen disciplinario vigente ...`,
        highlight: true,
      };
    }

    // Default mock contents
    const contents: Record<string, string[]> = {
      'doc-001': [
        'Capítulo I — Disposiciones Generales: Ámbito de aplicación, principios y ética profesional.',
        'Capítulo II — Ingreso y Selección: Requisitos, contratos de trabajo y período de prueba de 3 meses.',
        'Capítulo III — Jornada de Trabajo: Horarios ordinarios y extraordinarios, descansos y asistencia.',
        'Capítulo IV — Derechos y Obligaciones: Deberes del patrono y de los colaboradores.',
        'Capítulo V — Salarios y Compensaciones: Pagos, deducciones y aguinaldo conforme al código de trabajo.',
        'Capítulo VI — Vacaciones: Régimen de vacaciones ordinarias y acumulación de días por antigüedad.',
      ],
      'doc-002': [
        'Sección 1 — Introducción: Fundamento legal del teletrabajo y objetivos de flexibilidad.',
        'Sección 2 — Requisitos de Conexión: Internet mínimo de 30 Mbps simétrico, router seguro y VPN activa.',
        'Sección 3 — Modalidades y Requisitos: Teletrabajo parcial hasta 3 días por semana previa aprobación.',
        'Sección 4 — Salud y Ergonomía: Mobiliario apto, iluminación y pausas activas programadas.',
        'Sección 5 — Equipamiento y Recursos: Provisión de laptop, mouse, teclado corporativo y subsidio mensual.',
        'Sección 6 — Cumplimiento y Reportes: Evaluación de desempeño por objetivos y disponibilidad en Teams.',
      ],
    };

    const docContents = contents[docId] || [
      `Sección General de este reglamento - Página ${pageNum}.`,
      `Políticas y lineamientos institucionales aprobados por el departamento de Recursos Humanos de Garnier.`,
      `Artículo complementario para la regulación de operaciones, deberes laborales y bienestar general.`,
    ];

    const idx = (pageNum - 1) % docContents.length;
    return {
      title: `Sección Reguladora ${pageNum}`,
      text: docContents[idx] + '\n\nEste documento tiene carácter confidencial y de uso exclusivo para colaboradores activos de Garnier. Toda reproducción o distribución externa está prohibida.',
      highlight: false,
    };
  };

  const pageData = getPageContent(document.id, page);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 modal-backdrop animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800 animate-scale-in">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight truncate max-w-md">
                {document.originalName}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {document.fileName} • {document.fileSize}
              </p>
            </div>
          </div>

          {/* PDF Tools */}
          <div className="flex items-center gap-3">
            {/* Page navigation */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-sm font-medium">
              <button
                onClick={handlePrevPage}
                disabled={page <= 1}
                className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-slate-700 dark:text-slate-300">
                Pág. {page} / {document.pageCount}
              </span>
              <button
                onClick={handleNextPage}
                disabled={page >= document.pageCount}
                className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-sm font-medium text-slate-700 dark:text-slate-300">
              <button
                onClick={() => setZoom((z) => Math.max(z - 10, 50))}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-xs">{zoom}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(z + 10, 150))}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Download Mock */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert('Simulación de descarga en formato PDF original.');
              }}
              className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
              title="Descargar PDF"
            >
              <Download className="w-4 h-4" />
            </a>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workspace Panels */}
        <div className="flex-1 flex overflow-hidden">
          {/* PDF Viewer Pane */}
          <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-8 flex justify-center overflow-auto relative">
            <div
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-md p-12 w-full max-w-2xl h-fit min-h-[750px] relative transition-transform duration-200"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            >
              {/* PDF Sheet Mock header */}
              <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-600 border-b border-slate-100 dark:border-slate-800 pb-4 mb-8">
                <span>GARNIER S.A. • REGLAMENTO INTERNO</span>
                <span>PÁGINA {page}</span>
              </div>

              {/* PDF Content */}
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 mb-6 font-serif">
                  {pageData.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans text-sm mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam elementum sodales risus eget
                  ornare. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos
                  himenaeos. Integer quis leo vitae arcu volutpat convallis at sed risus.
                </p>

                {pageData.highlight ? (
                  <div className="relative my-6 p-6 bg-brand-50/50 dark:bg-brand-950/10 border-l-4 border-brand-500 rounded-r-xl shadow-sm">
                    <span className="absolute top-2 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center gap-1 border border-brand-200/50">
                      <BadgeCheck className="w-3 h-3" /> TEXTO CITADO POR LA IA
                    </span>
                    <p className="text-slate-800 dark:text-slate-300 font-semibold italic leading-relaxed text-sm">
                      {pageData.text}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm mb-4">
                    {pageData.text}
                  </p>
                )}

                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                  Morbi hendrerit tempor sapien at tempus. Vivamus eget dictum felis. Phasellus at erat in leo
                  condimentum volutpat eget sit amet lectus. In molestie metus ut risus mollis pulvinar.
                  Vestibulum nec mi finibus, aliquet sapien at, gravida libero.
                </p>
              </div>

              {/* Watermark */}
              <div className="absolute bottom-6 left-12 right-12 flex justify-between text-[10px] font-semibold tracking-wider text-slate-300 dark:text-slate-800 border-t border-slate-100 dark:border-slate-850 pt-4">
                <span>POLÍTICA CORPORATIVA OFICIAL</span>
                <span>CONFIDENCIAL</span>
              </div>
            </div>
          </div>

          {/* RAG Metadata sidebar */}
          <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col gap-6 overflow-y-auto">
            <div>
              <h3 className="font-bold text-slate-850 dark:text-slate-200 text-sm uppercase tracking-wider mb-3">
                Información de RAG
              </h3>
              {source ? (
                <div className="p-4 bg-brand-50/40 dark:bg-brand-950/10 border border-brand-100 dark:border-brand-900/30 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-500">Similitud Vectorial:</span>
                    <span className="font-bold text-brand-600 dark:text-brand-400">
                      {(source.similarity * 100).toFixed(0)}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full"
                      style={{ width: `${source.similarity * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Esta sección fue indexada en la base vectorial del agente y coincide con la consulta mediante búsqueda semántica.
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 rounded-lg italic">
                  Visualizando documento completo. Usa los controles de paginación para navegar por las secciones.
                </div>
              )}
            </div>

            <div>
              <h3 className="font-bold text-slate-850 dark:text-slate-200 text-sm uppercase tracking-wider mb-3">
                Metadatos del Archivo
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5" /> Subido el:
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-350">
                    {new Date(document.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <User2 className="w-3.5 h-3.5" /> Cargado por:
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-350">
                    {document.uploadedBy}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <FileText className="w-3.5 h-3.5" /> Total Páginas:
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-350">
                    {document.pageCount} págs.
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-850 dark:text-slate-200 text-sm uppercase tracking-wider mb-2">
                Descripción
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {document.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
