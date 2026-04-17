// src/components/common/LocationDropdown.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MapPin, X } from 'lucide-react';

interface State {
  state_id: number;
  state_name: string;
}

interface LGA {
  lga_id: number;
  lga_name: string;
}

interface LocationDropdownProps {
  onSelectState: (stateId: string, stateName: string) => void;
  onSelectLga: (lgaId: string, lgaName: string) => void;
  onClear: () => void;
  onClose: () => void;
  preloadedStates?: State[];
}

export function LocationDropdown({
  onSelectState,
  onSelectLga,
  onClear,
  onClose,
  preloadedStates,
}: LocationDropdownProps) {
  const [states, setStates] = useState<State[]>(preloadedStates || []);
  const [lgas, setLgas] = useState<LGA[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [view, setView] = useState<'states' | 'lgas'>('states');

  useEffect(() => {
    if (!preloadedStates) {
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
    }
  }, [preloadedStates]);

  useEffect(() => {
    if (!selectedState) {
      setLgas([]);
      return;
    }
    async function fetchLgas() {
      const { data } = await supabase
        .from('lga_centers')
        .select('lga_id, lga_name')
        .eq('state_id', parseInt(selectedState))
        .order('lga_name');
      setLgas(data || []);
    }
    fetchLgas();
  }, [selectedState]);

  const handleStateClick = (stateId: string, stateName: string) => {
    setSelectedState(stateId);
    setView('lgas');
  };

  const handleLgaClick = (lgaId: string, lgaName: string) => {
    onSelectLga(lgaId, lgaName);
  };

  const handleBack = () => {
    setView('states');
    setSelectedState('');
  };

  const handleSelectAllNigeria = () => {
    onClear();
  };

  const handleSelectEntireState = () => {
    const state = states.find(s => s.state_id.toString() === selectedState);
    if (state) {
      onSelectState(selectedState, state.state_name);
    }
  };

  return (
    <div className="absolute top-full left-0 right-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
      <div className="p-2">
        <div className="flex items-center justify-between border-b pb-2 mb-2">
          <h3 className="font-medium text-gray-900">
            {view === 'states' ? 'Select Location' : 'Select LGA'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {view === 'states' ? (
          <>
            <button
              onClick={handleSelectAllNigeria}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md"
            >
              <MapPin className="h-4 w-4 text-primary-600" />
              <span className="font-medium text-gray-900">All Nigeria 🇳🇬</span>
            </button>
            <div className="max-h-64 overflow-y-auto mt-1">
              {states.map((state) => (
                <button
                  key={state.state_id}
                  onClick={() => handleStateClick(state.state_id.toString(), state.state_name)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 rounded-md"
                >
                  <span className="text-gray-900">{state.state_name}</span>
                  <span className="text-xs text-gray-400">→</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={handleBack}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-primary-600 hover:bg-gray-50 rounded-md mb-1"
            >
              ← Back to states
            </button>
            <button
              onClick={handleSelectEntireState}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 rounded-md font-medium text-gray-900"
            >
              Entire {states.find(s => s.state_id.toString() === selectedState)?.state_name}
            </button>
            <div className="max-h-64 overflow-y-auto mt-1">
              {lgas.map((lga) => (
                <button
                  key={lga.lga_id}
                  onClick={() => handleLgaClick(lga.lga_id.toString(), lga.lga_name)}
                  className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 rounded-md text-gray-900"
                >
                  {lga.lga_name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}