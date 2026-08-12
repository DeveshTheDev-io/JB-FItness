const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// 1. Add ptBookings state
const statePattern = /const \[reviews, setReviews\] = useState<any\[\]>\(\[\]\);/;
code = code.replace(
  statePattern,
  "const [reviews, setReviews] = useState<any[]>([]);\n  const [ptBookings, setPtBookings] = useState<any[]>([]);"
);

// 2. Add loading of ptBookings in useEffect
const effectPattern = /const savedReviews = localStorage\.getItem\('gymReviews'\);\s+if \(savedReviews\) \{\s+setReviews\(JSON\.parse\(savedReviews\)\);\s+\}/;
code = code.replace(
  effectPattern,
  "const savedReviews = localStorage.getItem('gymReviews');\n      if (savedReviews) {\n        setReviews(JSON.parse(savedReviews));\n      }\n      const savedPT = localStorage.getItem('ptBookings');\n      if (savedPT) {\n        setPtBookings(JSON.parse(savedPT));\n      }"
);

// 3. Add handle function for PT confirmation
const fnPattern = /const resolveIssue = \([^)]+\) => \{[\s\S]*?\};/;
code = code.replace(
  fnPattern,
  "const resolveIssue = (id: string) => {\n    const updated = issues.map(issue => issue.id === id ? { ...issue, status: 'Resolved' } : issue);\n    setIssues(updated);\n    localStorage.setItem('gymComplaints', JSON.stringify(updated));\n  };\n\n  const confirmPTBooking = (id: string) => {\n    const updated = ptBookings.map(b => b.id === id ? { ...b, status: 'Confirmed' } : b);\n    setPtBookings(updated);\n    localStorage.setItem('ptBookings', JSON.stringify(updated));\n  };"
);

// 4. Add Tab Link in Sidebar
const sidebarPattern = /\{ id: 'trials', icon: ClipboardList, label: 'Trial Requests' \},/;
code = code.replace(
  sidebarPattern,
  "{ id: 'trials', icon: ClipboardList, label: 'Trial Requests' },\n            { id: 'ptrequests', icon: UserCheck, label: 'PT Requests' },"
);

// Update lucide-react imports to include UserCheck if not there
if (!code.includes('UserCheck')) {
  code = code.replace("XCircle } from 'lucide-react';", "XCircle, UserCheck } from 'lucide-react';");
}

// 5. Add Tab Content
const tabContent = `
          {activeTab === 'ptrequests' && (
            <>
              <h2 className="text-3xl font-black tracking-tight mb-8">Personal Trainer Requests</h2>
              <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-stone-50 border-b border-stone-200 text-sm font-bold opacity-70 uppercase tracking-wider">
                      <tr>
                        <th className="p-4">Member Email</th>
                        <th className="p-4">Trainer</th>
                        <th className="p-4">Time Slot</th>
                        <th className="p-4">Requested On</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium">
                      {ptBookings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-stone-500">No PT requests found.</td>
                        </tr>
                      ) : (
                        ptBookings.slice().reverse().map((booking, i) => (
                          <tr key={i} className="hover:bg-stone-50 transition-colors">
                            <td className="p-4">{booking.user_email}</td>
                            <td className="p-4 font-bold text-[var(--color-brand-primary)]">{booking.trainer_name}</td>
                            <td className="p-4">{booking.time_slot}</td>
                            <td className="p-4 text-stone-500">{new Date(booking.created_at).toLocaleDateString()}</td>
                            <td className="p-4">
                              <span className={"px-3 py-1 rounded-full text-xs font-bold " + (booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="p-4">
                              {booking.status !== 'Confirmed' && (
                                <button 
                                  onClick={() => confirmPTBooking(booking.id)} 
                                  className="px-4 py-2 bg-black text-white text-sm font-bold rounded-full hover:bg-neutral-800 transition-colors"
                                >
                                  Confirm
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
`;

// Insert the tab content before the reviews tab
const insertTarget = /{activeTab === 'reviews' && \(/;
code = code.replace(insertTarget, tabContent + "\n          {activeTab === 'reviews' && (");

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
