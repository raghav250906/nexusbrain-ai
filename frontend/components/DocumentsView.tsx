import type { AxiosProgressEvent } from "axios";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UploadCloud,
  FileText,
  Search,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Database,
  RefreshCw,
  Info
} from 'lucide-react';
import PageHeader from './PageHeader';
import documentApi from '../lib/api';

type DocumentItem = {
  id: string;
  name: string;
  size: string;
  type: string;
  status: 'indexed' | 'processing' | 'failed';
  uploadedAt: string;
  tokens: number;
  progress?: number;
};

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt'];
const MAX_FILE_SIZE_MB = 50;

const DEFAULT_CORPUS: DocumentItem[] = [
  { id: 'doc-1', name: 'Q3_Financial_Summary_Global.pdf', size: '4.80 MB', type: 'PDF', status: 'indexed', uploadedAt: '2026-07-10 14:23', tokens: 142050 },
  { id: 'doc-2', name: 'System_Node_H4_Export.txt', size: '18.90 MB', type: 'TXT', status: 'processing', uploadedAt: '2026-07-13 10:45', tokens: 1245000 },
  { id: 'doc-3', name: 'Legacy_Schema_V1.json', size: '450 KB', type: 'JSON', status: 'failed', uploadedAt: '2026-07-05 16:30', tokens: 0 },
];

export default function DocumentsView() {
  const [documents, setDocuments] = useState<DocumentItem[]>(DEFAULT_CORPUS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'indexed' | 'processing' | 'failed'>('all');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [lastSummary, setLastSummary] = useState<{
    file: string;
    summary: string;
    } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await documentApi.get("/documents");
      const data = response.data;
      if (data.success && Array.isArray(data.documents)) {

  setDocuments(
    data.documents.map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      status: doc.status,
      type: (doc.file_type || "")
        .replace(".", "")
        .toUpperCase(),
      uploadedAt: "-",
      size: `${(doc.size / 1024).toFixed(1)} KB`,
      tokens: 0,
      progress: undefined,
    }))
  );

  if (data.documents.length > 0) {
    const latest = data.documents[data.documents.length - 1];

    setLastSummary({
      file: latest.original_name,
      summary: latest.summary,
    });
  } else {
    setLastSummary(null);
  }

  setIsConnected(true);

} else {
  console.warn("Unexpected API response:", data);
}
    } catch (err) {
      console.warn('Error fetching documents, falling back:', err);
      setIsConnected(false);
      
      const stored = localStorage.getItem('cognitive_corpus_docs');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setDocuments(parsed);
        } catch {
          setDocuments(DEFAULT_CORPUS);
        }
      } else {
        setDocuments(DEFAULT_CORPUS);
      }
      showToast('FastAPI server offline. Utilizing secure local workspace.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const totalTokens = documents.reduce((sum, doc) => sum + (doc.tokens || 0), 0);
  const maxTokens = 50000000; // 50M
  const tokenPercentage = Math.min((totalTokens / maxTokens) * 100, 100);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isUploading) return;
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFile = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return `Invalid file type. Only PDF, DOC, DOCX, and TXT are supported.`;
    }
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      return `File size exceeds the maximum limit of ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
  };

  const processFiles = async (files: FileList) => {
    if (isUploading) return;
    const filesArray = Array.from(files);
    if (filesArray.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of filesArray) {
        const validationError = validateFile(file);
        if (validationError) {
          showToast(validationError, 'error');
          continue;
        }

        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const tempDoc: DocumentItem = {
          id: tempId,
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          type: file.name.split('.').pop()?.toUpperCase() || 'RAW',
          status: 'processing',
          uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          tokens: 0,
          progress: 0,
        };

        setDocuments((prev) => [tempDoc, ...prev]);

        try {
          const formData = new FormData();
          formData.append('file', file);
          
          const uploadedDoc = await documentApi.post('/documents/upload', formData, {
            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total || 1)
              );
              setDocuments((prevDocs) =>
  prevDocs.map((d) =>
    d.id === tempId
      ? { ...d, progress: percentCompleted }
      : d
  )
);
            },
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          setDocuments((prevDocs) =>
  prevDocs.map((d) =>
    d.id === tempId
      ? {
          id: uploadedDoc.data.stored_name,
          name: uploadedDoc.data.original_name,
          status: "indexed",
          type: uploadedDoc.data.file_type.replace(".", "").toUpperCase(),
          uploadedAt: new Date().toLocaleString(),
          size: `${(uploadedDoc.data.size / 1024).toFixed(1)} KB`,
          tokens: 0,
          progress: undefined,
        }
      : d
  )
);
          showToast(`Ingested: ${file.name}`, "success");

          if (uploadedDoc.data.indexing?.summary) {
          setLastSummary({
          file: uploadedDoc.data.original_name,
          summary: uploadedDoc.data.indexing.summary,
          });
          }
          await fetchDocuments();
        } catch (err) {
          console.error('Error uploading file:', err);
          setDocuments((prevDocs) =>
            prevDocs.map((d) =>
              d.id === tempId ? { ...d, status: 'failed' as const, progress: undefined } : d
            )
          );
          showToast(`Failed to ingest: ${file.name}`, 'error');
        }
      }
    } finally {
      setIsUploading(false);
    }

    await fetchDocuments();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) return;
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith('temp-')) {
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      return;
    }

    try {
      await documentApi.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      showToast('Document purged from corpus.', 'success');
    } catch (err) {
      console.error('Error deleting document:', err);
      showToast('Failed to delete document from storage.', 'error');
    }
  };
  console.log("Documents State:", documents);
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
  (doc.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Cognitive Memory Corpus"
        description="Ingest, index, and organize unstructured assets into secure semantic vector spaces linked directly to the Synapse Matrix."
      />

      <div className="mt-2">
        <span className={isConnected ? "text-emerald-400 font-mono text-xs md:text-sm animate-pulse" : "text-amber-500 font-mono text-xs md:text-sm"}>
          {isConnected ? 'OPERATIONAL // CONNECTED' : 'OFFLINE // LOCAL WORKSPACE'}
        </span>
      </div>

      {/* Top statistics section: GEOMETRIC GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Memory limit gauge */}
        <div className="p-6 bg-[#0B0E14] border border-slate-800 rounded-sm col-span-1 md:col-span-2 shadow-lg shadow-black/20">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-sm">
                <Database className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Vector Context Capacity</span>
            </div>
            <span className="text-xs font-mono text-slate-300">
              {totalTokens.toLocaleString()} / {maxTokens.toLocaleString()} TOKENS
            </span>
          </div>
          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${tokenPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-blue-500"
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-slate-500">
            <span>NODE_ID: H4-CENTRAL</span>
            <span>REMAINING: {(maxTokens - totalTokens).toLocaleString()}</span>
          </div>
        </div>

        {/* Dynamic Ingestion Pulse Card */}
        <div className="p-6 bg-[#0B0E14] border border-slate-800 rounded-sm flex flex-col justify-center">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Ingestion Pulse</div>
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <div className="text-3xl font-bold text-white leading-none">
                {documents.filter((d) => d.status === 'indexed').length}
              </div>
              <div className="text-[10px] text-emerald-500 font-bold uppercase">Indexed Assets</div>
            </div>
            <div className="text-right space-y-1 text-[10px] font-mono text-slate-500">
              <div className="flex items-center gap-2 justify-end">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span>{documents.filter((d) => d.status === 'processing').length} Processing</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                <span>{documents.filter((d) => d.status === 'failed').length} Failed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {lastSummary && (
        <div className="bg-[#0B0E14] border border-slate-800 rounded-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">
              AI Document Summary
            </h3>

            <span className="text-[10px] text-slate-500 uppercase">
              {lastSummary.file}
            </span>
          </div>

          <p className="text-sm text-slate-300 whitespace-pre-line leading-7">
            {lastSummary.summary}
          </p>
        </div>
      )}
      {/* Main split grid: Dropzone & Files Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left column: Drag & Drop Upload Zone */}
        <div className="lg:col-span-1 flex flex-col space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`flex-1 min-h-[240px] border border-dashed rounded-sm p-6 flex flex-col items-center justify-center text-center transition-colors group ${
              isUploading
                ? 'border-slate-800 bg-[#0B0E14]/30 opacity-50 cursor-not-allowed'
                : isDragging
                ? 'border-blue-500 bg-blue-500/5 cursor-pointer'
                : 'border-slate-700 bg-[#0B0E14]/50 hover:border-blue-500 cursor-pointer'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              disabled={isUploading}
              className="hidden"
            />
            {isUploading ? (
              <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            ) : (
              <svg className="w-10 h-10 text-slate-600 mb-4 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {isUploading ? 'Ingesting Asset...' : 'Ingress Portal'}
            </span>
            <p className="text-[10px] text-slate-500 mt-2 font-mono">
              {isUploading ? 'COMPILING VECTOR CORES' : 'DROP PDF, DOC, DOCX, TXT'}
            </p>
            <div className="mt-6 pt-6 border-t border-slate-800 w-full">
              <div className="text-[9px] text-slate-500 font-mono leading-relaxed uppercase">AUTOMATED CHUNKING & EMBEDDING ENABLED BY DEFAULT</div>
            </div>
          </div>

          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-sm flex gap-3">
            <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[10px] text-slate-400 leading-normal">
              Assets are parsed via high-dimensional embeddings and compiled into the global memory stack.
            </p>
          </div>
        </div>

        {/* Right column: Document Management Table */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <svg className="w-3 h-3 absolute left-3 top-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="FILTER REPOSITORY..."
                className="w-full bg-slate-900 border border-slate-800 rounded-sm py-2 pl-9 pr-4 text-[10px] font-mono focus:outline-none focus:border-blue-500 text-slate-300 placeholder-slate-600 uppercase"
              />
            </div>

            {/* Filter Status */}
            <div className="flex gap-1 bg-slate-900 p-1 border border-slate-800 rounded-sm w-full sm:w-auto">
              {(['all', 'indexed', 'processing', 'failed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`flex-1 sm:flex-initial px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-sm transition-colors outline-none cursor-pointer ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {status === 'all' ? 'ALL' : status === 'indexed' ? 'SYNCED' : status === 'failed' ? 'ERROR' : status.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 bg-[#0B0E14] border border-slate-800 rounded-sm overflow-hidden flex flex-col shadow-lg shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-500 text-[9px] font-bold uppercase tracking-widest border-b border-slate-800">
                    <th className="p-4">Asset Details</th>
                    <th className="p-4">Tokens</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  <AnimatePresence>
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500 font-mono text-[10px]">
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                            <span>Retrieving Cognitive Memory Corpus...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredDocs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500 font-mono text-[10px]">
                          No assets match current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredDocs.map((doc) => (
                        <motion.tr
                          key={doc.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="hover:bg-slate-900/30 transition-colors group"
                        >
                          {/* Details */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-blue-500/5 border border-blue-500/20 text-blue-500 font-bold font-mono text-[10px] rounded-sm shrink-0 w-10 text-center">
                                {doc.type.slice(0, 3)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-200 truncate max-w-xs md:max-w-md">{doc.name}</p>
                                <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                                  {doc.size} // {doc.uploadedAt}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Tokens */}
                          <td className="p-4 text-xs font-mono text-slate-400">
                            {doc.tokens > 0 ? doc.tokens.toLocaleString() : '—'}
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            {doc.status === 'indexed' && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                                Synced
                              </span>
                            )}
                            {doc.status === 'processing' && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-sm bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase animate-pulse">
                                {doc.progress !== undefined ? `Uploading ${doc.progress}%` : 'Embedding'}
                              </span>
                            )}
                            {doc.status === 'failed' && (
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-sm bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">
                                Rejected
                              </span>
                            )}
                          </td>

                          {/* Delete */}
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer outline-none"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="mt-auto border-t border-slate-900 p-4 bg-slate-900/20 flex justify-between items-center">
              <div className="text-[9px] text-slate-600 font-mono uppercase">
                DISPLAYING {filteredDocs.length} ASSETS // PAGE 1 OF 1
              </div>
              <div className="flex gap-4 text-[9px] text-slate-500 font-bold">
                <button
                  onClick={fetchDocuments}
                  className="hover:text-blue-500 cursor-pointer uppercase transition-colors"
                >
                  REFRESH MATRIX
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Success/Error Toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-sm border text-xs shadow-xl font-medium ${
                toast.type === 'success'
                  ? 'bg-[#0F1219] border-emerald-500/20 text-emerald-400'
                  : 'bg-[#0F1219] border-rose-500/20 text-rose-400'
              }`}
            >
              {toast.type === 'success' ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              )}
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
