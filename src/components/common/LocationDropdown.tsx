import { useState, useEffect, RefObject } from 'react';
import { createPortal } from 'react-dom';
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
  triggerRef?: RefObject<HTMLElement | null>;   // <-- changed to triggerRef (the button)
}

export function LocationDropdown({
  onSelectState,
  onSelectLga,
  onClear,
  onClose,
  preloadedStates,
  preloadedLgas,
  triggerRef,
}: LocationDropdownProps) {
  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [showLgas, setShowLgas] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Recalculate position whenever the dropdown opens
  useEffect(() => {
    if (preloadedStates.length === 0) return;

    const element = triggerRef?.current;
    if (element) {
      const box = element.getBoundingClientRect();
      setRect(box);
    }
  }, [preloadedStates, triggerRef]);

  const handleStateClick = (stateId: string, stateName: string) => {
    setSelectedStateId(stateId);
    setShowLgas(true);
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

  if (!rect) return null;  // wait for position

  const top = rect.bottom + window.scrollY + 6;
  const left = rect.left + window.scrollX;
  const buttonWidth = rect.width;

  const dropdown = (
    <div
      className="fixed bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-full sm:w-72"
      style={{
        top,
        left,
        // On mobile use full button width, on desktop let w-72 class override but keep left aligned
        width: window.innerWidth < 640 ? buttonWidth : undefined,
      }}
    >
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
          <div>
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

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      {/* Portal */}
      {createPortal(dropdown, document.body)}
    </>
  );
}