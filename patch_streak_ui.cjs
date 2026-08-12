const fs = require('fs');

let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

const newUI = `<div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black tracking-tight">Workout Programs</h2>
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-2 bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] px-4 py-2 rounded-full font-bold">
                    <Award className="w-5 h-5" />
                    <span>{memberInfo?.streak_count || 0} Day Streak</span>
                  </div>
                  <Button variant="secondary" onClick={() => setIsCreatingRoutine(true)}>
                    <Plus className="w-5 h-5 mr-2" /> Create Custom
                  </Button>
                  <p className="font-medium opacity-70 hidden lg:block">{new Date().toLocaleDateString()}</p>
                </div>
              </div>`;

code = code.replace(
  /<div className="flex justify-between items-center">\s*<h2 className="text-3xl font-black tracking-tight">Workout Programs<\/h2>\s*<div className="flex items-center gap-4">\s*<Button variant="secondary" onClick=\{\(\) => setIsCreatingRoutine\(true\)\}>\s*<Plus className="w-5 h-5 mr-2" \/> Create Custom\s*<\/Button>\s*<p className="font-medium opacity-70">\{new Date\(\)\.toLocaleDateString\(\)\}<\/p>\s*<\/div>\s*<\/div>/,
  newUI
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
