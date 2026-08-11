const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

const saveProfileCode = `
  const handleSaveProfile = async () => {
    if (!supabase || !memberInfo?.id) return;
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('members')
        .update({ 
          gender: profileForm.gender, 
          phone: profileForm.phone, 
          dob: profileForm.dob, 
          address: profileForm.address,
          photo_url: profileForm.photo_url
        })
        .eq('id', memberInfo.id);
        
      if (error) throw error;
      
      setMemberInfo({ ...memberInfo, ...profileForm });
      
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        const user = JSON.parse(currentUserStr);
        user.gender = profileForm.gender;
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      
      alert('Profile updated successfully!');
    } catch (e: any) {
      alert(e.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm({ ...profileForm, photo_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (`;

code = code.replace("  return (", saveProfileCode);
fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
