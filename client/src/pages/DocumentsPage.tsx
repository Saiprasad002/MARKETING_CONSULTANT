import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { api } from '../services/api';
import { useCompany } from '../context/CompanyContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { Document, DocumentInsight } from '@shared/types';
import { Upload, FileText, Trash2, RefreshCw, Eye, Sparkles, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const { fetchProfile } = useCompany();
  const { recalculate } = useAnalytics();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [insights, setInsights] = useState<DocumentInsight[]>([]);

  const [uploading, setUploading] = useState(false);

  const fetchDocs = async () => {
    try {
      const data = await api.getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load docs:', err);
    }
  };

  useEffect(() => {
    fetchDocs();
    const interval = setInterval(fetchDocs, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.uploadDocument(formData);
      await fetchDocs();
      await fetchProfile();
      await recalculate();
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectDoc = async (doc: Document) => {
    setSelectedDoc(doc);
    try {
      const data = await api.getDocumentInsights(doc.id);
      setInsights(data);
    } catch (err) {
      console.error('Failed to load insights:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this document?')) {
      await api.deleteDocument(id);
      if (selectedDoc?.id === id) setSelectedDoc(null);
      fetchDocs();
    }
  };

  const handleReprocess = async (id: string) => {
    await api.reprocessDocument(id);
    fetchDocs();
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Processed':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1"><CheckCircle2 className="w-3 h-3" /><span>Processed</span></span>;
      case 'Analyzing':
      case 'Processing':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center space-x-1"><RefreshCw className="w-3 h-3 animate-spin" /><span>{status}...</span></span>;
      case 'Uploading':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center space-x-1"><Clock className="w-3 h-3" /><span>Uploading</span></span>;
      case 'Error':
      default:
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center space-x-1"><AlertCircle className="w-3 h-3" /><span>Error</span></span>;
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">Document Intelligence</h1>
            <p className="text-sm text-slate-400 mt-1">
              Upload pitch decks, financial reports, spreadsheets, or PDFs to extract verified company profile facts.
            </p>
          </div>

          <label className="cursor-pointer px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center space-x-2 transition-all">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload Document'}</span>
            <input type="file" onChange={handleFileUpload} accept=".pdf,.docx,.xlsx,.xls,.csv,.pptx,.txt" className="hidden" disabled={uploading} />
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Document List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-slate-100">Uploaded Business Documents ({documents.length})</h2>

              {documents.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl space-y-3">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                  <div className="text-sm font-semibold text-slate-400">No documents uploaded yet</div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Supported formats: PDF, DOCX, XLSX, CSV, PPTX, TXT. Max file size: 25MB.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map(doc => (
                    <div 
                      key={doc.id}
                      onClick={() => handleSelectDoc(doc)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedDoc?.id === doc.id ? 'bg-indigo-950/40 border-indigo-500/40' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                          {doc.fileType.toUpperCase().replace('.', '')}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-100">{doc.originalName}</div>
                          <div className="text-xs text-slate-400 font-medium">
                            {(doc.size / (1024 * 1024)).toFixed(2)} MB • {doc.insightsCount} Extracted Insights
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {renderStatusBadge(doc.status)}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleReprocess(doc.id); }}
                          title="Reprocess"
                          className="p-1.5 text-slate-400 hover:text-indigo-400 rounded transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                          title="Delete"
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Insights Explorer (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 min-h-[400px]">
              <div className="flex items-center space-x-2 text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <h2 className="text-base font-bold text-slate-100">Extracted Document Insights</h2>
              </div>

              {selectedDoc ? (
                <div className="space-y-3">
                  <div className="text-xs text-slate-400 font-semibold border-b border-slate-800 pb-2">
                    Viewing insights for <span className="text-indigo-300">{selectedDoc.originalName}</span>
                  </div>

                  {insights.length > 0 ? (
                    <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                      {insights.map(ins => (
                        <div key={ins.id} className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-300 capitalize">{ins.key}</span>
                            <span className="text-[10px] text-emerald-400 font-semibold">{Math.round(ins.confidence * 100)}% confidence</span>
                          </div>
                          <p className="text-xs text-slate-100 font-semibold">{ins.value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 py-8 text-center">
                      No explicit structured key-value insights extracted yet for this file.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-16 text-center">
                  Select a document on the left to view extracted business insights and metrics.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
