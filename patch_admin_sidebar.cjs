const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const replacement = `  return (
    <div className="min-h-screen bg-[var(--color-neu-base)] flex flex-col md:flex-row relative">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 sticky top-0 z-40 bg-[var(--color-neu-base)] shadow-[0_4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="neu-convex p-2 rounded-lg">
            <Activity className="text-[var(--color-brand-primary)] w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">FITNESS</h2>
          </div>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 neu-flat rounded-lg">
          <Menu className="w-6 h-6 text-black" />
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={\`fixed md:sticky top-0 left-0 h-screen w-72 md:w-80 p-6 flex flex-col gap-8 bg-[var(--color-neu-base)] z-50 transition-transform duration-300 md:translate-x-0 overflow-y-auto shadow-2xl md:shadow-none \${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}\`}
      >
        <div className="flex items-center justify-between md:justify-start gap-4">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
            <div className="neu-convex p-3 rounded-xl">
              <Activity className="text-[var(--color-brand-primary)]" />
            </div>
            <div>
              <h2 className="font-bold text-xl">FITNESS</h2>
              <p className="text-sm opacity-70">Admin Console</p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 neu-flat rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-4 pb-4 md:pb-0">
          {[
            { id: 'overview', icon: TrendingUp, label: 'Analytics & Trends' },
            { id: 'ai-insights', icon: Search, label: 'AI Business Insights' },
            { id: 'members', icon: Users, label: 'Member CRM' },
            { id: 'dues', icon: IndianRupee, label: 'Dues & Payments' },
            { id: 'trials', icon: ClipboardList, label: 'Trial Requests' },
            { id: 'reviews', icon: Star, label: 'Reviews' },
            { id: 'logout', icon: XCircle, label: 'Log Out' },
          ].map((tab) => (
            <Button 
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'default'}
              className={\`justify-start gap-4 flex-shrink-0 \${tab.id === 'logout' ? 'text-red-600' : ''}\`}
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (tab.id === 'logout') {
                  localStorage.removeItem('currentUser');
                  navigate('/');
                } else {
                  setActiveTab(tab.id);
                }
              }}
            >
              <tab.icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </Button>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full md:w-auto">`;

const pattern = /  return \(\s*<div className="min-h-screen bg-\[var\(--color-neu-base\)\] flex flex-col md:flex-row">[\s\S]*?\{\/\* Main Content \*\/\}\s*<main className="flex-1 p-4 md:p-8 overflow-y-auto w-full md:w-auto">/;

code = code.replace(pattern, replacement);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
