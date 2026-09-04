import re

with open("src/components/home/DocumentUploader.tsx", "r") as f:
    content = f.read()

target = """  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setProcessingState('uploading');
    
    // Task 3: Removed mock setTimeout redirect trap
    alert("Backend file processing and RAG integration is not yet wired up. This mock sequence has been disabled.");
    setProcessingState('idle');
    setFile(null);
  };"""

replacement = """  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setProcessingState('uploading');
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('student_id', 'demo_student');

      const res = await fetch('/api/v1/materials/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const fileId = data.file_id;

      setProcessingState('parsing');

      // Poll until ready
      const poll = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/v1/materials/${fileId}`);
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            if (statusData.status === 'ready' || statusData.status === 'READY') {
              clearInterval(poll);
              setProcessingState('ready');
            } else if (statusData.status === 'processing' || statusData.status === 'PROCESSING') {
              setProcessingState('extracting');
            }
          }
        } catch (e) {
          console.warn("Status polling error", e);
        }
      }, 1000);

    } catch (err) {
      console.error(err);
      alert("Failed to upload material.");
      setProcessingState('idle');
      setFile(null);
    }
  };"""

content = content.replace(target, replacement)

with open("src/components/home/DocumentUploader.tsx", "w") as f:
    f.write(content)
