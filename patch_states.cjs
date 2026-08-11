const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

code = code.replace(
  "const [myMessages, setMyMessages] = useState<any[]>([]);",
  "const [myMessages, setMyMessages] = useState<any[]>([]);\n  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);\n  const [logForms, setLogForms] = useState<Record<number, {weight: string, reps: string}>>({});\n  const [isLoggingSet, setIsLoggingSet] = useState<number | null>(null);"
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
