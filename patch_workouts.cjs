const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

const replacement = `              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black tracking-tight">Workout Programs</h2>
                <div className="flex items-center gap-4">
                  <Button variant="secondary" onClick={() => setIsCreatingRoutine(true)}>
                    <Plus className="w-5 h-5 mr-2" /> Create Custom
                  </Button>
                  <p className="font-medium opacity-70">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {isCreatingRoutine ? (
                <Card variant="flat" className="mt-8 p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Create Custom Routine</h3>
                    <Button variant="ghost" onClick={() => setIsCreatingRoutine(false)}>Cancel</Button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold opacity-70 mb-2">Routine Title</label>
                      <Input 
                        placeholder="e.g., Leg Day Crusher" 
                        value={newRoutine.title}
                        onChange={e => setNewRoutine({ ...newRoutine, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold opacity-70 mb-2">Description</label>
                      <Input 
                        placeholder="Short description of the routine" 
                        value={newRoutine.desc}
                        onChange={e => setNewRoutine({ ...newRoutine, desc: e.target.value })}
                      />
                    </div>
                    
                    <div className="pt-4 border-t border-neutral-100">
                      <h4 className="text-lg font-bold mb-4">Add Exercises</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <Input placeholder="Exercise Name" value={newExercise.name} onChange={e => setNewExercise({ ...newExercise, name: e.target.value })} />
                        <Input placeholder="Sets (e.g., 4)" value={newExercise.sets} onChange={e => setNewExercise({ ...newExercise, sets: e.target.value })} />
                        <Input placeholder="Reps (e.g., 8-12)" value={newExercise.reps} onChange={e => setNewExercise({ ...newExercise, reps: e.target.value })} />
                        <Input className="md:col-span-3" placeholder="Posture / Instructions" value={newExercise.posture} onChange={e => setNewExercise({ ...newExercise, posture: e.target.value })} />
                        <Input className="md:col-span-3" placeholder="Breathing Instructions" value={newExercise.breathing} onChange={e => setNewExercise({ ...newExercise, breathing: e.target.value })} />
                      </div>
                      <Button 
                        variant="secondary" 
                        onClick={() => {
                          if (newExercise.name) {
                            setNewRoutine({ ...newRoutine, exercises: [...newRoutine.exercises, newExercise] });
                            setNewExercise({ name: '', sets: '', reps: '', posture: '', breathing: '' });
                          }
                        }}
                      >
                        Add Exercise
                      </Button>
                    </div>

                    {newRoutine.exercises.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <h4 className="font-bold opacity-70">Added Exercises:</h4>
                        {newRoutine.exercises.map((ex: any, idx: number) => (
                          <div key={idx} className="flex justify-between p-3 neu-flat rounded-lg">
                            <span>{ex.name}</span>
                            <span className="opacity-70">{ex.sets} sets x {ex.reps}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-6">
                      <Button 
                        variant="primary" 
                        className="w-full"
                        onClick={() => {
                          if (!newRoutine.title || newRoutine.exercises.length === 0) {
                            alert('Please enter a title and add at least one exercise.');
                            return;
                          }
                          const key = 'custom_' + Date.now();
                          const updatedCustom = { ...customRoutines, [key]: newRoutine };
                          setCustomRoutines(updatedCustom);
                          if (memberInfo?.email) {
                            localStorage.setItem(\`customRoutines_\${memberInfo.email}\`, JSON.stringify(updatedCustom));
                          }
                          setIsCreatingRoutine(false);
                          setNewRoutine({ title: '', desc: '', exercises: [] });
                        }}
                      >
                        Save Routine
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : !selectedRoutine ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {Object.entries({ ...routines, ...customRoutines }).filter(([key]) => {
                      if (key.startsWith('custom_')) return true;
                      const userGenderRaw = memberInfo?.gender || (localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!).gender : null);
                      const userGender = userGenderRaw ? String(userGenderRaw).trim().toLowerCase() : 'male';
                      if (userGender === 'male') return key.startsWith('mens');
                      if (userGender === 'female') return key.startsWith('womens');
                      return true;
                    }).map(([key, routine]: [string, any]) => {
                      const Icon = routine.icon || Dumbbell;
                      return (
                        <Card key={key} className="flex flex-col p-8 hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => setSelectedRoutine(key)}>
                          <div className="flex justify-between items-start mb-6">
                            <div className="neu-pressed w-16 h-16 rounded-full flex items-center justify-center">
                              <Icon className="w-8 h-8 text-[var(--color-brand-primary)]" />
                            </div>
                            {key.startsWith('custom_') && (
                              <Button variant="ghost" size="sm" onClick={(e) => {
                                e.stopPropagation();
                                const newCustoms = { ...customRoutines };
                                delete newCustoms[key];
                                setCustomRoutines(newCustoms);
                                if (memberInfo?.email) {
                                  localStorage.setItem(\`customRoutines_\${memberInfo.email}\`, JSON.stringify(newCustoms));
                                }
                              }}>Delete</Button>
                            )}
                          </div>
                          <h3 className="text-2xl font-bold mb-2">{routine.title}</h3>
                          <p className="opacity-70 mb-6">{routine.desc}</p>
                          <Button variant="primary" className="mt-auto w-full">Start Routine</Button>
                        </Card>
                      );
                    })}
                  </div>`;

code = code.replace(
  /<div className="flex justify-between items-center">\s*<h2 className="text-3xl font-black tracking-tight">Workout Programs<\/h2>\s*<p className="font-medium opacity-70">\{new Date\(\)\.toLocaleDateString\(\)\}<\/p>\s*<\/div>\s*\{!selectedRoutine \? \(\s*<>\s*<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">\s*\{Object\.entries\(routines\)\.filter\(\(\[key\]\) => \{\s*const userGenderRaw = memberInfo\?\.gender \|\| \(localStorage\.getItem\('currentUser'\) \? JSON\.parse\(localStorage\.getItem\('currentUser'\)!\)\.gender : null\);\s*const userGender = userGenderRaw \? String\(userGenderRaw\)\.trim\(\)\.toLowerCase\(\) : 'male';\s*if \(userGender === 'male'\) return key\.startsWith\('mens'\);\s*if \(userGender === 'female'\) return key\.startsWith\('womens'\);\s*return true;\s*\}\)\.map\(\(\[key, routine\]\) => \{\s*const Icon = routine\.icon;\s*return \(\s*<Card key=\{key\} className="flex flex-col p-8 hover:-translate-y-1 transition-transform cursor-pointer" onClick=\{\(\) => setSelectedRoutine\(key\)\}>\s*<div className="neu-pressed w-16 h-16 rounded-full flex items-center justify-center mb-6">\s*<Icon className="w-8 h-8 text-\[var\(--color-brand-primary\)\]" \/>\s*<\/div>\s*<h3 className="text-2xl font-bold mb-2">\{routine\.title\}<\/h3>\s*<p className="opacity-70 mb-6">\{routine\.desc\}<\/p>\s*<Button variant="primary" className="mt-auto w-full">Start Routine<\/Button>\s*<\/Card>\s*\);\s*\}\)\}\s*<\/div>/,
  replacement
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
