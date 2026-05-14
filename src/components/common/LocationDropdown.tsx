// src/components/common/LocationDropdown.tsx
import { useState } from 'react';
import { MapPin, X, ChevronRight } from 'lucide-react';

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
  preloadedStates: State[];
  preloadedLgas: Record<string, LGA[]>;
}

export function LocationDropdown({
  onSelectState,
  onSelectLga,
  onClear,
  onClose,
  preloadedStates,
  preloadedLgas,
}: LocationDropdownProps) {
  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [showLgas, setShowLgas] = useState(false);

  const handleStateClick = (stateId: string, stateName: string) => {
    setSelectedStateId(stateId);
    setShowLgas(true);
    // Do NOT call onSelectState here – we wait until the user picks an LGA
  };

  const handleLgaClick = (lgaId: string, lgaName: string) => {
    onSelectLga(lgaId, lgaName);
    onClose();
  };

  const handleBack = () => {
    setShowLgas(false);
    setSelectedStateId('');
  };

  const handleSelectEntireState = () => {
    const state = preloadedStates.find(s => s.state_id.toString() === selectedStateId);
    if (state) {
      onSelectState(selectedStateId, state.state_name);
      onClose();
    }
  };

  const handleSelectAllNigeria = () => {
    onClear();
    onClose();
  };

  const currentLgas = preloadedLgas[selectedStateId] || [];

  return (
    <div className="absolute right-0 mt-2 w-full sm:w-72 bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">
          {showLgas ? 'Select LGA' : 'Select Location'}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="max-h-60 overflow-y-auto">
        {!showLgas ? (
          // States list
          <div>
            {/* All Nigeria option */}
            <button
              onClick={handleSelectAllNigeria}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-green-50/80 transition-colors"
            >
              <MapPin className="h-4 w-4 text-primary-600" />
              <span className="font-medium text-gray-900">All Nigeria</span>
            </button>
            {preloadedStates.map((state) => (
              <button
                key={state.state_id}
                onClick={() => handleStateClick(state.state_id.toString(), state.state_name)}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50/80 transition-colors flex items-center justify-between"
              >
                {state.state_name}
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            ))}
          </div>
        ) : (
          // LGA list
          <div>
            <button
              onClick={handleBack}
              className="w-full text-left px-4 py-2.5 text-sm text-primary-600 hover:bg-green-50/80 font-medium flex items-center gap-1 border-b border-gray-100"
            >
              ← Back to States
            </button>
            <button
              onClick={handleSelectEntireState}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50/80 font-medium border-b border-gray-100"
            >
              Entire {preloadedStates.find(s => s.state_id.toString() === selectedStateId)?.state_name}
            </button>
            {currentLgas.length === 0 ? (
              <p className="px-4 py-4 text-sm text-gray-500">No LGAs found</p>
            ) : (
              currentLgas.map((lga) => (
                <button
                  key={lga.lga_id}
                  onClick={() => handleLgaClick(lga.lga_id.toString(), lga.lga_name)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50/80 transition-colors"
                >
                  {lga.lga_name}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}