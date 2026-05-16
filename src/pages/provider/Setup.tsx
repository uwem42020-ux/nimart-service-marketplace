// src/pages/provider/Setup.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import {
  MapPin,
  Store,
  ChevronDown,
  Save,
  AlertCircle,
  Home,
  Landmark,
  Phone,
  Loader2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { TIERS, getCategoriesByTier, getSubcategoriesByCategory } from '../../data/categories';
import { LocationPickerModal } from '../../components/provider/LocationPickerModal';
import type { Category, Subcategory } from '../../data/categories';

interface State {
  state_id: number;
  state_name: string;
}

interface LGA {
  lga_id: number;
  lga_name: string;
  lat: number | null;
  lng: number | null;
}

export default function ProviderSetup() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Location picker modal
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Location from map (auto-detected)
  const [selectedLgaId, setSelectedLgaId] = useState<string>('');
  const [selectedLgaName, setSelectedLgaName] = useState<string>('');
  const [selectedStateName, setSelectedStateName] = useState<string>('');
  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [mapLat, setMapLat] = useState<number>(9.0556);
  const [mapLng, setMapLng] = useState<number>(7.4914);
  const [detectedArea, setDetectedArea] = useState<string>('');      // from map (read-only)
  const [hasLocation, setHasLocation] = useState<boolean>(false);

  // Manual address fields
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');

  // Business info
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');

  // Phone
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Category
  const [selectedTier, setSelectedTier] = useState('automotive');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');

  // Terms
  const [termsAccepted, setTermsAccepted] = useState(false);

  // States and LGAs for dropdowns (only used to map state_id from name)
  const [states, setStates] = useState<State[]>([]);
  const [lgas, setLgas] = useState<LGA[]>([]);

  // Fetch states on mount
  useEffect(() => {
    async function fetchStates() {
      const { data } = await supabase
        .from('lga_centers')
        .select('state_id, state_name')
        .order('state_name');
      const unique = data?.filter((v,i,a)=>a.findIndex(t=>t.state_id===v.state_id)===i) || [];
      setStates(unique);
    }
    fetchStates();
  }, []);

  // When LGA changes, load its coordinates (for fallback)
  useEffect(() => {
    if (!selectedLgaId) return;
    const lga = lgas.find(l => l.lga_id.toString() === selectedLgaId);
    if (lga?.lat && lga?.lng && !hasLocation) {
      setMapLat(lga.lat);
      setMapLng(lga.lng);
    }
  }, [selectedLgaId, lgas, hasLocation]);

  // Fetch categories when tier changes
  useEffect(() => {
    setCategories(getCategoriesByTier(selectedTier));
    setSelectedCategory('');
    setSubcategories([]);
    setSelectedSubcategoryId('');
  }, [selectedTier]);

  useEffect(() => {
    if (selectedCategory) {
      setSubcategories(getSubcategoriesByCategory(selectedCategory));
      setSelectedSubcategoryId('');
    }
  }, [selectedCategory]);

  // Pre-fill existing data (if any)
  useEffect(() => {
    if (!user) return;

    async function fetchExisting() {
      const { data: provider } = await supabase
        .from('providers')
        .select('business_name, description, selected_tier_slug, selected_category_slug, selected_subcategory_id')
        .eq('id', user.id)
        .single();
      if (provider) {
        setBusinessName(provider.business_name || '');
        setDescription(provider.description || '');
        if (provider.selected_tier_slug) setSelectedTier(provider.selected_tier_slug);
        if (provider.selected_category_slug) setSelectedCategory(provider.selected_category_slug);
        if (provider.selected_subcategory_id) setSelectedSubcategoryId(provider.selected_subcategory_id.toString());
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('lga_id, lga_name, street_address, landmark, phone, address_area, lat, lng')
        .eq('id', user.id)
        .single();
      if (profileData) {
        if (profileData.lga_id) {
          setSelectedLgaId(profileData.lga_id.toString());
          setSelectedLgaName(profileData.lga_name || '');
          // Also get state name from lga_centers
          const { data: lgaInfo } = await supabase
            .from('lga_centers')
            .select('state_name')
            .eq('lga_id', profileData.lga_id)
            .single();
          if (lgaInfo) setSelectedStateName(lgaInfo.state_name);
        }
        setStreetAddress(profileData.street_address || '');
        setLandmark(profileData.landmark || '');
        if (profileData.phone) setPhoneNumber(profileData.phone);
        setDetectedArea(profileData.address_area || '');
        if (profileData.lat && profileData.lng) {
          setMapLat(profileData.lat);
          setMapLng(profileData.lng);
          setHasLocation(true);
        }
      }
      setInitialLoading(false);
    }
    fetchExisting();
  }, [user]);

  // Phone validation
  const validatePhoneNumber = (phone: string): boolean => {
    const local = phone.replace('+234', '');
    const ok = /^\d{10}$/.test(local);
    setPhoneError(ok ? '' : 'Enter valid 10-digit Nigerian phone number');
    return ok;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+234')) val = '+234' + val.replace(/\D/g, '');
    const digits = val.slice(4).replace(/\D/g, '').slice(0, 10);
    const final = '+234' + digits;
    setPhoneNumber(final);
    if (digits.length === 10) validatePhoneNumber(final);
    else setPhoneError('');
  };

  // Final submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!businessName.trim()) { toast.error('Business name required'); return; }
    if (!validatePhoneNumber(phoneNumber)) return;
    if (!selectedLgaId) { toast.error('Please set your location on the map'); return; }
    if (!streetAddress.trim()) { toast.error('Street address required'); return; }
    if (!hasLocation) { toast.error('Please confirm your exact location on the map'); return; }
    if (!selectedTier || !selectedCategory || !selectedSubcategoryId) {
      toast.error('Complete service category selection');
      return;
    }
    if (!termsAccepted) { toast.error('Accept Terms of Service and Cookie Policy'); return; }

    setLoading(true);
    try {
      // Call the atomic RPC (make sure it accepts address_area)
      const { data, error } = await supabase.rpc('complete_provider_setup', {
        p_user_id: user!.id,
        p_business_name: businessName,
        p_phone: phoneNumber,
        p_street_address: streetAddress,
        p_address_area: detectedArea,          // 👈 area from map
        p_landmark: landmark || null,
        p_lga_id: parseInt(selectedLgaId),
        p_lat: mapLat,
        p_lng: mapLng,
        p_description: description || null,
        p_selected_tier_slug: selectedTier,
        p_selected_category_slug: selectedCategory,
        p_selected_subcategory_id: parseInt(selectedSubcategoryId),
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      await refreshProfile();
      toast.success('Profile setup complete! Please upload a profile picture and set a password.');
      navigate('/provider/profile');
    } catch (err: any) {
      setSubmitError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Provider Profile</h1>
      <p className="text-gray-600 mb-2">Help customers find and trust you.</p>
      <p className="text-sm text-amber-600 mb-6 flex items-start gap-1">
        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span>Your full name must match your official ID for verification.</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ===== LOCATION SECTION ===== */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary-600" />
            Service Location
          </h2>

          {/* Map picker button */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowLocationPicker(true)}
              className="w-full p-3 border-2 border-dashed border-primary-300 rounded-lg bg-primary-50 hover:bg-primary-100 transition flex items-center justify-center gap-2"
            >
              <MapPin className="h-5 w-5 text-primary-600" />
              <span className="text-primary-700 font-medium">
                {hasLocation ? 'Change Location on Map' : 'Click to set your exact location on the map'}
              </span>
            </button>
            {hasLocation && (
              <div className="mt-3 text-sm text-gray-700 space-y-1">
                <p>📍 LGA: {selectedLgaName}, {selectedStateName}</p>
                <p>🏘️ Area: {detectedArea || 'Detecting...'}</p>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Open the map, drag the pin to your exact workshop/office, then confirm. The system will detect your LGA, state, and local area.
            </p>
          </div>

          {/* Manual street address */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Home className="inline h-4 w-4 mr-1" />
              Street Address (House number & street) *
            </label>
            <input
              type="text"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., 15 Adeola Odeku Street"
            />
          </div>

          {/* Landmark (optional) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Landmark className="inline h-4 w-4 mr-1" />
              Nearest Landmark (optional)
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., Near First Bank"
            />
          </div>
        </div>

        {/* ===== CONTACT ===== */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Phone className="h-5 w-5 mr-2 text-primary-600" />
            Contact Information
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="+234 123 456 7890"
              maxLength={14}
            />
            {phoneError && <p className="mt-1 text-xs text-red-600">{phoneError}</p>}
            <p className="mt-1 text-xs text-gray-500">10‑digit Nigerian number</p>
          </div>
        </div>

        {/* ===== BUSINESS INFO ===== */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Store className="h-5 w-5 mr-2 text-primary-600" />
            Business Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Ade's Auto Repair"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Describe your services..."
              />
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Tier *</label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                {TIERS.map(tier => <option key={tier.slug} value={tier.slug}>{tier.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                disabled={categories.length === 0}
              >
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat.slug} value={cat.slug}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory *</label>
              <select
                value={selectedSubcategoryId}
                onChange={(e) => setSelectedSubcategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                disabled={subcategories.length === 0}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ===== TERMS ===== */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 text-primary-600 rounded"
            />
            <span className="text-sm text-gray-700">
              I agree to the{' '}
              <Link to="/terms" target="_blank" className="text-primary-600 hover:underline">Terms of Service</Link>{' '}
              and{' '}
              <Link to="/cookies" target="_blank" className="text-primary-600 hover:underline">Cookie Policy</Link>{' '}
              *
            </span>
          </label>
        </div>

        {/* Error & Retry */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{submitError}</p>
            <button type="button" onClick={handleSubmit} className="mt-2 text-red-600 underline">Retry</button>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !hasLocation || !termsAccepted}
            className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Setting up...</> : <><Save className="h-5 w-5" /> Complete Setup</>}
          </button>
        </div>
      </form>

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelected={(data) => {
          setSelectedLgaId(data.lgaId.toString());
          setSelectedLgaName(data.lgaName);
          setSelectedStateName(data.stateName);
          setMapLat(data.lat);
          setMapLng(data.lng);
          setDetectedArea(data.area);
          setHasLocation(true);
          toast.success(`Location set to ${data.lgaName}, ${data.stateName}${data.area ? `, ${data.area}` : ''}`);
          // Optionally, we could auto‑fill state_id by matching state_name
          const stateMatch = states.find(s => s.state_name === data.stateName);
          if (stateMatch) setSelectedStateId(stateMatch.state_id.toString());
          // Also fetch LGAs for that state if needed (optional)
        }}
        currentLat={mapLat}
        currentLng={mapLng}
      />
    </div>
  );
}