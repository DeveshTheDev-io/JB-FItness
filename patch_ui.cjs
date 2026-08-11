const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

const inputHtml = `<Input 
                            placeholder="Weight (kg)" 
                            type="number" 
                            value={logForms[idx]?.weight || ''}
                            onChange={(e) => setLogForms({...logForms, [idx]: {...(logForms[idx] || {reps: ''}), weight: e.target.value}})}
                          />
                          <Input 
                            placeholder="Reps Done" 
                            type="number" 
                            value={logForms[idx]?.reps || ''}
                            onChange={(e) => setLogForms({...logForms, [idx]: {...(logForms[idx] || {weight: ''}), reps: e.target.value}})}
                          />
                          <Button 
                            variant="primary" 
                            className="w-full"
                            onClick={() => handleLogSet(ex, idx)}
                            disabled={isLoggingSet === idx}
                          >
                            {isLoggingSet === idx ? 'Logging...' : 'Log Set'}
                          </Button>`;

code = code.replace(
  /<Input placeholder="Weight \(kg\)" type="number" \/>\s*<Input placeholder="Reps Done" type="number" \/>\s*<Button variant="primary" className="w-full">Log Set<\/Button>/,
  inputHtml
);

const recentActivityHtml = `{workoutLogs.length === 0 ? (
                        <div className="text-center opacity-70 p-4">No recent activity</div>
                      ) : workoutLogs.slice(0, 5).map((log, i) => (
                        <div key={i} className="flex justify-between items-center p-4 neu-flat rounded-xl">
                          <div>
                            <p className="font-bold">{log.exercise_name}</p>
                            <p className="text-sm opacity-70">{new Date(log.completed_at).toLocaleDateString()} {new Date(log.completed_at).toLocaleTimeString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{log.weight}kg × {log.reps}</p>
                          </div>
                        </div>
                      ))}`;

code = code.replace(
  /\{\[\s*\{\s*name: 'Squats', weight: '100kg', reps: 8, time: '10:45 AM'\s*\},[\s\S]*?\]\.map\(\(log, i\) => \([\s\S]*?<\/div>\s*\)\)\}/,
  recentActivityHtml
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
