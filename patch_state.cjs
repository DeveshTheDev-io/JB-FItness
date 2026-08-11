const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

const newStates = `
  // Custom Routines State
  const [customRoutines, setCustomRoutines] = useState<any>({});
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
  const [newRoutine, setNewRoutine] = useState<any>({ title: '', desc: '', exercises: [] });
  const [newExercise, setNewExercise] = useState({ name: '', sets: '', reps: '', posture: '', breathing: '' });

  useEffect(() => {
    if (memberInfo?.email) {
      const saved = localStorage.getItem(\`customRoutines_\${memberInfo.email}\`);
      if (saved) setCustomRoutines(JSON.parse(saved));
    }
  }, [memberInfo]);
`;

code = code.replace(
  "const [isSavingProfile, setIsSavingProfile] = useState(false);",
  "const [isSavingProfile, setIsSavingProfile] = useState(false);\n" + newStates
);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
