const fs = require('fs');

let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// 1. Add tab to nav list
const oldTabs = `            { id: 'trials', icon: ClipboardList, label: 'Trial Requests' },
            { id: 'logout', icon: Settings, label: 'Log Out' },`;

const newTabs = `            { id: 'trials', icon: ClipboardList, label: 'Trial Requests' },
            { id: 'maintenance', icon: Settings, label: 'Predictive Maintenance' },
            { id: 'logout', icon: Settings, label: 'Log Out' },`;

code = code.replace(oldTabs, newTabs);

// 2. Add maintenance UI
const uiInjectionPoint = `          {activeTab === 'trials' && (`;
const newUI = `          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Predictive Equipment Maintenance</h2>
                <p className="text-neutral-500">AI predictions for equipment faults based on user reports and attendance.</p>
              </div>
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">AI Predicted Faults</h3>
                  <Button variant="outline" size="sm" onClick={async () => {
                     // Simulate refresh
                  }}>Refresh Predictions</Button>
                </div>
                <div className="space-y-4">
                  {[
                    { machine: 'Cable Crossover Station', urgency: 'High', reason: 'Multiple reports of frayed cables + high daily usage.' },
                    { machine: 'Treadmill #4', urgency: 'Medium', reason: 'Motor temperature anomalies reported over last 3 days.' },
                    { machine: 'Leg Press', urgency: 'Low', reason: 'Squeaking noise reported, track needs lubrication.' }
                  ].map((pred, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-stone-50 rounded-xl border border-stone-200">
                      <div>
                        <h4 className="font-bold">{pred.machine}</h4>
                        <p className="text-sm text-neutral-500 max-w-lg mt-1">{pred.reason}</p>
                      </div>
                      <span className={\`px-3 py-1 rounded-full text-xs font-bold \${pred.urgency === 'High' ? 'bg-red-100 text-red-700' : pred.urgency === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}\`}>
                        {pred.urgency} Urgency
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'trials' && (`;

code = code.replace(uiInjectionPoint, newUI);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
