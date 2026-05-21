import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, Trash2, Shield, Eye, Database, AlertCircle, FileUp } from 'lucide-react';
import type { Document } from '../../types';

interface DocumentManagerProps {
  documents: Document[];
  onUploadDocument: (doc: Omit<Document, 'id' | 'uploadedAt'>) => void;
  onToggleStatus: (id: string) => void;
  onDeleteDocument: (id: string) => void;
  onViewDocument: (doc: Document) => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents,
  onUploadDocument,
  onToggleStatus,
  onDeleteDocument,
  onViewDocument,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStepText, setUploadStepText] = useState('');
  const [simulatedFileName, setSimulatedFileName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      simulateUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      simulateUpload(files[0]);
    }
  };

  // Simulated advanced RAG ingestion process
  const simulateUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setSimulatedFileName(file.name);
    
    const steps = [
      { progress: 15, text: 'Leyendo y extrayendo texto del documento...' },
      { progress: 40, text: 'Segmentando contenido en fragmentos (chunking)...' },
      { progress: 70, text: 'Generando embeddings semánticos vectoriales (Ada-002)...' },
      { progress: 95, text: 'Indexando en base de datos vectorial (Pinecone)...' },
      { progress: 100, text: 'Documento indexado y listo para RAG!' },
    ];

    let currentStep = 0;
    
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setUploadProgress(steps[currentStep].progress);
        setUploadStepText(steps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        
        // Compute realistic pages count based on file size/name
        const simulatedPageCount = Math.floor(5 + Math.random() * 25);
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        
        // Add to main state
        onUploadDocument({
          fileName: file.name,
          originalName: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
          description: `Documento cargado por el portal administrativo para reglamentar operaciones internas.`,
          status: 'active',
          pageCount: simulatedPageCount,
          fileSize: `${sizeMB === '0.0' ? '450 KB' : sizeMB + ' MB'}`,
          uploadedBy: 'María Fernández',
        });
        
        setTimeout(() => {
          setIsUploading(false);
          setSimulatedFileName('');
        }, 800);
      }
    }, 1000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950 space-y-8 h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-855 dark:text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-brand-650" /> Repositorio de Documentos RAG
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
            Sube y gestiona reglamentos, políticas y manuales corporativos indexados por el asistente de IA
          </p>
        </div>
        
        <div className="px-4 py-2 bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/25 rounded-xl text-xs font-bold shrink-0 flex items-center gap-2">
          <Shield className="w-4 h-4" /> 5 Políticas Corporativas Activas
        </div>
      </div>

      {/* Main Grid: Upload Area on Left, Documents List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Ingestion & Upload Column */}
        <div className="space-y-6">
          <h3 className="font-bold text-slate-800 dark:text-white text-base">
            Ingestar Nuevo Documento
          </h3>
          
          {/* Uploader Box */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`drop-zone border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] cursor-pointer bg-white dark:bg-slate-900 transition-all ${
              isDragOver
                ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/10'
                : 'border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-800 hover:bg-slate-50/20'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.docx,.txt"
              className="hidden"
              disabled={isUploading}
            />

            {!isUploading ? (
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-full bg-brand-50 dark:bg-brand-950/20 text-brand-650 flex items-center justify-center mx-auto shadow-inner">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Arrastra tu archivo aquí o busca
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                    Formatos soportados: PDF, DOCX, TXT (Máx. 10MB)
                  </p>
                </div>
              </div>
            ) : (
              /* Simulated RAG multi-step ingestion loader */
              <div className="space-y-6 w-full animate-fade-in">
                <div className="w-14 h-14 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto animate-pulse">
                  <FileUp className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-brand-600 uppercase tracking-widest">
                    Procesando Archivo RAG
                  </p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[200px] mx-auto">
                    {simulatedFileName}
                  </p>
                </div>

                {/* Progress bar container */}
                <div className="space-y-2 max-w-xs mx-auto">
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-500"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Progreso</span>
                    <span className="text-brand-600">{uploadProgress}%</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 italic font-medium max-w-[220px] mx-auto leading-relaxed">
                  {uploadStepText}
                </p>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-100/50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl flex gap-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
            <AlertCircle className="w-5 h-5 text-brand-650 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-350 block mb-0.5">Información sobre Vectorización</span>
              Cuando cargas un reglamento, nuestra IA simula una canalización RAG: extrae el texto, lo divide en chunks semánticos, calcula embeddings y los almacena listos para ser consultados.
            </div>
          </div>
        </div>

        {/* Documents Table / Management Column (Lg span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-slate-800 dark:text-white text-base">
            Documentos Indexados ({documents.length})
          </h3>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-3">
                    <th className="py-3.5 px-6">Documento</th>
                    <th className="py-3.5 px-6">Páginas</th>
                    <th className="py-3.5 px-6">Tamaño</th>
                    <th className="py-3.5 px-6">Estado RAG</th>
                    <th className="py-3.5 px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                  {documents.map((doc) => {
                    const isActive = doc.status === 'active';
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                        <td className="py-4.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl group-hover:bg-brand-50 group-hover:text-brand-650 dark:group-hover:bg-brand-950/20 dark:group-hover:text-brand-400 transition-colors shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-805 dark:text-slate-205 leading-tight truncate max-w-[200px]">
                                {doc.originalName}
                              </h4>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[200px]">
                                {doc.fileName} • Subido por {doc.uploadedBy}
                              </p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4.5 px-6 text-slate-600 dark:text-slate-400 font-semibold text-xs">
                          {doc.pageCount} págs.
                        </td>
                        
                        <td className="py-4.5 px-6 text-slate-500 dark:text-slate-500 font-semibold text-xs">
                          {doc.fileSize}
                        </td>
                        
                        <td className="py-4.5 px-6">
                          <button
                            onClick={() => onToggleStatus(doc.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                                : 'bg-slate-55 bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                            }`}
                            title={isActive ? 'Hacer inactivo en RAG' : 'Habilitar para búsqueda semántica'}
                          >
                            {isActive ? 'Activo' : 'Inactivo'}
                          </button>
                        </td>
                        
                        <td className="py-4.5 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onViewDocument(doc)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg transition-colors"
                              title="Visualizar PDF"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteDocument(doc.id)}
                              className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-650 rounded-lg transition-colors"
                              title="Eliminar documento de RAG"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
