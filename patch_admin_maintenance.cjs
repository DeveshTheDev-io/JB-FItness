const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// Ensure CheckCircle is imported
if (!code.includes('CheckCircle')) {
  code = code.replace(
    "from 'lucide-react';",
    "CheckCircle } from 'lucide-react';"
  );
}

// Add state for complaints
const stateCode = `
  const [userComplaints, setUserComplaints] = useState([]);
  
  const fetchComplaints = () => {
    const existing = JSON.parse(localStorage.getItem('gymComplaints') || '[]');
    setUserComplaints(existing.reverse());
  };

  useEffect(() => {
    if (activeTab === 'maintenance') {
      fetchComplaints();
    }
  }, [activeTab]);

  const resolveComplaint = (id) => {
    const existing = JSON.parse(localStorage.getItem('gymComplaints') || '[]');
    const updated = existing.map(c => c.id === id ? { ...c, status: 'Resolved' } : c);
    localStorage.setItem('gymComplaints', JSON.stringify(updated));
    setUserComplaints(updated.reverse());
  };
`;

code = code.replace(
  "const [stats, setStats] = useState({",
  stateCode + "\n  const [stats, setStats] = useState({"
);

// Update Maintenance UI
const complaintsUI = `
              <Card className="p-6 mt-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-lg">Member Issue Reports</h3>
                    <p className="text-sm opacity-60">Reported via Community page</p>
                  </div>
                  <Button variant="default" onClick={fetchComplaints}>Refresh List</Button>
                </div>
                
                {userComplaints.length === 0 ? (
                  <div className="text-center py-8 opacity-60 font-medium">
                    No issues reported by members.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userComplaints.map(complaint => (
                      <div key={complaint.id} className={\`p-4 rounded-xl border \${complaint.status === 'Resolved' ? 'bg-stone-50 border-stone-200 opacity-60' : 'bg-white border-red-200'}\`}>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold">{complaint.equipment}</h4>
                              <span className={\`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider \${complaint.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}\`}>
                                {complaint.status}
                              </span>
                            </div>
                            <p className="text-sm font-medium mb-2">{complaint.description}</p>
                            <p className="text-xs opacity-60">Reported by {complaint.user_email} • {new Date(complaint.date).toLocaleString()}</p>
                          </div>
                          {complaint.status !== 'Resolved' && (
                            <Button variant="primary" className="shrink-0 flex items-center gap-2" onClick={() => resolveComplaint(complaint.id)}>
                              <CheckCircle className="w-4 h-4" /> Mark Fixed
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
`;

// Replace `</div>\n              </Card>\n            </div>` with the new UI, but wait, need accurate regex.
const maintenanceRegex = /<\/Card>\s*<\/div>\s*\)\}/;
// Actually let's just split at the end of the maintenance block.
const blockToReplace = `                </div>
              </Card>
            </div>
          )}`;

const newBlock = `                </div>
              </Card>` + complaintsUI + `
          )}`;

code = code.replace(blockToReplace, newBlock);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
