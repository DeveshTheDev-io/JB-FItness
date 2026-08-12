const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

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
  "  const checkForm = async () => {",
  handlerCode + "\n\n  const checkForm = async () => {"
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
