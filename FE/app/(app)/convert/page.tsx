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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      const token = Cookies.get('medki_token');

      // 1. Fetch Cloudinary signature from Laravel (Strictly a text-based payload request)
      const sigResponse = await fetch(`${baseUrl}/cloudinary/signature`, {
        headers: {
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        }
      });
      
      // if (!sigResponse.ok) {
      //   throw new Error('Unable to retrieve secure upload signature.');
      // }
      
      if (!sigResponse.ok) {
        const errorText = await sigResponse.text();
        console.error("🔴 Laravel Signature Error Details:", errorText);
        throw new Error(`Signature failed: ${sigResponse.status} ${sigResponse.statusText}`);
      }
      const signData = await sigResponse.json();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signData.api_key);
      formData.append('timestamp', signData.timestamp.toString());
      formData.append('signature', signData.signature);
      formData.append('folder', 'medki_documents');

      // 3. POST directly to Cloudinary API (All bandwidth consumed goes from user straight to CDN)
      toast.loading('Uploading file directly to Cloudinary...', { id: toastId });
      
      const xhr = new XMLHttpRequest();
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signData.cloud_name}/raw/upload`;
      
      xhr.open('POST', cloudinaryUrl);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
          
          if (percentComplete < 100) {
            toast.loading(`Direct CDN Upload: ${percentComplete}%`, { id: toastId });
          } else {
            setUploadStatus('cloudinary');
            toast.loading('Processing with media CDN...', { id: toastId });
          }
        }
      };

      const uploadPromise = new Promise<{ secure_url: string }>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText);
              resolve(json);
            } catch (err) {
              reject(new Error('Failed to parse Cloudinary response.'));
            }
          } else {
            reject(new Error(`Cloudinary upload failed with status ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during Cloudinary upload.'));
      });

      xhr.send(formData);
      const uploadResult = await uploadPromise;

      // 4. Send ONLY the resulting URL and metadata to Laravel
      toast.loading('Registering file in database...', { id: toastId });
      const regResponse = await fetch(`${baseUrl}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          file_url: uploadResult.secure_url,
          file_name: file.name,
          file_size: file.size,
        }),
      });

      if (!regResponse.ok) {
        throw new Error('Failed to register file on server.');
      }

      const regJson = await regResponse.json();
      const uploadedFile: UploadedFile = regJson.file || regJson.data;

      setUploadStatus('success');
      toast.success('Uploaded and registered successfully! ☁️✨', { id: toastId });

      queryClient.invalidateQueries({ queryKey: ['uploaded-files'] });
      setSelectedFileId(uploadedFile.id);
      setActiveFile(uploadedFile);

    } catch (err: any) {
      setUploadStatus('idle');
      toast.error(err.message || 'An unexpected error occurred during upload.', { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
            accept=".pdf,.txt,.md,.csv,.json, .pptx, .ppt, .docx, .doc"
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