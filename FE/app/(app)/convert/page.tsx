'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
}

export default function ConvertFilePage() {
  const { user, isLoading: isUserLoading } = useAuthUser();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null); 
  const [activeFile, setActiveFile] = useState<UploadedFile | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'cloudinary' | 'success'>('idle');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  // 1. جلب قائمة الملفات
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
      if (!res.ok) throw new Error('Failed to load files');
      const json = await res.json();
      return json.files || json.data || json;
    },
    enabled: !!user,
  });

  const startPolling = (fileId: string) => { 
    setIsPolling(true);
    if (pollInterval.current) clearInterval(pollInterval.current);

    pollInterval.current = setInterval(async () => {
      try {
        const token = Cookies.get('medki_token');
        const res = await fetch(`${baseUrl}/files/${fileId}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch file status');
        
        const json = await res.json();
        const updatedFile = json.file || json.data || json;

        setActiveFile(updatedFile);

        if (updatedFile.status === 'completed' || updatedFile.status === 'failed') {
          stopPolling();
          queryClient.invalidateQueries({ queryKey: ['uploaded-files'] });
          if (updatedFile.status === 'completed') {
            toast.success('Your flashcards are ready! 🎉');
          } else {
            toast.error(updatedFile.error_message || 'Conversion failed.');
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        stopPolling();
      }
    }, 3000);
  };

  const stopPolling = () => {
    setIsPolling(false);
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
    }
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error('File is too large. Maximum allowed size is 20MB.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('uploading');
    const toastId = toast.loading('Preparing upload sequence...');

    const token = Cookies.get('medki_token');
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    
    xhr.open('POST', `${baseUrl}/files/upload`);
    xhr.setRequestHeader('Accept', 'application/json');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
        
        if (percentComplete < 100) {
          toast.loading(`Uploading to server: ${percentComplete}%`, { id: toastId });
        } else {
          setUploadStatus('cloudinary');
          toast.loading('File received! Syncing with Cloudinary...', { id: toastId });
        }
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          const uploadedFile: UploadedFile = json.file || json.data;

          setUploadStatus('success');
          toast.success('File successfully uploaded to Cloudinary! ☁️✨', { id: toastId });
          
          queryClient.invalidateQueries({ queryKey: ['uploaded-files'] });
          setSelectedFileId(uploadedFile.id);
          setActiveFile(uploadedFile);
        } catch (err) {
          setUploadStatus('idle');
          toast.error('Error reading response from server.', { id: toastId });
        }
      } else {
        setUploadStatus('idle');
        toast.error('Upload failed. Please check backend logs.', { id: toastId });
      }
      setIsUploading(false);
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setUploadStatus('idle');
      toast.error('Network connection error.', { id: toastId });
    };

    xhr.send(formData);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const convertMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const token = Cookies.get('medki_token');
      const res = await fetch(`${baseUrl}/files/${fileId}/convert`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message || 'Failed to start conversion');
      }
      return res.json();
    },
    onSuccess: (data, fileId) => {
      toast.info('Conversion initiated in background...');
      const file = data.file || data.data || activeFile;
      setActiveFile(file);
      startPolling(fileId);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Could not start conversion.');
    }
  });

  const handleConvertClick = () => {
    if (!selectedFileId) return;
    convertMutation.mutate(selectedFileId);
  };

  const handleDownloadClick = (fileId: string) => { 
    const token = Cookies.get('medki_token');
    window.location.href = `${baseUrl}/files/${fileId}/download?token=${token}`;
  };

  if (isUserLoading) return <p className="p-8 text-center font-grotesk text-[#1A1A1A]/60">Loading user context...</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-6 bg-[#F5F2ED] border border-[#A89F91]/30 rounded-2xl mt-10">
      
      <div className="border-b border-[#A89F91]/20 pb-6">
        <h1 className="font-caslon text-3xl font-bold text-[#1A1A1A]">⚡ AI Flashcard Converter</h1>
        <p className="font-grotesk text-sm text-[#1A1A1A]/60 mt-1">
          Upload a study guide, PDF, or document, then let Gemini organize it into structured Q&A flashcards (CSV).
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-mono uppercase text-[#1A1A1A]/60">Upload New Document</label>
        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`group flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#A89F91]/40 rounded-xl bg-[#1A1A1A]/2 hover:bg-[#1A1A1A]/5 hover:border-[#D44D44]/60 transition-all duration-200 ${isUploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf,.txt,.md,.csv,.json"
            disabled={isUploading || convertMutation.isPending || isPolling}
          />
          
          {isUploading ? (
            <div className="w-full max-w-xs flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#D44D44] border-t-transparent"></div>
              
              <div className="w-full space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-[#1A1A1A]/60">
                  <span>
                    {uploadStatus === 'uploading' ? '🚀 Sending File...' : '☁️ Cloudinary Sync...'}
                  </span>
                  <span className="font-bold">{uploadProgress}%</span>
                </div>
                
                <div className="w-full bg-[#1A1A1A]/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#D44D44] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <p className="text-[11px] font-mono text-[#1A1A1A]/40 text-center animate-pulse">
                {uploadStatus === 'uploading' 
                  ? 'Transferring document bits to server.' 
                  : 'Server is pushing assets to Cloudinary media buckets.'}
              </p>
            </div>
          ) : (
            <div className="text-center space-y-1">
              <p className="text-2xl">📤</p>
              <p className="font-grotesk text-sm font-semibold text-[#1A1A1A] group-hover:text-[#D44D44] transition-colors">
                Click to upload a document
              </p>
              <p className="font-mono text-[10px] text-[#1A1A1A]/40">PDF, TXT, MD, CSV up to 20MB</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-mono uppercase text-[#1A1A1A]/60">Or Select Previous Upload</label>
        {isFilesLoading ? (
          <p className="text-sm font-grotesk text-[#1A1A1A]/40">Loading your library...</p>
        ) : (
          <select
            className="w-full px-4 py-3 bg-[#1A1A1A]/5 border border-[#A89F91]/30 rounded-xl font-grotesk text-sm focus:outline-hidden focus:border-[#D44D44] text-[#1A1A1A] cursor-pointer"
            value={selectedFileId || ''}
            onChange={(e) => {
              const val = e.target.value || null;
              setSelectedFileId(val);
              const found = files.find(f => f.id === val);
              setActiveFile(found || null);
              stopPolling();
            }}
            disabled={convertMutation.isPending || isPolling || isUploading}
          >
            <option value="">-- Select File --</option>
            {files.map((file) => (
              <option key={file.id} value={file.id}>
                {file.original_name} ({file.status})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-col items-center justify-center p-8 border border-[#A89F91]/20 rounded-xl bg-[#1A1A1A]/3 text-center">
        {activeFile ? (
          <div className="space-y-4">
            <h3 className="font-caslon text-lg font-bold text-[#1A1A1A]">{activeFile.original_name}</h3>
            
            {(activeFile.status === 'converting') && (
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#D44D44] border-t-transparent"></div>
                <p className="text-xs font-mono text-[#D44D44] animate-pulse">Gemini is writing your flashcards... Please wait.</p>
              </div>
            )}

            {activeFile.status === 'completed' && (
              <div className="space-y-3">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold font-mono">
                  COMPLETED ✓
                </span>
                <p className="text-xs font-grotesk text-[#1A1A1A]/60">Your CSV output is ready for study engines.</p>
                <button
                  onClick={() => handleDownloadClick(activeFile.id)}
                  className="px-5 py-2 bg-[#1A1A1A] text-white hover:bg-[#D44D44] rounded-full text-xs font-bold font-grotesk transition-colors duration-200 cursor-pointer"
                >
                  📥 Download CSV
                </button>
              </div>
            )}

            {activeFile.status === 'failed' && (
              <div className="space-y-2 text-[#D44D44]">
                <span className="px-3 py-1 bg-red-100 text-[#D44D44] rounded-full text-[10px] font-bold font-mono">
                  FAILED ✕
                </span>
                <p className="text-xs font-grotesk">{activeFile.error_message || 'An error occurred during pipeline run.'}</p>
              </div>
            )}

            {(activeFile.status === 'pending' || activeFile.status === 'uploaded') && (
              <p className="text-xs font-grotesk text-[#1A1A1A]/50">File hasn't been processed yet. Click the button below to start.</p>
            )}
          </div>
        ) : (
          <p className="text-xs font-mono text-[#1A1A1A]/40">No file selected. Upload a file above or pick one from your library to begin.</p>
        )}
      </div>

      <div className="pt-4 border-t border-[#A89F91]/20 flex justify-end">
        <button
          onClick={handleConvertClick}
          disabled={!selectedFileId || convertMutation.isPending || isPolling || isUploading}
          className="px-6 py-2.5 bg-[#D44D44] text-white hover:bg-[#D44D44]/90 rounded-full text-xs font-bold font-grotesk transition-colors duration-200 disabled:opacity-40 cursor-pointer flex items-center gap-2"
        >
          {convertMutation.isPending || isPolling ? 'Converting...' : 'Start Conversion 🚀'}
        </button>
      </div>

    </div>
  );
}