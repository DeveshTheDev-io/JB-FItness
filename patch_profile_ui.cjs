const fs = require('fs');
let code = fs.readFileSync('src/pages/MemberDashboard.tsx', 'utf8');

const profileUI = `          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-black tracking-tight mb-2">Profile Settings</h2>
                <p className="text-neutral-500">Manage your personal information and preferences.</p>
              </div>
              <Card className="max-w-2xl p-6">
                <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }} className="space-y-6">
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center border-4 border-white shadow-lg">
                        {profileForm.photo_url ? (
                          <img src={profileForm.photo_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-16 h-16 text-neutral-400" />
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 p-3 bg-black text-white rounded-full cursor-pointer hover:bg-neutral-800 transition-colors shadow-lg">
                        <Camera className="w-5 h-5" />
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold opacity-70 mb-2 uppercase tracking-widest">Gender</label>
                      <select 
                        value={profileForm.gender} 
                        onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })}
                        className="w-full p-3 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-black/5"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold opacity-70 mb-2 uppercase tracking-widest">Date of Birth</label>
                      <Input 
                        type="date" 
                        value={profileForm.dob} 
                        onChange={e => setProfileForm({ ...profileForm, dob: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold opacity-70 mb-2 uppercase tracking-widest">Phone Number</label>
                      <Input 
                        placeholder="+91 9876543210" 
                        value={profileForm.phone} 
                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold opacity-70 mb-2 uppercase tracking-widest">Address</label>
                      <textarea 
                        className="w-full p-4 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-black/5 resize-none h-24"
                        placeholder="Enter your full address"
                        value={profileForm.address}
                        onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-neutral-100 flex justify-end">
                    <Button type="submit" variant="primary" className="px-8 py-3" disabled={isSavingProfile}>
                      {isSavingProfile ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
          {activeTab === 'subscription' && (`;

code = code.replace("{activeTab === 'subscription' && (", profileUI);
fs.writeFileSync('src/pages/MemberDashboard.tsx', code);
