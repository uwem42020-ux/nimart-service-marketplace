import { cn } from '../../lib/utils';
import { Clock, CheckCircle, Loader2, Star, AlertTriangle, XCircle } from 'lucide-react';

interface Step {
  key: string;
  label: string;
  icon: React.ElementType;
}

const steps: Step[] = [
  { key: 'pending', label: 'Requested', icon: Clock },
  { key: 'confirmed', label: 'Accepted', icon: CheckCircle },
  { key: 'in_progress', label: 'In Progress', icon: Loader2 },
  { key: 'completed', label: 'Completed', icon: CheckCircle },
  { key: 'rated', label: 'Rated', icon: Star },
];

interface BookingStatusTimelineProps {
  currentStatus: string;
  customerConfirmationStatus?: string;
  size?: 'sm' | 'md';
}

export function BookingStatusTimeline({
  currentStatus,
  customerConfirmationStatus,
  size = 'md',
}: BookingStatusTimelineProps) {
  const statusIndex = steps.findIndex(s => s.key === currentStatus);
  const isCancelled = currentStatus.startsWith('cancelled');
  const isDisputed = customerConfirmationStatus === 'disputed';
  const isCompleted = currentStatus === 'completed';
  const isRated = isCompleted && customerConfirmationStatus === 'confirmed';

  return (
    <div className={cn('flex items-center w-full', size === 'sm' ? 'gap-0' : 'gap-1')}>
      {steps.map((step, idx) => {
        const StepIcon = step.icon;
        let isActive = idx <= statusIndex && !isCancelled;
        let isCurrent = idx === statusIndex && !isCancelled;
        let isFuture = idx > statusIndex;

        if (step.key === 'rated' && isRated) {
          isActive = true;
          isFuture = false;
        }

        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1 relative">
              {/* Circle */}
              <div
                className={cn(
                  'relative flex items-center justify-center rounded-full transition-all duration-300 z-10',
                  size === 'sm' ? 'w-8 h-8' : 'w-10 h-10',
                  isActive && !isCancelled && !isDisputed
                    ? 'bg-primary-600 text-white shadow-md'
                    : isCancelled || isDisputed
                    ? 'bg-red-100 text-red-500'
                    : 'bg-gray-100 text-gray-400'
                )}
              >
                <StepIcon
                  className={cn(
                    size === 'sm' ? 'w-4 h-4' : 'w-5 h-5',
                    isCurrent && 'animate-pulse'
                  )}
                />
                {isCurrent && (
                  <span className="absolute inset-0 rounded-full bg-primary-600 opacity-25 animate-ping" />
                )}
              </div>

              {/* Label */}
              {size === 'md' && (
                <span
                  className={cn(
                    'text-xs mt-1 text-center font-medium',
                    isActive && !isCancelled && !isDisputed ? 'text-primary-700' : 'text-gray-400',
                    isCurrent && 'text-primary-700 font-semibold'
                  )}
                >
                  {step.label}
                </span>
              )}
            </div>

            {/* Connector line after each step except the last */}
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-1 -mt-4', // align with circle center
                  isActive && idx < statusIndex ? 'bg-primary-500' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        );
      })}

      {isCancelled && (
        <div className="ml-2 flex items-center gap-1 text-xs text-red-600 font-medium">
          <XCircle className="h-4 w-4" />
          Cancelled
        </div>
      )}
      {isDisputed && (
        <div className="ml-2 flex items-center gap-1 text-xs text-orange-600 font-medium">
          <AlertTriangle className="h-4 w-4" />
          Disputed
        </div>
      )}
    </div>
  );
}