"use client";
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, X, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DocumentUploader() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [processingState, setProcessingState] = useState<'idle' | 'uploading' | 'parsing' | 'extracting' | 'ready'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setProcessingState('uploading');
    
    setTimeout(() => setProcessingState('parsing'), 1500);
    setTimeout(() => setProcessingState('extracting'), 3000);
    setTimeout(() => setProcessingState('ready'), 4500);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleStartLesson = () => {
    router.push('/lesson/plan-generation?source=doc');
  };

  return (
    <div className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-6 relative overflow-hidden">
      
      {processingState === 'idle' ? (
        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${dragActive ? 'border-hexagon-accent bg-hexagon-accent/5' : 'border-hexagon-border hover:border-hexagon-text-secondary/50 hover:bg-hexagon-surface-hover'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" className="hidden" onChange={handleChange} accept=".pdf,.docx,.txt,.pptx" />
          <Upload className="w-8 h-8 mx-auto mb-4 text-hexagon-text-secondary" />
          <h3 className="text-hexagon-text-primary font-medium mb-1">Upload Learning Material</h3>
          <p className="text-hexagon-text-secondary text-sm">Drag and drop a PDF, textbook, or notes to ground your next lesson.</p>
        </div>
      ) : (
        <div className="flex flex-col h-[180px] justify-center">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-hexagon-text-primary font-medium truncate">{file?.name}</h4>
              <p className="text-hexagon-text-secondary text-xs uppercase tracking-widest mt-1">
                {processingState === 'uploading' && 'Reading material...'}
                {processingState === 'parsing' && 'Finding chapters...'}
                {processingState === 'extracting' && 'Building concept map...'}
                {processingState === 'ready' && 'Material indexed.'}
              </p>
            </div>
            {processingState === 'ready' ? (
              <CheckCircle className="w-6 h-6 text-hexagon-accent shrink-0" />
            ) : (
              <Loader2 className="w-6 h-6 text-hexagon-text-secondary animate-spin shrink-0" />
            )}
          </div>
          
          <div className="w-full bg-hexagon-border rounded-full h-2 mb-6 overflow-hidden">
             <motion.div 
               className="h-full bg-hexagon-accent rounded-full"
               initial={{ width: '0%' }}
               animate={{ 
                 width: processingState === 'uploading' ? '30%' : 
                        processingState === 'parsing' ? '60%' : 
                        processingState === 'extracting' ? '90%' : '100%' 
               }}
               transition={{ duration: 0.5 }}
             />
          </div>

          <div className="flex justify-end gap-3">
            <button 
              onClick={() => { setFile(null); setProcessingState('idle'); }} 
              className="px-4 py-2 text-sm text-hexagon-text-secondary hover:text-hexagon-text-primary transition-colors"
            >
              Cancel
            </button>
            <button 
              disabled={processingState !== 'ready'}
              onClick={handleStartLesson}
              className="px-6 py-2 bg-hexagon-accent text-black font-semibold rounded-xl text-sm flex items-center gap-2 hover:bg-hexagon-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Start Grounded Lesson <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
