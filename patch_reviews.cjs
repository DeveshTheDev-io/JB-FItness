const fs = require('fs');
let code = fs.readFileSync('src/pages/LandingPage.tsx', 'utf8');

code = code.replace(/supabase\.from\('reviews'\)/g, "supabase.from('gym_reviews')");
// Update the schema fields in handleReviewSubmit
code = code.replace(
  "setReviewForm({ name: '', gender: 'Male', status: 'Member', rating: 5, text: '' })",
  "setReviewForm({ name: '', gender: 'Male', gym_status: 'Member', rating: 5, review_text: '' })"
);
// Also in the initial state
code = code.replace(
  "const [reviewForm, setReviewForm] = useState({ name: '', gender: 'Male', status: 'Member', rating: 5, text: '' });",
  "const [reviewForm, setReviewForm] = useState({ name: '', gender: 'Male', gym_status: 'Member', rating: 5, review_text: '' });"
);

// We need to fix the review mapping in the UI as well. The UI uses review.text and review.status. Let's find those.
code = code.replace(/review\.text/g, "(review.review_text || review.text)");
code = code.replace(/review\.status/g, "(review.gym_status || review.status)");

// We should also replace the input bindings
code = code.replace(/status: e\.target\.value/g, "gym_status: e.target.value");
code = code.replace(/reviewForm\.status/g, "reviewForm.gym_status");
code = code.replace(/text: e\.target\.value/g, "review_text: e.target.value");
code = code.replace(/reviewForm\.text/g, "reviewForm.review_text");

fs.writeFileSync('src/pages/LandingPage.tsx', code);
