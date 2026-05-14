// src/pages/provider/Profile.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { SetPasswordForm } from '../../components/profile/SetPasswordForm';
import toast from 'react-hot-toast';
import { User, Phone, Store, FileText, Save, Camera, AlertCircle, Home, Landmark, Image, Languages, GraduationCap, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DraggableMap } from '../../components/common/DraggableMap';

export default function ProviderProfile() {
  const { user, profile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [addressArea, setAddressArea] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(true);
  const [phoneError, setPhoneError] = useState('');

  // New fields
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [education, setEducation] = useState('');
  const [languages, setLanguages] = useState('');

  // Map coordinates
  const [mapLat, setMapLat] = useState<number>(9.0556);
  const [mapLng, setMapLng] = useState<number>(7.4914);
  const [mapCenterLat, setMapCenterLat] = useState<number>(9.0556);
  const [mapCenterLng, setMapCenterLng] = useState<number>(7.4914);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setStreetAddress(profile.street_address || '');
      setLandmark(profile.landmark || '');
      setAvatarUrl(profile.avatar_url);
      setAddressArea(profile.address_area || '');
      setCoverPhoto(profile.cover_photo || null);
      setGender(profile.gender || '');
      setAge(profile.age ? String(profile.age) : '');
      setEducation(profile.education || '');
      setLanguages(profile.languages || '');
      if (profile.lat && profile.lng) {
        setMapLat(profile.lat);
        setMapLng(profile.lng);
        setMapCenterLat(profile.lat);
        setMapCenterLng(profile.lng);
      }
    }
    fetchProviderData();
  }, [profile]);

  async function fetchProviderData() {
    if (!user) return;
    const { data: provider } = await supabase
      .from('providers')
      .select('business_name, description')
      .eq('id', user.id)
      .single();
    if (provider) {
      setBusinessName(provider.business_name || '');
      setDescription(provider.description || '');
    }
    const { data: profileData } = await supabase
      .from('profiles')
      .select('lga_id, street_address, address_area')
      .eq('id', user.id)
      .single();
    if (!provider?.business_name || !profileData?.lga_id || !profileData?.street_address || !profileData?.address_area) {
      setIsSetupComplete(false);
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/${user!.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const newAvatarUrl = urlData.publicUrl;
      await updateProfile({ avatar_url: newAvatarUrl });
      setAvatarUrl(newAvatarUrl);
      toast.success('Profile picture updated');
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/cover-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const newCoverUrl = urlData.publicUrl;
      await updateProfile({ cover_photo: newCoverUrl });
      setCoverPhoto(newCoverUrl);
      toast.success('Cover photo updated');
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const validatePhoneNumber = (phoneNumber: string): boolean => {
    const localNumber = phoneNumber.replace('+234', '');
    const isValid = /^\d{10}$/.test(localNumber);
    if (!isValid) { setPhoneError('Please enter a valid 10-digit Nigerian phone number'); return false; }
    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+234')) value = '+234' + value.replace(/[^0-9]/g, '');
    const prefix = '+234';
    const digits = value.slice(4).replace(/\D/g, '').slice(0, 10);
    const finalValue = prefix + digits;
    setPhone(finalValue);
    if (digits.length === 10) validatePhoneNumber(finalValue);
    else setPhoneError('');
  };

  const handleMarkerDrag = (lat: number, lng: number) => {
    setMapLat(lat);
    setMapLng(lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone && !validatePhoneNumber(phone)) return;
    if (!streetAddress.trim() || !addressArea.trim()) {
      toast.error('Street address and area/neighbourhood are required');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        phone,
        street_address: streetAddress,
        landmark: landmark || null,
        address_area: addressArea,
        lat: mapLat,
        lng: mapLng,
        gender: gender || null,
        age: age ? parseInt(age) : null,
        education: education || null,
        languages: languages || null,
      });
      const { error: providerError } = await supabase
        .from('providers')
        .update({ business_name: businessName, description })
        .eq('id', user!.id);
      if (providerError) throw providerError;
      toast.success('Profile updated');
      fetchProviderData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Provider Profile</h1>

      {!isSetupComplete && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-700">Your profile setup is incomplete. You won't appear in customer searches until you complete it.</p>
              <Link to="/provider/setup" className="mt-2 inline-block text-sm font-medium text-primary-600 hover:underline">Complete Setup →</Link>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cover photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Photo</label>
            <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
              {coverPhoto ? (
                <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Image className="h-8 w-8" />
                </div>
              )}
              <label className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow cursor-pointer">
                <Camera className="h-4 w-4 text-gray-600" />
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center"><User className="h-8 w-8 text-primary-600" /></div>
              )}
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer">
                <Camera className="h-4 w-4 text-gray-600" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
              </label>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{fullName || 'Your Name'}</p>
              <p className="text-xs text-gray-500">{uploading ? 'Uploading...' : 'Click the camera to change'}</p>
            </div>
          </div>

          {/* Full name / phone / address / area / map (same as before) */}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="tel" value={phone} onChange={handlePhoneChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="+234 123 456 7890" maxLength={14} /></div>{phoneError && <p className="mt-1 text-xs text-red-600">{phoneError}</p>}</div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1"><Home className="inline h-4 w-4 mr-1" />Street Address *</label><input type="text" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g., 15 Adeola Odeku Street" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1"><Landmark className="inline h-4 w-4 mr-1" />Nearest Landmark (optional)</label><input type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g., Near First Bank" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Area / Neighbourhood *</label><input type="text" value={addressArea} onChange={(e) => setAddressArea(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g., Wuse 2, Gwarinpa" /></div>

          {/* Map */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Exact Location (Drag the pin) *</label>
            <DraggableMap centerLat={mapCenterLat} centerLng={mapCenterLng} markerLat={mapLat} markerLng={mapLng} onMarkerDrag={handleMarkerDrag} height="280px" />
            <p className="text-xs text-gray-500 mt-1">Your exact coordinates are saved. This improves distance accuracy for customers.</p>
          </div>

          {/* New personal fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="25" min={16} max={100} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Highest Education</label>
              <input type="text" value={education} onChange={(e) => setEducation(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g., BSc Computer Science" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
              <input type="text" value={languages} onChange={(e) => setLanguages(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g., English, Yoruba" />
            </div>
          </div>

          {/* Business info */}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label><div className="relative"><Store className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Your business name" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><div className="relative"><FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" /><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Describe your services..." /></div></div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <SetPasswordForm />
      </div>
    </div>
  );
}