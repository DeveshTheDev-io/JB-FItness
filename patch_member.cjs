const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

// 1. Add Lock to lucide-react imports if not there
if (!code.includes('Lock,')) {
  code = code.replace(/import {([^}]+)} from 'lucide-react';/, "import { $1, Lock } from 'lucide-react';");
}

// 2. Add plan checks at the top of the component
const planChecks = `  const currentPlan = myPlans.find(plan => new Date(plan.start_date) <= new Date() && new Date(plan.end_date) >= new Date());
  const isPro = currentPlan?.plan_name?.includes('Pro');
  const isElite = currentPlan?.plan_name?.includes('Elite');
  const hasBasicAI = isPro || isElite;
  const hasFullAI = isElite;

  const getRequiredPlan = (tabId: string) => {
    if (['aicoach', 'diettracker'].includes(tabId)) return 'Elite';
    if (['formchecker', 'buddymatcher'].includes(tabId)) return 'Pro or Elite';
    return 'Active Plan';
  };

  const isTabLocked = (tabId: string) => {
    if (['aicoach', 'diettracker'].includes(tabId)) return !hasFullAI;
    if (['formchecker', 'buddymatcher'].includes(tabId)) return !hasBasicAI;
    return false;
  };
`;

code = code.replace(
  /export default function MemberDashboard\(\) \{[\s\S]*?const \[activeTab, setActiveTab\] = useState\('workout'\);/,
  "export default function MemberDashboard() {\n  const [activeTab, setActiveTab] = useState('workout');\n"
);
code = code.replace(
  /const \[myMessages, setMyMessages\] = useState<any\[\]>\(\[\]\);\n  const \[memberInfo, setMemberInfo\] = useState<any>\(null\);/,
  "const [myMessages, setMyMessages] = useState<any[]>([]);\n  const [memberInfo, setMemberInfo] = useState<any>(null);\n" + planChecks
);

// 3. Add Lock icons in the sidebar navigation
code = code.replace(
  /\{tab\.label\}/g,
  `{tab.label} {isTabLocked(tab.id) && <Lock className="w-4 h-4 ml-auto text-neutral-400" />}`
);

// 4. Change main content to show locked screen if locked
const mainContentReplacement = `      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {isTabLocked(activeTab) ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <Lock className="w-20 h-20 text-[var(--color-brand-primary)] mb-6 opacity-80" />
              <h2 className="text-3xl font-black mb-4">Feature Locked</h2>
              <p className="text-lg opacity-70 mb-8 max-w-md mx-auto">
                This feature requires the <strong>{getRequiredPlan(activeTab)}</strong> plan. Upgrade your subscription to unlock it.
              </p>
              <Button variant="primary" className="px-8 py-3" onClick={() => window.location.href = '/#plans'}>Upgrade Plan</Button>
            </div>
          ) : (
            <>
              {activeTab === 'progress' && (`;

code = code.replace(
  /\{\/\* Main Content \*\/\}[\s\S]*?\{activeTab === 'progress' && \(/,
  mainContentReplacement
);

// Close the wrapper around the tabs
code = code.replace(
  /\{activeTab === 'subscription' && \([\s\S]*?<\/>\n          \)}/,
  `{activeTab === 'subscription' && (
            <>
              <h2 className="text-3xl font-black tracking-tight mb-8">Your Subscription</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card variant="convex" className="border-t-4 border-[var(--color-brand-primary)]">
                  <h3 className="text-xl font-bold mb-2">Current Plan</h3>
                  {currentPlan ? (
                    <>
                      <div className="text-4xl font-black text-[var(--color-brand-primary)] mb-4">{currentPlan.plan_name}</div>
                      <p className="mb-6 opacity-70">Access to facilities based on your plan tier.</p>
                      <div className="neu-pressed p-4 rounded-xl flex justify-between items-center mb-6">
                        <span className="font-medium">Status</span>
                        <span className="text-green-500 font-bold">Active</span>
                      </div>
                      <div className="neu-pressed p-4 rounded-xl flex justify-between items-center">
                        <span className="font-medium">Valid Until</span>
                        <span className="font-bold">{new Date(currentPlan.end_date).toLocaleDateString()}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-black text-neutral-500 mb-4">No Active Plan</div>
                      <p className="mb-6 opacity-70">You currently do not have an active membership plan.</p>
                    </>
                  )}
                </Card>
                <Card className="flex flex-col justify-center items-center text-center">
                  <CreditCard className="w-16 h-16 text-[var(--color-brand-primary)] mb-4" />
                  <h3 className="text-2xl font-bold mb-2">{currentPlan ? 'Renew Your Plan' : 'Purchase a Plan'}</h3>
                  <p className="opacity-70 mb-8">{currentPlan ? 'Extend your membership to avoid interruption.' : 'Get access to our facilities and features by purchasing a plan.'}</p>
                  <Button variant="primary" className="w-full text-lg py-4" onClick={() => window.location.href = '/#plans'}>View Plans</Button>
                </Card>
              </div>
            </>
          )}
            </>
          )}`
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
