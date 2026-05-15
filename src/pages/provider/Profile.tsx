// src/pages/provider/Profile.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { SetPasswordForm } from '../../components/profile/SetPasswordForm';
import { NimartSpinner } from '../../components/common/NimartSpinner';
import toast from 'react-hot-toast';
import {
  User, Phone, Store, FileText, Save, Camera, AlertCircle,
  Home, Landmark, Image, Languages, GraduationCap, Calendar,
  CheckCircle, Loader2
} from 'lucide-react';

export default function ProviderProfile() {
  const navigate = useNavigate();
  const { user, profile, updateProfile, refreshProfile } = useAuth();

  // --- Setup‑filled fields (read‑only) ---
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [addressArea, setAddressArea] = useState('');
  const [fullName, setFullName] = useState('');
  const [description, setDescription] = useState('');

  // --- Profile‑specific fields (editable) ---
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [education, setEducation] = useState('');
  const [languages, setLanguages] = useState('');

  // --- UI states ---
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  // Check localStorage for password completion
  const [passwordCompleted, setPasswordCompleted] = useState(() => {
    if (!user?.id) return false;
    return localStorage.getItem(`nimart_password_set_${user.id}`) === 'true';
  });
  
  const [isSetupComplete, setIsSetupComplete] = useState(true);

  // Fetch provider data
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Get provider business info
      const { data: providerData } = await supabase
        .from('providers')
        .select('business_name, description')
        .eq('id', user.id)
        .single();
      if (providerData) {
        setBusinessName(providerData.business_name || '');
        setDescription(providerData.description || '');
      }

      // Get profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profileData) {
        setFullName(profileData.full_name || '');
        setPhone(profileData.phone || '');
        setStreetAddress(profileData.street_address || '');
        setLandmark(profileData.landmark || '');
        setAddressArea(profileData.address_area || '');
        setAvatarUrl(profileData.avatar_url);
        setCoverPhoto(profileData.cover_photo);
        setGender(profileData.gender || '');
        setAge(profileData.age ? String(profileData.age) : '');
        setEducation(profileData.education || '');
        setLanguages(profileData.languages || '');
      }

      // Check if setup is incomplete
      if (!providerData?.business_name || !profileData?.lga_id || !profileData?.street_address) {
        setIsSetupComplete(false);
      }

      setInitialDataLoaded(true);
    };
    fetchData();
  }, [user]);

  // --- Phone validation ---
  const validatePhoneNumber = (phoneNumber: string): boolean => {
    const localNumber = phoneNumber.replace('+234', '');
    const isValid = /^\d{10}$/.test(localNumber);
    if (!isValid) setPhoneError('Enter a valid 10-digit Nigerian phone number');
    else setPhoneError('');
    return isValid;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+234')) value = '+234' + value.replace(/\D/g, '');
    const digits = value.slice(4).replace(/\D/g, '').slice(0, 10);
    const finalValue = '+234' + digits;
    setPhone(finalValue);
    if (digits.length === 10) validatePhoneNumber(finalValue);
    else setPhoneError('');
  };

  // --- Avatar upload ---
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/avatar-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const newAvatarUrl = urlData.publicUrl;
      await updateProfile({ avatar_url: newAvatarUrl });
      setAvatarUrl(newAvatarUrl);
      toast.success('Profile picture uploaded');
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // --- Cover photo ---
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/cover-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const newCoverUrl = urlData.publicUrl;
      await updateProfile({ cover_photo: newCoverUrl });
      setCoverPhoto(newCoverUrl);
      toast.success('Cover photo updated');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploadingCover(false);
    }
  };

  // --- Final submit ---
  const handleFinalSubmit = async () => {
    if (!initialDataLoaded) {
      toast.error('Please wait, your profile is still loading.');
      return;
    }
    if (!avatarUrl) {
      toast.error('Please upload a profile picture before continuing.');
      return;
    }
    if (!passwordCompleted) {
      toast.error('Please set a password for your account.');
      return;
    }
    if (uploadingAvatar) {
      toast.error('Please wait for the profile picture to finish uploading.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ is_complete: true });
      await refreshProfile();
      toast.success('Profile completed! Redirecting to dashboard...');
      navigate('/provider/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!initialDataLoaded || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <NimartSpinner size="md" />
      </div>
    );
  }

  if (!isSetupComplete) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-yellow-700">You haven't completed the basic setup. Please finish it first.</p>
          <Link to="/provider/setup" className="mt-2 inline-block text-primary-600 underline">Go to Setup</Link>
        </div>
      </div>
    );
  }

  const showWarning = !avatarUrl || !passwordCompleted;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
      <p className="text-gray-600 mb-6">
        Please upload a profile picture and set a password to activate your account.
      </p>

      {showWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Action required</p>
            <ul className="text-sm text-amber-700 mt-1 list-disc list-inside">
              {!avatarUrl && <li>Upload a profile picture (mandatory)</li>}
              {!passwordCompleted && <li>Set a password for your account</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Business Information (read‑only) */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information (from setup)</h2>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label><input type="text" value={businessName} disabled className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label><input type="tel" value={phone} disabled className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" value={fullName} disabled className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label><input type="text" value={streetAddress} disabled className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Area / Neighbourhood</label><input type="text" value={addressArea} disabled className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Service Description</label><textarea value={description} disabled rows={2} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg" /></div>
        </div>
      </div>

      {/* Profile Picture */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture *</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-24 w-24 rounded-full object-cover border-2 border-primary-500" />
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-12 w-12 text-primary-600" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer">
              {uploadingAvatar ? <Loader2 className="h-5 w-5 text-primary-600 animate-spin" /> : <Camera className="h-5 w-5 text-gray-600" />}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
            </label>
          </div>
          <div>
            <p className="text-sm text-gray-600">{uploadingAvatar ? 'Uploading...' : 'Click the camera to upload your photo'}</p>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 2MB</p>
          </div>
        </div>
      </div>

      {/* Set Password */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Set a Password *</h2>
        <SetPasswordForm
          onSuccess={() => setPasswordCompleted(true)}
          initialCompleted={passwordCompleted}
          userId={user?.id}
        />
      </div>

      {/* Additional Information (optional) */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information (optional)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Gender</label><select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-3 py-2 border rounded-lg"><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Age</label><input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-3 py-2 border rounded-lg" min={16} max={100} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Education</label><input type="text" value={education} onChange={(e) => setEducation(e.target.value)} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Languages</label><input type="text" value={languages} onChange={(e) => setLanguages(e.target.value)} className="w-full px-3 py-2 border rounded-lg" /></div>
        </div>
      </div>

      {/* Cover Photo */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cover Photo (optional)</h2>
        <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
          {coverPhoto ? <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><Image className="h-8 w-8" /></div>}
          <label className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow cursor-pointer">
            {uploadingCover ? <Loader2 className="h-4 w-4 text-primary-600 animate-spin" /> : <Camera className="h-4 w-4 text-gray-600" />}
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingCover} />
          </label>
        </div>
      </div>

      {/* Final Button */}
      <div className="flex justify-end">
        <button
          onClick={handleFinalSubmit}
          disabled={saving || !avatarUrl || !passwordCompleted || uploadingAvatar || !initialDataLoaded}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</> : <><Save className="h-5 w-5" /> Complete & Go to Dashboard</>}
        </button>
      </div>
    </div>
  );
}