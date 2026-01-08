import { supabase } from './supabase';

export interface NigerianState {
  id: string;
  name: string;
}

export interface LGA {
  id: string;
  name: string;
  state_id: string;
}

// Cache states to avoid repeated database calls
let statesCache: NigerianState[] | null = null;
let statesCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getStates(): Promise<NigerianState[]> {
  // Return cached states if available and not expired
  if (statesCache && Date.now() - statesCacheTime < CACHE_DURATION) {
    return statesCache;
  }

  try {
    const { data, error } = await supabase
      .from('states')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching states from database:', error);
      statesCache = getHardcodedStates();
      statesCacheTime = Date.now();
      return statesCache;
    }
    
    console.log('Database states loaded:', data?.length);
    statesCache = data || getHardcodedStates();
    statesCacheTime = Date.now();
    return statesCache;
  } catch (error) {
    console.error('Error in getStates:', error);
    statesCache = getHardcodedStates();
    statesCacheTime = Date.now();
    return statesCache;
  }
}

// Get state by ID (handles both UUID and name)
export async function getStateById(stateId: string): Promise<NigerianState | null> {
  try {
    // Check if it's a UUID format
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(stateId);
    
    if (isUUID) {
      const { data, error } = await supabase
        .from('states')
        .select('id, name')
        .eq('id', stateId)
        .single();
      
      if (!error && data) return data;
    }
    
    // Try by name as fallback
    const { data, error } = await supabase
      .from('states')
      .select('id, name')
      .eq('name', stateId)
      .single();
    
    if (!error && data) return data;
    
    return null;
  } catch (error) {
    console.error('Error getting state by ID:', error);
    return null;
  }
}

function getHardcodedStates(): NigerianState[] {
  return [
    { id: 'c00bcd88-631e-475d-84f8-a0be469469c6', name: 'Lagos' },
    { id: 'bff6f1a8-53b7-490a-b7f5-a6a54d7196f5', name: 'FCT' },
    { id: '362dee97-55e8-434c-bccb-6f12d0312adc', name: 'Rivers' },
    { id: 'lagos', name: 'Lagos' },
    { id: 'fct', name: 'FCT' },
    { id: 'rivers', name: 'Rivers' },
    { id: 'oyo', name: 'Oyo' },
    { id: 'kano', name: 'Kano' },
    { id: 'kaduna', name: 'Kaduna' },
    { id: 'edo', name: 'Edo' },
    { id: 'delta', name: 'Delta' },
    { id: 'ogun', name: 'Ogun' },
    { id: 'ondo', name: 'Ondo' },
    { id: 'enugu', name: 'Enugu' },
    { id: 'abia', name: 'Abia' },
    { id: 'adamawa', name: 'Adamawa' },
    { id: 'akwa-ibom', name: 'Akwa Ibom' },
    { id: 'anambra', name: 'Anambra' },
    { id: 'bauchi', name: 'Bauchi' },
    { id: 'bayelsa', name: 'Bayelsa' },
    { id: 'benue', name: 'Benue' },
    { id: 'borno', name: 'Borno' },
    { id: 'cross-river', name: 'Cross River' },
    { id: 'ebonyi', name: 'Ebonyi' },
    { id: 'ekiti', name: 'Ekiti' },
    { id: 'gombe', name: 'Gombe' },
    { id: 'imo', name: 'Imo' },
    { id: 'jigawa', name: 'Jigawa' },
    { id: 'katsina', name: 'Katsina' },
    { id: 'kebbi', name: 'Kebbi' },
    { id: 'kogi', name: 'Kogi' },
    { id: 'kwara', name: 'Kwara' },
    { id: 'nasarawa', name: 'Nasarawa' },
    { id: 'niger', name: 'Niger' },
    { id: 'osun', name: 'Osun' },
    { id: 'plateau', name: 'Plateau' },
    { id: 'sokoto', name: 'Sokoto' },
    { id: 'taraba', name: 'Taraba' },
    { id: 'yobe', name: 'Yobe' },
    { id: 'zamfara', name: 'Zamfara' },
  ];
}

export async function getLGAs(stateId: string): Promise<LGA[]> {
  try {
    // First, get the actual state ID if a name was passed
    const state = await getStateById(stateId);
    const actualStateId = state?.id || stateId;

    const { data, error } = await supabase
      .from('lgas')
      .select('id, name, state_id')
      .eq('state_id', actualStateId)
      .order('name');
    
    if (error) {
      console.error('Error fetching LGAs from database:', error);
      return getHardcodedLGAs(actualStateId);
    }
    
    console.log(`Database LGAs loaded for state ${actualStateId}:`, data?.length);
    return data || getHardcodedLGAs(actualStateId);
  } catch (error) {
    console.error('Error in getLGAs:', error);
    return getHardcodedLGAs(stateId);
  }
}

function getHardcodedLGAs(stateId: string): LGA[] {
  // Handle both UUID and text IDs
  if (stateId === 'c00bcd88-631e-475d-84f8-a0be469469c6' || stateId === 'lagos') {
    return [
      { id: '20375eaa-d619-40a2-97f4-ccf2d5ff3c9c', name: 'Ikeja', state_id: stateId },
      { id: 'a84b2d8d-f11a-4aa5-a4bf-f0083821077c', name: 'Lagos Island', state_id: stateId },
      { id: 'ea480b9e-61be-4814-8188-2f3b08dbe95d', name: 'Lagos Mainland', state_id: stateId },
      { id: '2a817eb0-ae17-4d2f-bb2f-b865a161e5fa', name: 'Surulere', state_id: stateId },
    ];
  } else if (stateId === 'bff6f1a8-53b7-490a-b7f5-a6a54d7196f5' || stateId === 'fct') {
    return [
      { id: '5d785eec-a788-4a4e-947f-79e46675dc3e', name: 'Abuja Municipal', state_id: stateId },
      { id: '1921ff2c-4d17-4843-b23a-5c696b32d0d9', name: 'Bwari', state_id: stateId },
      { id: 'b7401316-c2cd-4be8-bbbb-b48e24383392', name: 'Gwagwalada', state_id: stateId },
    ];
  }
  return [];
}

// Helper function to get state name by ID
export async function getStateName(stateId: string): Promise<string> {
  try {
    const state = await getStateById(stateId);
    return state?.name || 'Nigeria';
  } catch (error) {
    console.error('Error getting state name:', error);
    return 'Nigeria';
  }
}

// Helper function to get LGA name by ID
export async function getLGAName(lgaId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('lgas')
      .select('name')
      .eq('id', lgaId)
      .single();
    
    if (!error && data) {
      return data.name;
    }
    
    return 'Local Area';
  } catch (error) {
    console.error('Error getting LGA name:', error);
    return 'Local Area';
  }
}