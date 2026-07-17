'use client';

import React from 'react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

interface UploadedFile {
  id: string; 
  original_name: string;
  original_file_url: string;
  extension: string;
  status: 'pending' | 'converting' | 'completed' | 'failed' | 'uploaded'; 
  csv_file_url: string | null;
  error_message: string | null;
  file_size?: number;
  created_at: string;
}

export default function FilesPage() {
  const { user, isLoading: isUserLoading } = useAuthUser();
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  const { data: files = [], isLoading: isFilesLoading } = useQuery<UploadedFile[]>({
    queryKey: ['uploaded-files'],
    queryFn: async () => {
      const token = Cookies.get('medki_token');
      const res = await fetch(`${baseUrl}/files`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to load library files');
      const json = await res.json();
      return json.files || json.data || json;
    },
    enabled: !!user,
    refetchInterval: (query) => {
      // Automatically poll every 3 seconds if any document is processing
      const hasProcessing = query.state.data?.some(
        (file) => file.status === 'converting' || file.status === 'uploaded'
      );
      return hasProcessing ? 3000 : false;
    }
  });

  const formatBytes = (bytes?: number) => {
    if (bytes === undefined || bytes === null) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (ext?: string) => {
    const e = ext?.toLowerCase();
    if (e === 'pdf') return '📕';
    if (e === 'pptx' || e === 'ppt') return '📙';
    if (e === 'csv') return '📊';
    if (e === 'txt' || e === 'md') return '📝';
    return '📄';
  };

  const handleDownloadClick = (fileId: string) => { 
    const token = Cookies.get('medki_token');
    window.location.href = `${baseUrl}/files/${fileId}/download?token=${token}`;
  };

  if (isUserLoading) return <FilesPageSkeleton />;
  if (!user) return (
    <div className="p-8 text-center text-gray-500">
      <p>Session expired. <a href="/auth" className="text-blue-600 underline">Sign in again</a></p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#A89F91]/20 gap-4">
        <div>
          <h1 className="font-caslon text-3xl md:text-4xl font-bold text-[#1A1A1A]">📚 Document Library</h1>
          <p className="font-grotesk text-sm text-[#1A1A1A]/60 mt-1">
            Browse your uploaded study material, check conversion progress, and download study decks.
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/convert"
            className="px-5 py-2.5 bg-[#D44D44] hover:bg-[#D44D44]/95 text-white font-grotesk text-xs font-bold rounded-full shadow-xs transition-colors duration-200"
          >
            🚀 Convert New File
          </a>
        </div>
      </div>

      {isFilesLoading ? (
        <FilesPageSkeleton />
      ) : files.length === 0 ? (
        <div className="border border-dashed border-[#A89F91]/40 rounded-2xl p-12 text-center bg-[#1A1A1A]/[0.01]">
          <p className="text-3xl mb-3">📁</p>
          <h3 className="font-caslon text-lg font-bold text-[#1A1A1A]">No documents found</h3>
          <p className="font-grotesk text-xs text-[#1A1A1A]/50 mt-1 max-w-sm mx-auto">
            You haven't uploaded any study materials yet. Upload your first PDF or PPTX slides to generate study cards.
          </p>
          <a
            href="/convert"
            className="mt-4 inline-flex px-4 py-2 bg-[#1A1A1A] text-[#F5F2ED] hover:bg-[#D44D44] rounded-full text-xs font-bold font-grotesk transition-colors"
          >
            Upload Document
          </a>
        </div>
      ) : (
        <div className="bg-[#F5F2ED] border border-[#A89F91]/30 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#A89F91]/20 bg-[#1A1A1A]/[0.02] text-[10px] font-mono uppercase tracking-wider text-[#1A1A1A]/60">
                  <th className="py-4 px-6">Document Name</th>
                  <th className="py-4 px-6">File Size</th>
                  <th className="py-4 px-6">Uploaded At</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#A89F91]/15 font-grotesk text-sm">
                {files.map((file) => {
                  const statusColors = {
                    uploaded: 'bg-[#1A1A1A]/5 text-[#1A1A1A]/60 border border-[#1A1A1A]/10',
                    pending: 'bg-[#1A1A1A]/5 text-[#1A1A1A]/60 border border-[#1A1A1A]/10',
                    converting: 'bg-[#D44D44]/5 text-[#D44D44] border border-[#D44D44]/20 animate-pulse',
                    completed: 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20',
                    failed: 'bg-red-500/10 text-[#D44D44] border border-[#D44D44]/20',
                  };

                  return (
                    <tr key={file.id} className="hover:bg-[#1A1A1A]/[0.01] transition-colors">
                      <td className="py-4.5 px-6 flex items-center gap-3">
                        <span className="text-xl" role="img" aria-label="file-icon">
                          {getFileIcon(file.extension)}
                        </span>
                        <div>
                          <p className="font-semibold text-[#1A1A1A] line-clamp-1 max-w-xs md:max-w-md">
                            {file.original_name}
                          </p>
                          <p className="text-[10px] font-mono text-[#1A1A1A]/40 uppercase tracking-tight">
                            .{file.extension}
                          </p>
                        </div>
                      </td>
                      <td className="py-4.5 px-6 font-mono text-xs text-[#1A1A1A]/70">
                        {formatBytes(file.file_size)}
                      </td>
                      <td className="py-4.5 px-6 text-xs text-[#1A1A1A]/60">
                        {new Date(file.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-4.5 px-6">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${statusColors[file.status] || statusColors.uploaded}`}>
                          {file.status === 'converting' ? 'Processing ⚡' : file.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-right">
                        {file.status === 'completed' ? (
                          <button
                            onClick={() => handleDownloadClick(file.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#1A1A1A] text-white hover:bg-[#D44D44] rounded-full text-xs font-bold transition-all cursor-pointer"
                          >
                            📥 Download CSV
                          </button>
                        ) : file.status === 'failed' ? (
                          <span
                            className="text-xs text-[#D44D44] cursor-help"
                            title={file.error_message || 'Unknown pipeline error.'}
                          >
                            ⚠️ Hover for details
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-[#1A1A1A]/40">Processing...</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function FilesPageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
      <div className="h-8 w-64 bg-[#A89F91]/20 rounded" />
      <div className="bg-[#A89F91]/10 h-72 w-full rounded-2xl" />
    </div>
  );
}
