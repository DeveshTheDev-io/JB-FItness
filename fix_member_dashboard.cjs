const fs = require('fs');

let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

// 1. Add tabs to the nav list
const oldTabs = `            { id: 'workout', icon: Play, label: 'Workout Tracker' },
            { id: 'aicoach', icon: Wind, label: 'Smart Planner' },
            { id: 'formchecker', icon: Activity, label: 'Form Checker' },
            { id: 'receptionist', icon: Users, label: '24/7 Front Desk' },
            { id: 'classes', icon: Calendar, label: 'Book Classes' },
            { id: 'subscription', icon: CreditCard, label: 'Subscription' },
            { id: 'logout', icon: ArrowLeft, label: 'Log Out' },`;

const newTabs = `            { id: 'workout', icon: Play, label: 'Workout Tracker' },
            { id: 'aicoach', icon: Wind, label: 'Smart Planner' },
            { id: 'diettracker', icon: Activity, label: 'Diet Tracker' },
            { id: 'formchecker', icon: Activity, label: 'Form Checker' },
            { id: 'buddymatcher', icon: Users, label: 'Buddy Matcher' },
            { id: 'achievements', icon: Activity, label: 'Achievements' },
            { id: 'receptionist', icon: Users, label: '24/7 Front Desk' },
            { id: 'classes', icon: Calendar, label: 'Book Classes' },
            { id: 'subscription', icon: CreditCard, label: 'Subscription' },
            { id: 'logout', icon: ArrowLeft, label: 'Log Out' },`;

code = code.replace(oldTabs, newTabs);

// 2. Add state for new features (Diet Tracker & Buddy Matcher)
const stateInjectionPoint = `  // Receptionist State`;
const newStates = `  // Diet Tracker State
  const [foodImage, setFoodImage] = useState<File | null>(null);
  const [foodPreview, setFoodPreview] = useState<string | null>(null);
  const [dietInfo, setDietInfo] = useState<any>(null);
  
  // Buddy Matcher State
  const [buddies, setBuddies] = useState<any[]>([]);

  const checkFood = async () => {
    if (!foodImage || !foodPreview) return;
    setIsAiLoading(true);
    try {
      const base64Data = foodPreview.split(',')[1];
      const res = await fetch('/api/ai/diet-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileData: base64Data, mimeType: foodImage.type })
      });
      const data = await res.json();
      setDietInfo(data);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze food.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFoodUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoodImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoodPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const findBuddies = async () => {
    setIsAiLoading(true);
    // Simulating matching API
    setTimeout(() => {
      setBuddies([
        { name: "Alex R.", match: "98%", goal: "Hypertrophy", times: "6 AM - 8 AM" },
        { name: "Sarah M.", match: "92%", goal: "Powerlifting", times: "6 AM - 8 AM" }
      ]);
      setIsAiLoading(false);
    }, 1500);
  };

  // Receptionist State`;

code = code.replace(stateInjectionPoint, newStates);

// 3. Add UI cases for the new tabs
const uiInjectionPoint = `          {activeTab === 'subscription' && (`;
const newUIs = `          {activeTab === 'diettracker' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Snap & Count AI Diet Tracker</h2>
                <p className="text-neutral-500">Take a picture of your food. Gemini AI instantly estimates calories, protein, carbs, and fats directly to your log.</p>
              </div>
              <Card className="p-6 space-y-4 max-w-xl">
                <div>
                  <label className="block text-sm font-semibold mb-2">Upload Meal Image</label>
                  <input type="file" accept="image/*" onChange={handleFoodUpload} className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  {foodPreview && (
                    <img src={foodPreview} alt="Preview" className="w-full h-48 object-cover rounded-xl mb-4" />
                  )}
                  <Button onClick={checkFood} disabled={isAiLoading || !foodImage} className="w-full">
                    {isAiLoading ? 'Analyzing...' : 'Analyze Meal'}
                  </Button>
                </div>
                {dietInfo && (
                  <div className="p-4 bg-green-50 rounded-xl mt-4 border border-green-200">
                    <h3 className="font-bold text-lg mb-2">Meal Analysis</h3>
                    <p><strong>Food:</strong> {dietInfo.foodName}</p>
                    <p><strong>Calories:</strong> {dietInfo.calories} kcal</p>
                    <div className="flex gap-4 mt-2">
                      <div><span className="text-sm font-medium text-neutral-500">Protein</span><br/>{dietInfo.protein}g</div>
                      <div><span className="text-sm font-medium text-neutral-500">Carbs</span><br/>{dietInfo.carbs}g</div>
                      <div><span className="text-sm font-medium text-neutral-500">Fats</span><br/>{dietInfo.fats}g</div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'buddymatcher' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">AI Gym Buddy Matcher</h2>
                <p className="text-neutral-500">Find your perfect training partner. Our AI matches you based on goals and attendance times.</p>
              </div>
              <Card className="p-6 space-y-4 max-w-xl">
                <Button onClick={findBuddies} disabled={isAiLoading} className="w-full">
                  {isAiLoading ? 'Finding Matches...' : 'Find My Gym Buddy'}
                </Button>
                
                {buddies.length > 0 && (
                  <div className="space-y-4 mt-6">
                    {buddies.map((buddy, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
                        <div>
                          <h4 className="font-bold">{buddy.name}</h4>
                          <p className="text-sm text-neutral-500">{buddy.goal} • {buddy.times}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-green-600 font-bold bg-green-100 px-2 py-1 rounded-full text-sm">{buddy.match} Match</span>
                          <Button size="sm" variant="outline" className="mt-2 block w-full">Connect</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">AI Achievements & Milestones</h2>
                <p className="text-neutral-500">Track your progress and earn custom AI-generated badges.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                <Card className="p-6 flex items-center gap-6">
                  <div className="text-5xl">🔥</div>
                  <div>
                    <h3 className="font-bold text-lg">7-Day Streak</h3>
                    <p className="text-sm text-neutral-500 mb-2">You've hit the gym 7 days in a row!</p>
                    <Button size="sm" variant="outline">Share to Story</Button>
                  </div>
                </Card>
                <Card className="p-6 flex items-center gap-6 opacity-60 grayscale">
                  <div className="text-5xl">🏋️</div>
                  <div>
                    <h3 className="font-bold text-lg">100kg Deadlift</h3>
                    <p className="text-sm text-neutral-500">Unlock by lifting 100kg.</p>
                  </div>
                </Card>
                <Card className="p-6 flex items-center gap-6">
                  <div className="text-5xl">🚀</div>
                  <div>
                    <h3 className="font-bold text-lg">Early Bird</h3>
                    <p className="text-sm text-neutral-500 mb-2">5 check-ins before 7 AM.</p>
                    <Button size="sm" variant="outline">Share to Story</Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (`;

code = code.replace(uiInjectionPoint, newUIs);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
