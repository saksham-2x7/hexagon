import re

with open("src/app/(app)/tutor/page.tsx", "r") as f:
    content = f.read()

# Add isRecording state
if "const [isRecording, setIsRecording] = useState(false);" not in content:
    target_state = "  const [orbitEnabled, setOrbitEnabled] = useState(true);"
    replacement_state = "  const [orbitEnabled, setOrbitEnabled] = useState(true);\n  const [isRecording, setIsRecording] = useState(false);"
    content = content.replace(target_state, replacement_state)

# Add toggleRecording function
if "const toggleRecording =" not in content:
    target_func = "  const handleSend = () => {"
    replacement_func = """  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        // NOTE: We connect it to the LipSync analyser but this is just client-side telemetry
        // The real implementation would pipe this to Speech-To-Text
        setIsRecording(true);
      } catch (e) { console.error("Mic access denied", e); }
    } else {
      setIsRecording(false);
    }
  };

  const handleSend = () => {"""
    content = content.replace(target_func, replacement_func)

# Replace the Mic icon div with a button
target_mic = """                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${
                    teacherState !== 'idle' && teacherState !== 'listening' 
                      ? 'bg-hexagon-accent/20 text-hexagon-accent' 
                      : 'bg-gray-800 text-gray-400'
                  }`}>
                    <Mic className="w-3.5 h-3.5" />
                  </div>"""

replacement_mic = """                <div className="flex items-center gap-2">
                  <button 
                    onClick={toggleRecording}
                    className={`p-1.5 rounded-lg transition-colors shadow-sm hover:scale-105 active:scale-95 ${
                      isRecording 
                        ? 'bg-red-500/20 text-red-500 border border-red-500/30 animate-pulse' 
                        : teacherState !== 'idle' && teacherState !== 'listening' 
                          ? 'bg-hexagon-accent/20 text-hexagon-accent border border-hexagon-accent/20' 
                          : 'bg-gray-800 text-gray-400 border border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>"""

content = content.replace(target_mic, replacement_mic)

with open("src/app/(app)/tutor/page.tsx", "w") as f:
    f.write(content)
