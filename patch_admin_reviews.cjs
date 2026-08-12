const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

const addReviewModalCode = `
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', gender: 'Male', status: 'Member', rating: 5, text: '' });

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setReviews([{ id: Date.now(), ...newReview, created_at: new Date().toISOString() }, ...reviews]);
      setShowAddReview(false);
      setNewReview({ name: '', gender: 'Male', status: 'Member', rating: 5, text: '' });
      return;
    }
    const { data, error } = await supabase.from('reviews').insert([newReview]).select().single();
    if (!error && data) {
      setReviews([data, ...reviews]);
      setShowAddReview(false);
      setNewReview({ name: '', gender: 'Male', status: 'Member', rating: 5, text: '' });
    }
  };
`;

code = code.replace(
  "const deleteReview = async (id: number) => {",
  addReviewModalCode + "\n  const deleteReview = async (id: number) => {"
);

const reviewManagementTab = `
          {activeTab === 'reviews' && (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black tracking-tight">Review Management</h2>
                <Button variant="primary" onClick={() => setShowAddReview(true)}>
                  <Plus className="w-5 h-5 mr-2" /> Add Review
                </Button>
              </div>

              {showAddReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddReview(false)} />
                  <div className="relative bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
                    <h3 className="text-2xl font-bold mb-4">Add Review</h3>
                    <form onSubmit={handleAddReview} className="flex flex-col gap-4">
                      <Input placeholder="Name" required value={newReview.name} onChange={e => setNewReview({...newReview, name: e.target.value})} />
                      <select className="px-4 py-3 bg-[var(--color-neu-bg)] border-2 border-transparent rounded-xl font-bold text-sm w-full outline-none" value={newReview.gender} onChange={e => setNewReview({...newReview, gender: e.target.value})}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      <Input placeholder="Status (e.g., Member, Pro)" value={newReview.status} onChange={e => setNewReview({...newReview, status: e.target.value})} />
                      <Input type="number" min="1" max="5" placeholder="Rating (1-5)" value={newReview.rating} onChange={e => setNewReview({...newReview, rating: parseInt(e.target.value)})} />
                      <textarea required rows={4} placeholder="Review text" className="px-4 py-3 bg-[var(--color-neu-bg)] border-2 border-transparent rounded-xl font-bold text-sm w-full outline-none resize-none" value={newReview.text} onChange={e => setNewReview({...newReview, text: e.target.value})} />
                      <div className="flex gap-2">
                        <Button type="button" variant="default" className="flex-1" onClick={() => setShowAddReview(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" className="flex-1">Save</Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
`;

code = code.replace(
  /<div className="flex justify-between items-center mb-8">\s*<h2 className="text-3xl font-black tracking-tight">Review Management<\/h2>\s*<\/div>/,
  reviewManagementTab.replace("{activeTab === 'reviews' && (\n            <>\n", "")
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
