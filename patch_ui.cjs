const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

const uiCode = `          {activeTab === 'machineguide' && (
            <>
              <h2 className="text-3xl font-black tracking-tight mb-8">AI Machine Guide</h2>
              <Card className="flex flex-col gap-6 mb-8">
                <div>
                  <h3 className="font-bold mb-2">Upload or Take a Photo of a Machine</h3>
                  <p className="text-sm opacity-70 mb-4">Our AI will identify the machine and tell you how to use it safely in both English and Hinglish.</p>
                  
                  <div className="border-2 border-dashed border-[var(--color-brand-primary)] rounded-xl p-8 text-center bg-[var(--color-neu-light)] relative">
                    {machinePreview ? (
                      <div className="flex flex-col items-center z-10 relative">
                        <img src={machinePreview} alt="Machine preview" className="max-h-64 object-contain rounded-xl mb-4 shadow-sm" />
                        <Button variant="default" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMachineFile(null); setMachinePreview(null); setMachineInstructions(''); }}>
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
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
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
                  <div className="mt-4 p-6 bg-[var(--color-neu-base)] border border-[var(--color-neu-border)] rounded-2xl shadow-sm">
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
          )}

          {activeTab === 'classes' && (`;

code = code.replace(/{activeTab === 'classes' && \(/g, uiCode);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
