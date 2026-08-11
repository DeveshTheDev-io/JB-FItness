const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

const replacement = `              ) : (
                <div className="space-y-6">
                  <Button variant="icon" className="mb-4" onClick={() => setSelectedRoutine(null)}>
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <h3 className="text-2xl font-black mb-6">{({ ...routines, ...customRoutines })[selectedRoutine]?.title}</h3>
                  
                  {({ ...routines, ...customRoutines })[selectedRoutine]?.exercises?.map((ex: any, idx: number) => (`;

code = code.replace(
  /\) : \(\s*<div className="space-y-6">\s*<Button variant="icon" className="mb-4" onClick=\{\(\) => setSelectedRoutine\(null\)\}>\s*<ArrowLeft className="w-5 h-5" \/>\s*<\/Button>\s*<h3 className="text-2xl font-black mb-6">\{routines\[selectedRoutine as keyof typeof routines\]\.title\}<\/h3>\s*\{routines\[selectedRoutine as keyof typeof routines\]\.exercises\.map\(\(ex, idx\) => \(/,
  replacement
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
