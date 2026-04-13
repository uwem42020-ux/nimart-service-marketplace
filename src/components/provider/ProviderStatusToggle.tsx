import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

interface ProviderStatusToggleProps {
  providerId: string;
  initialStatus: 'available' | 'busy' | 'away';
  onStatusChange?: (newStatus: string) => void;
}

const statusConfig = {
  available: { label: 'Available', color: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-100' },
  busy: { label: 'Busy', color: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-100' },
  away: { label: 'Away', color: 'bg-gray-400', text: 'text-gray-700', bg: 'bg-gray-100' },
};

export function ProviderStatusToggle({ providerId, initialStatus, onStatusChange }: ProviderStatusToggleProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const updateStatus = async (newStatus: 'available' | 'busy' | 'away') => {
    if (newStatus === status) {
      setShowDropdown(false);
      return;
    }
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('providers')
        .update({ status: newStatus, is_available: newStatus === 'available' })
        .eq('id', providerId);

      if (error) throw error;
      
      setStatus(newStatus);
      onStatusChange?.(newStatus);
      toast.success(`Status changed to ${newStatus}`);
    } catch (error: any) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
      setShowDropdown(false);
    }
  };

  const currentConfig = statusConfig[status];

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isUpdating}
        className={cn(
          "flex items-center space-x-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors",
          currentConfig.bg,
          currentConfig.text,
          "border-transparent",
          isUpdating && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className={cn("h-2.5 w-2.5 rounded-full", currentConfig.color)} />
        <span>{currentConfig.label}</span>
        <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-10">
          {Object.entries(statusConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => updateStatus(key as any)}
              className={cn(
                "w-full flex items-center px-4 py-2 text-sm hover:bg-gray-50",
                status === key && "bg-gray-50"
              )}
            >
              <span className={cn("h-2 w-2 rounded-full mr-2", config.color)} />
              {config.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}