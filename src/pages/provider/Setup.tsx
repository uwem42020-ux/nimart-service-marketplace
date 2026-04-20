// src/pages/provider/Setup.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { MapPin, Store, ChevronDown, Save, AlertCircle, Home, Landmark, Phone } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TIERS, getCategoriesByTier, getSubcategoriesByCategory } from '../../data/categories';
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

  // Location states
  const [states, setStates] = useState<State[]>([]);
  const [lgas, setLgas] = useState<LGA[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedLga, setSelectedLga] = useState<string>('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showLgaDropdown, setShowLgaDropdown] = useState(false);

  // Address states
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');

  // Business states
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');

  // Phone validation
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Category states
  const [selectedTier, setSelectedTier] = useState('automotive');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');

  // Terms acceptance
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Fetch all states on mount
  useEffect(() => {
    async function fetchStates() {
      const { data } = await supabase
        .from('lga_centers')
        .select('state_id, state_name')
        .order('state_name');
      
      const uniqueStates = data?.filter((v, i, a) => 
        a.findIndex(t => t.state_id === v.state_id) === i
      ) || [];
      setStates(uniqueStates);
    }
    fetchStates();
  }, []);

  // Fetch LGAs when state changes
  useEffect(() => {
    if (!selectedState) {
      setLgas([]);
      return;
    }
    async function fetchLgas() {
      const { data } = await supabase
        .from('lga_centers')
        .select('lga_id, lga_name, lat, lng')
        .eq('state_id', parseInt(selectedState))
        .order('lga_name');
      setLgas(data || []);
    }
    fetchLgas();
  }, [selectedState]);

  // Load categories when tier changes
  useEffect(() => {
    setCategories(getCategoriesByTier(selectedTier));
    setSelectedCategory('');
    setSubcategories([]);
    setSelectedSubcategoryId('');
  }, [selectedTier]);

  // Load subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      setSubcategories(getSubcategoriesByCategory(selectedCategory));
      setSelectedSubcategoryId('');
    }
  }, [selectedCategory]);

  // Pre-fill existing data if any
  useEffect(() => {
    async function fetchExistingProvider() {
      if (!user) return;

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
        .select('lga_id, street_address, landmark, phone')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        if (profileData.lga_id) {
          const { data: lgaData } = await supabase
            .from('lga_centers')
            .select('state_id')
            .eq('lga_id', profileData.lga_id)
            .single();
          
          if (lgaData) {
            setSelectedState(lgaData.state_id.toString());
            setSelectedLga(profileData.lga_id.toString());
          }
        }
        setStreetAddress(profileData.street_address || '');
        setLandmark(profileData.landmark || '');
        if (profileData.phone) {
          // If phone exists and starts with +234, just display it
          setPhoneNumber(profileData.phone);
        }
      }

      setInitialLoading(false);
    }
    fetchExistingProvider();
  }, [user]);

  const validatePhoneNumber = (phone: string): boolean => {
    // Remove +234 prefix for validation
    const localNumber = phone.replace('+234', '');
    
    // Check if it's exactly 10 digits and all numbers
    const isValid = /^\d{10}$/.test(localNumber);
    
    if (!isValid) {
      setPhoneError('Please enter a valid 10-digit Nigerian phone number');
      return false;
    }
    
    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Ensure it starts with +234
    if (!value.startsWith('+234')) {
      value = '+234' + value.replace(/[^0-9]/g, '');
    }
    
    // Remove any non-digit characters after +234
    const prefix = '+234';
    const digits = value.slice(4).replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedDigits = digits.slice(0, 10);
    
    const finalValue = prefix + limitedDigits;
    setPhoneNumber(finalValue);
    
    if (limitedDigits.length === 10) {
      validatePhoneNumber(finalValue);
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLga) {
      toast.error('Please select your LGA');
      return;
    }
    if (!streetAddress.trim()) {
      toast.error('Street address is required');
      return;
    }
    if (!businessName.trim()) {
      toast.error('Business name is required');
      return;
    }
    if (!phoneNumber || phoneNumber.length !== 14) {
      toast.error('Please enter a valid phone number');
      return;
    }
    if (!validatePhoneNumber(phoneNumber)) {
      return;
    }
    if (!selectedTier) {
      toast.error('Please select a service tier');
      return;
    }
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }
    if (!selectedSubcategoryId) {
      toast.error('Please select a subcategory');
      return;
    }
    if (!termsAccepted) {
      toast.error('You must accept the Terms of Service and Cookie Policy');
      return;
    }

    setLoading(true);
    try {
      const selectedLgaData = lgas.find(l => l.lga_id.toString() === selectedLga);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          lga_id: parseInt(selectedLga),
          lga_name: selectedLgaData?.lga_name,
          lat: selectedLgaData?.lat,
          lng: selectedLgaData?.lng,
          street_address: streetAddress,
          landmark: landmark || null,
          phone: phoneNumber,
          is_complete: true,
        })
        .eq('id', user!.id);

      if (profileError) throw profileError;

      const { error: providerError } = await supabase
        .from('providers')
        .update({
          business_name: businessName,
          description,
          selected_tier_slug: selectedTier,
          selected_category_slug: selectedCategory,
          selected_subcategory_id: parseInt(selectedSubcategoryId),
        })
        .eq('id', user!.id);

      if (providerError) throw providerError;

      await refreshProfile();
      
      toast.success('Profile setup complete! You are now visible to customers.');
      navigate('/provider/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const isAlreadyComplete = profile?.is_complete && profile?.lga_id && businessName;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Provider Profile</h1>
      <p className="text-gray-600 mb-2">This information helps customers find and trust you.</p>
      <p className="text-sm text-amber-600 mb-6 flex items-start gap-1">
        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <span>Your full name and address must match your official ID document for verification purposes.</span>
      </p>

      {isAlreadyComplete && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-green-700">
                Your profile is already complete. You can update your information below.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Location Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary-600" />
            Service Location
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* State Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <button
                type="button"
                onClick={() => setShowStateDropdown(!showStateDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <span className={cn(!selectedState && "text-gray-400")}>
                  {selectedState ? states.find(s => s.state_id.toString() === selectedState)?.state_name : 'Select your state'}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              {showStateDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {states.map((state) => (
                    <button
                      key={state.state_id}
                      type="button"
                      onClick={() => {
                        setSelectedState(state.state_id.toString());
                        setSelectedLga('');
                        setShowStateDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      {state.state_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* LGA Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">LGA *</label>
              <button
                type="button"
                onClick={() => setShowLgaDropdown(!showLgaDropdown)}
                disabled={!selectedState}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <span className={cn(!selectedLga && "text-gray-400")}>
                  {selectedLga ? lgas.find(l => l.lga_id.toString() === selectedLga)?.lga_name : 'Select your LGA'}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              {showLgaDropdown && selectedState && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {lgas.map((lga) => (
                    <button
                      key={lga.lga_id}
                      type="button"
                      onClick={() => {
                        setSelectedLga(lga.lga_id.toString());
                        setShowLgaDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      {lga.lga_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Street Address */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Home className="inline h-4 w-4 mr-1" />
              Street Address *
            </label>
            <input
              type="text"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., 15 Adeola Odeku Street"
            />
          </div>

          {/* Landmark */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Landmark className="inline h-4 w-4 mr-1" />
              Nearest Landmark (optional)
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Near First Bank, opposite GTBank"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Your location helps customers find you. Coordinates are automatically set from LGA.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Phone className="h-5 w-5 mr-2 text-primary-600" />
            Contact Information
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="+234 123 456 7890"
              maxLength={14}
            />
            {phoneError && (
              <p className="mt-1 text-xs text-red-600">{phoneError}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter your 10-digit Nigerian phone number
            </p>
          </div>
        </div>

        {/* Business Details */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Store className="h-5 w-5 mr-2 text-primary-600" />
            Business Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Ade's Auto Repair"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Describe your services, experience, and what makes you unique..."
              />
            </div>

            {/* Tier Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Tier *
              </label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                {TIERS.map((tier) => (
                  <option key={tier.slug} value={tier.slug}>{tier.name}</option>
                ))}
              </select>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                disabled={categories.length === 0}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Subcategory Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory *
              </label>
              <select
                value={selectedSubcategoryId}
                onChange={(e) => setSelectedSubcategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                disabled={subcategories.length === 0}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Terms Acceptance */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">
              I agree to the{' '}
              <Link to="/terms" target="_blank" className="text-primary-600 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/cookies" target="_blank" className="text-primary-600 hover:underline">Cookie Policy</Link>
              {' '}*
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="h-5 w-5" />
            {loading ? 'Saving...' : 'Complete Setup'}
          </button>
        </div>
      </form>
    </div>
  );
}