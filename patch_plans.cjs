const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

const oldLogic = `  const currentPlan = myPlans.find(plan => new Date(plan.start_date) <= new Date() && new Date(plan.end_date) >= new Date());
  const isPro = currentPlan?.plan_name?.includes('Pro');
  const isElite = currentPlan?.plan_name?.includes('Elite');`;

const newLogic = `  const dbCurrentPlan = myPlans.find(plan => new Date(plan.start_date) <= new Date() && new Date(plan.end_date) >= new Date());
  
  // Use admin assigned plan if no active plan is found in user_plans
  const adminPlan = (!dbCurrentPlan && memberInfo?.plan && memberInfo.plan !== 'None' && memberInfo.status === 'Active')
    ? {
        id: 'admin_assigned',
        plan_name: memberInfo.plan + ' Plan',
        months: 'Admin Assigned',
        start_date: memberInfo.created_at || new Date().toISOString(),
        end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        active: true
      }
    : null;

  const currentPlan = dbCurrentPlan || adminPlan;
  
  // Ensure the UI shows the admin plan in the list if they have it
  const displayPlans = adminPlan ? [adminPlan, ...myPlans] : myPlans;

  const isPro = currentPlan?.plan_name?.includes('Pro');
  const isElite = currentPlan?.plan_name?.includes('Elite');`;

code = code.replace(oldLogic, newLogic);

code = code.replace(
  "{myPlans.length === 0 ? (",
  "{displayPlans.length === 0 ? ("
);

code = code.replace(
  "myPlans.map((plan) => {",
  "displayPlans.map((plan) => {"
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
