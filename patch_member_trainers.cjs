const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

const oldTrainers = `  const ptTrainers = [
    { id: 1, name: 'Vikram Singh', spec: 'Powerlifting / Strength', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop', rate: '₹1500/hr' },
    { id: 2, name: 'Anita Desai', spec: 'Mobility / HIIT', img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1469&auto=format&fit=crop', rate: '₹1200/hr' },
    { id: 3, name: 'Rahul Sharma', spec: 'Bodybuilding / Prep', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop', rate: '₹1800/hr' }
  ];`;

const newTrainers = `  const ptTrainers = [
    { id: 1, name: 'Sushant Agrawal', spec: 'Powerlifting Specialist', img: 'https://acsgzgrkwdaczasqadkn.supabase.co/storage/v1/object/public/Gym/Trainers/Sushant.jpeg_202608011758.jpeg', rate: '₹1500/hr' },
    { id: 2, name: 'Nidhi Singh', spec: 'Functional Training', img: 'https://acsgzgrkwdaczasqadkn.supabase.co/storage/v1/object/public/Gym/Trainers/Nidhi.jpeg_202608011801.jpeg', rate: '₹1200/hr' },
    { id: 3, name: 'Bhavendra', spec: 'Bodybuilding Pro', img: 'https://acsgzgrkwdaczasqadkn.supabase.co/storage/v1/object/public/Gym/Trainers/WhatsApp_Image_2026-08-01_at_5.15.01_202608011759.jpeg', rate: '₹1800/hr' }
  ];`;

code = code.replace(oldTrainers, newTrainers);

const oldBookingFn = `  const handlePtBooking = (e: any) => {
    e.preventDefault();
    if (!selectedTrainer || !selectedPtTime) return;
    // Simulate booking
    setPtBookingSuccess(true);
    setTimeout(() => {
      setPtBookingSuccess(false);
      setSelectedTrainer(null);
      setSelectedPtTime('');
    }, 4000);
  };`;

const newBookingFn = `  const handlePtBooking = (e: any) => {
    e.preventDefault();
    if (!selectedTrainer || !selectedPtTime) return;
    
    // Save booking to localStorage for admin panel
    const existing = JSON.parse(localStorage.getItem('ptBookings') || '[]');
    const userStr = localStorage.getItem('currentUser');
    const userEmail = userStr ? JSON.parse(userStr).email : 'member@example.com';
    
    existing.push({
      id: Date.now().toString(),
      user_email: userEmail,
      trainer_name: selectedTrainer.name,
      time_slot: selectedPtTime,
      status: 'Pending',
      created_at: new Date().toISOString()
    });
    localStorage.setItem('ptBookings', JSON.stringify(existing));

    setPtBookingSuccess(true);
    setTimeout(() => {
      setPtBookingSuccess(false);
      setSelectedTrainer(null);
      setSelectedPtTime('');
    }, 4000);
  };`;

code = code.replace(oldBookingFn, newBookingFn);

fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
