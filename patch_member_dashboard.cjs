const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

// Add Machine Guide to isTabLocked
code = code.replace(
  "if (['formchecker', 'buddymatcher'].includes(tabId)) return !hasBasicAI;",
  "if (['formchecker', 'machineguide', 'buddymatcher'].includes(tabId)) return !hasBasicAI;"
);

// Add Machine Guide to getRequiredPlan
code = code.replace(
  "if (['formchecker', 'buddymatcher'].includes(tabId)) return 'Pro or Elite';",
  "if (['formchecker', 'machineguide', 'buddymatcher'].includes(tabId)) return 'Pro or Elite';"
);

// Add to tabs array
code = code.replace(
  "{ id: 'formchecker', icon: Activity, label: 'Form Checker' },",
  "{ id: 'formchecker', icon: Activity, label: 'Form Checker' },\n            { id: 'machineguide', icon: Camera, label: 'Machine Guide' },"
);

// Add state for Machine Guide
const stateCode = `  const [machineFile, setMachineFile] = useState<File | null>(null);
  const [machinePreview, setMachinePreview] = useState<string | null>(null);
  const [machineInstructions, setMachineInstructions] = useState('');
  const [isMachineLoading, setIsMachineLoading] = useState(false);`;

code = code.replace(
  "const [formFeedback, setFormFeedback] = useState('');",
  "const [formFeedback, setFormFeedback] = useState('');\n" + stateCode
);

// Add handlers for Machine Guide
const handlerCode = `  const handleMachineFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMachineFile(file);
      setMachinePreview(URL.createObjectURL(file));
      setMachineInstructions('');
    }
  };

  const handleMachineGuideSubmit = async () => {
    if (!machineFile) return;
    setIsMachineLoading(true);
    setMachineInstructions('');
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const res = await fetch('/api/ai/machine-guide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: base64Data,
            mimeType: machineFile.type,
          })
        });
        const data = await res.json();
        if (data.instructions) {
          setMachineInstructions(data.instructions);
        } else {
          setMachineInstructions('Failed to analyze the machine. Please try again.');
        }
      };
      reader.readAsDataURL(machineFile);
    } catch (e) {
      setMachineInstructions('An error occurred during analysis.');
    } finally {
      setIsMachineLoading(false);
    }
  };`;

code = code.replace(
  "const handleFormCheckSubmit = async () => {",
  handlerCode + "\n\n  const handleFormCheckSubmit = async () => {"
);

// Add Machine Guide UI
const uiCode = `          {activeTab === 'machineguide' && (
            <>
              <h2 className="text-3xl font-black tracking-tight mb-8">AI Machine Guide</h2>
              <Card className="flex flex-col gap-6 mb-8">
                <div>
                  <h3 className="font-bold mb-2">Upload or Take a Photo of a Machine</h3>
                  <p className="text-sm opacity-70 mb-4">Our AI will identify the machine and tell you how to use it safely in both English and Hinglish.</p>
                  
                  <div className="border-2 border-dashed border-[var(--color-brand-primary)] rounded-xl p-8 text-center bg-[var(--color-neu-light)] relative">
                    {machinePreview ? (
                      <div className="flex flex-col items-center">
                        <img src={machinePreview} alt="Machine preview" className="max-h-64 object-contain rounded-xl mb-4" />
                        <Button variant="default" onClick={() => { setMachineFile(null); setMachinePreview(null); setMachineInstructions(''); }}>
                          Clear Photo
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Camera className="w-12 h-12 text-[var(--color-brand-primary)] mb-4" />
                        <p className="font-medium mb-4">Click to upload or capture</p>
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="environment"
                          onChange={handleMachineFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  className="w-full py-4 text-lg font-bold" 
                  onClick={handleMachineGuideSubmit}
                  disabled={!machineFile || isMachineLoading}
                >
                  {isMachineLoading ? 'Analyzing Machine...' : 'Analyze Machine'}
                </Button>

                {machineInstructions && (
                  <div className="mt-4 p-6 bg-white border border-neutral-100 rounded-2xl shadow-sm">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                      <Wind className="w-5 h-5 text-[var(--color-brand-primary)]" />
                      AI Instructions
                    </h4>
                    <div className="markdown-body space-y-4">
                      <Markdown>{machineInstructions}</Markdown>
                    </div>
                  </div>
                )}
              </Card>
            </>
          )}`;

const splitRegex = /\{activeTab === 'formchecker' && \([\s\S]*?<\/Card>\s*<\/>\s*\)\}/;
const match = code.match(splitRegex);
if (match) {
  code = code.replace(splitRegex, match[0] + '\n\n' + uiCode);
} else {
  console.log("Could not find formchecker UI to insert machine guide");
}

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
