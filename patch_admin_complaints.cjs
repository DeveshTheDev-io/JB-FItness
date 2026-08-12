const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// Add icon import
code = code.replace(
  "TrendingUp, ShieldCheck",
  "TrendingUp, ShieldCheck, AlertTriangle, CheckCircle"
);
// just in case ShieldCheck is not there, I will just append AlertTriangle to lucide-react imports
if (!code.includes('AlertTriangle')) {
  code = code.replace(
    "from 'lucide-react';",
    "AlertTriangle, CheckCircle, Tool } from 'lucide-react';"
  );
}

// Add state for complaints
const stateCode = `
  const [complaints, setComplaints] = useState([]);
  
  const fetchComplaints = () => {
    const existing = JSON.parse(localStorage.getItem('gymComplaints') || '[]');
    setComplaints(existing.reverse());
  };

  useEffect(() => {
    if (activeTab === 'complaints') {
      fetchComplaints();
    }
  }, [activeTab]);

  const resolveComplaint = (id) => {
    const existing = JSON.parse(localStorage.getItem('gymComplaints') || '[]');
    const updated = existing.map(c => c.id === id ? { ...c, status: 'Resolved' } : c);
    localStorage.setItem('gymComplaints', JSON.stringify(updated));
    setComplaints(updated.reverse());
  };
`;

code = code.replace(
  "const [stats, setStats] = useState({",
  stateCode + "\n  const [stats, setStats] = useState({"
);

// Add Sidebar link
code = code.replace(
  "{ id: 'reviews', icon: Star, label: 'Reviews' },",
  "{ id: 'reviews', icon: Star, label: 'Reviews' },\n            { id: 'complaints', icon: AlertTriangle, label: 'Maintenance Issues' },"
);

// Add Tab content
const complaintsTab = `
          {activeTab === 'complaints' && (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-[var(--color-brand-primary)]" />
                  Maintenance Issues
                </h2>
                <Button onClick={fetchComplaints}>Refresh List</Button>
              </div>

              {complaints.length === 0 ? (
                <Card className="text-center py-16">
                  <Tool className="w-16 h-16 mx-auto mb-4 text-stone-300" />
                  <h3 className="text-xl font-bold text-stone-400">All clear! No equipment issues reported.</h3>
                </Card>
              ) : (
                <div className="space-y-6">
                  {complaints.map(complaint => (
                    <Card key={complaint.id} className={\`border-l-4 \${complaint.status === 'Resolved' ? 'border-green-500 opacity-70' : 'border-[var(--color-brand-primary)]'}\`}>
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{complaint.equipment}</h3>
                            <span className={\`px-3 py-1 rounded-full text-xs font-bold uppercase \${complaint.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}\`}>
                              {complaint.status}
                            </span>
                          </div>
                          <p className="opacity-90 mb-2">{complaint.description}</p>
                          <p className="text-sm opacity-60">Reported by: {complaint.user_email} • {new Date(complaint.date).toLocaleString()}</p>
                        </div>
                        {complaint.status !== 'Resolved' && (
                          <Button variant="primary" className="shrink-0 flex items-center gap-2" onClick={() => resolveComplaint(complaint.id)}>
                            <CheckCircle className="w-4 h-4" /> Mark as Fixed
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
`;

const reviewsRegex = /\{activeTab === 'reviews' && \([\s\S]*?<\/Card>\s*<\/div>\s*<\/>\s*\)\}/;
const match = code.match(reviewsRegex);
if (match) {
  code = code.replace(reviewsRegex, match[0] + '\n\n' + complaintsTab);
} else {
  // Try another replacement strategy if exact regex fails
  code = code.replace(
    "{activeTab === 'logout' && null}",
    complaintsTab + "\n          {activeTab === 'logout' && null}"
  );
}

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
