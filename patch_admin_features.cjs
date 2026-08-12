const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// 1. Add states for manual push and reminders
const statesToAdd = `  const [pushTarget, setPushTarget] = useState('all');
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderSettings, setReminderSettings] = useState({
    beforeExpiry: true,
    onExpiry: true,
    overdueDues: true
  });`;

code = code.replace(
  "const [pushMessage, setPushMessage] = useState('');",
  "const [pushMessage, setPushMessage] = useState('');\n" + statesToAdd
);

// 2. Update handleSendPush logic to support custom user selection
const handleSendPushReplace = `  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    
    let targetEmails = [];
    if (pushTarget === 'all') {
       targetEmails = members.filter(m => m.email).map(m => m.email);
    } else {
       targetEmails = [pushTarget];
    }
    
    if (targetEmails.length === 0) {
       alert("No target members found with a valid email.");
       return;
    }

    const messages = targetEmails.map(email => ({
      user_email: email,
      title: pushTitle,
      message: pushMessage
    }));
    
    await supabase.from('messages').insert(messages);
    setIsPushModalOpen(false);
    setPushTitle('');
    setPushMessage('');
    alert(\`Push notification sent successfully to \${targetEmails.length} member(s)!\`);
  };`;

code = code.replace(/const handleSendPush = async \(e: React\.FormEvent\) => \{[\s\S]*?alert\("Push notification sent to all members successfully!"\);\s*\};/, handleSendPushReplace);

// 3. Update Member CRM View
const tableStart = '<Card className="overflow-hidden p-0">';
const tableEnd = '</table>\n                </div>\n              </Card>';
const crmRegex = new RegExp(tableStart + '[\\s\\S]*?' + tableEnd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

const newCrmView = `<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {membersWithChurnRisk.filter(m => m.name.toLowerCase().includes(searchMember.toLowerCase())).map((member) => (
                  <Card key={member.id} className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold">{member.name}</h3>
                        <p className="opacity-70 text-sm font-medium">{member.email || 'No email'}</p>
                      </div>
                      <span className="neu-pressed px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">{member.plan}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className={\`flex items-center gap-2 font-bold \${member.status === 'Active' ? 'text-green-500' : 'text-[var(--color-brand-primary)]'}\`}>
                        <div className={\`w-2 h-2 rounded-full \${member.status === 'Active' ? 'bg-green-500' : 'bg-[var(--color-brand-primary)]'}\`}></div>
                        {member.status}
                      </span>
                      <span className={\`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider \${member.churnRisk === 'High' ? 'bg-red-100 text-red-700' : member.churnRisk === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}\`}>
                        Risk: {member.churnRisk}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-[var(--color-neu-dark)]/10 flex flex-wrap gap-2">
                      <Button className="flex-1 min-w-[80px] py-2 text-sm bg-green-500 text-white border-green-500 hover:bg-green-600" onClick={() => markAttendance(member.id)}>Present</Button>
                      <Button className="flex-1 min-w-[80px] py-2 text-sm" onClick={() => {
                        setEditingMember(member);
                        setMemberForm({ name: member.name, plan: member.plan, status: member.status });
                        setShowMemberModal(true);
                      }}>Edit</Button>
                      <Button variant="primary" className="flex-1 min-w-[80px] py-2 text-sm" onClick={() => handleUpgradeMember(member.id)}>Upgrade</Button>
                    </div>
                    {member.churnRisk === 'High' && (
                      <Button variant="default" className="w-full text-red-600 border-red-200 hover:bg-red-50 text-sm py-2" onClick={() => alert(\`Sent automated 'We miss you' offer to \${member.name}!\`)}>
                        Send Retention Offer
                      </Button>
                    )}
                  </Card>
                ))}
              </div>`;

code = code.replace(crmRegex, newCrmView);

// 4. Update the "Configure Reminders" Button 
code = code.replace(
  '<Button>Configure Reminders</Button>',
  '<Button onClick={() => setIsReminderModalOpen(true)}>Configure Reminders</Button>'
);

// 5. Update Push Modal & Add Reminders Modal
const modalsCode = `      {isPushModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <h3 className="text-2xl font-black mb-6">Send Push Notification</h3>
            <form onSubmit={handleSendPush} className="space-y-4">
              <div>
                <label className="block text-sm font-bold opacity-70 mb-2">Target Audience</label>
                <select 
                  className="w-full px-4 py-3 bg-[var(--color-neu-bg)] border border-[var(--color-neu-border)] rounded-xl focus:outline-none focus:border-[var(--color-brand-primary)]"
                  value={pushTarget}
                  onChange={(e) => setPushTarget(e.target.value)}
                >
                  <option value="all">All Members</option>
                  {members.filter(m => m.email).map(member => (
                    <option key={member.id} value={member.email}>{member.name} ({member.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold opacity-70 mb-2">Title</label>
                <Input
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  placeholder="e.g. Action Required: Plan Expiring"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold opacity-70 mb-2">Message</label>
                <textarea
                  className="w-full px-4 py-3 bg-[var(--color-neu-bg)] border border-[var(--color-neu-border)] rounded-xl focus:outline-none focus:border-[var(--color-brand-primary)]"
                  rows={4}
                  value={pushMessage}
                  onChange={(e) => setPushMessage(e.target.value)}
                  placeholder="Type your notification message here..."
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button variant="default" className="flex-1" type="button" onClick={() => setIsPushModalOpen(false)}>Cancel</Button>
                <Button variant="primary" className="flex-1" type="submit">Send Now</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {isReminderModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <h3 className="text-2xl font-black mb-6">Automated Reminders Setup</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-[var(--color-neu-light)] rounded-xl cursor-pointer">
                <span className="font-bold">Send 3 days before expiry</span>
                <input type="checkbox" className="w-5 h-5 accent-[var(--color-brand-primary)]" checked={reminderSettings.beforeExpiry} onChange={(e) => setReminderSettings({...reminderSettings, beforeExpiry: e.target.checked})} />
              </label>
              <label className="flex items-center justify-between p-4 bg-[var(--color-neu-light)] rounded-xl cursor-pointer">
                <span className="font-bold">Send on expiry day</span>
                <input type="checkbox" className="w-5 h-5 accent-[var(--color-brand-primary)]" checked={reminderSettings.onExpiry} onChange={(e) => setReminderSettings({...reminderSettings, onExpiry: e.target.checked})} />
              </label>
              <label className="flex items-center justify-between p-4 bg-[var(--color-neu-light)] rounded-xl cursor-pointer">
                <span className="font-bold">Automated Overdue Reminders</span>
                <input type="checkbox" className="w-5 h-5 accent-[var(--color-brand-primary)]" checked={reminderSettings.overdueDues} onChange={(e) => setReminderSettings({...reminderSettings, overdueDues: e.target.checked})} />
              </label>
              <div className="flex gap-4 pt-4">
                <Button variant="default" className="flex-1" onClick={() => setIsReminderModalOpen(false)}>Cancel</Button>
                <Button variant="primary" className="flex-1" onClick={() => {
                  alert("Reminder configuration saved and active!");
                  setIsReminderModalOpen(false);
                }}>Save Configuration</Button>
              </div>
            </div>
          </Card>
        </div>
      )}`;

const pushModalRegex = /\{isPushModalOpen && \([\s\S]*?<\/Card>\s*<\/div>\s*\)\}/;
code = code.replace(pushModalRegex, modalsCode);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
