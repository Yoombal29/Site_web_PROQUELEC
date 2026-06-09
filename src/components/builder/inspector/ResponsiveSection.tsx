import React from 'react';
import { Monitor, Smartphone, Tablet, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ActiveDevice = 'desktop' | 'tablet' | 'mobile' | 'dark';

interface ResponsiveSectionProps {
  activeDevice: ActiveDevice;
  onDeviceChange: (device: ActiveDevice) => void;
}

const devices: { id: ActiveDevice; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'desktop', label: 'Desktop', icon: Monitor },
  { id: 'tablet', label: 'Tablette', icon: Tablet },
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
  { id: 'dark', label: 'Dark', icon: Moon },
];

export const ResponsiveSection: React.FC<ResponsiveSectionProps> = ({ activeDevice, onDeviceChange }) => {
  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
      {devices.map((device) => {
        const Icon = device.icon;
        const isActive = activeDevice === device.id;
        return (
          <button
            key={device.id}
            title={device.label}
            onClick={() => onDeviceChange(device.id)}
            className={cn(
              'flex items-center justify-center w-8 h-7 rounded-md transition-all',
              isActive
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-700'
            )}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
};
