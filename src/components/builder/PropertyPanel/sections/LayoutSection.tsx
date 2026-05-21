import React, { useState } from 'react';
import DisplayControl from './controls/DisplayControl';
import AlignControl from './controls/AlignControl';
import GapControl from './controls/GapControl';
import SizeControl from './controls/SizeControl';
import WrapControl from './controls/WrapControl';
import GridColumnsControl from './controls/GridColumnsControl';
import LayoutPresetsControl from './controls/LayoutPresetsControl';
import GridLayoutPreviewControl from './controls/GridLayoutPreviewControl';

type Device = 'base' | 'tablet' | 'mobile';

const LayoutSection: React.FC = () => {
  const [device, setDevice] = useState<Device>('base');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex rounded-md overflow-hidden border">
          <button className={`px-3 py-1 text-xs ${device === 'base' ? 'bg-slate-800 text-white' : 'bg-white text-slate-700'}`} onClick={() => setDevice('base')}>Desktop</button>
          <button className={`px-3 py-1 text-xs ${device === 'tablet' ? 'bg-slate-800 text-white' : 'bg-white text-slate-700'}`} onClick={() => setDevice('tablet')}>Tablet</button>
          <button className={`px-3 py-1 text-xs ${device === 'mobile' ? 'bg-slate-800 text-white' : 'bg-white text-slate-700'}`} onClick={() => setDevice('mobile')}>Mobile</button>
        </div>
        <div className="text-[10px] text-slate-400">Mode: {device === 'base' ? 'Desktop' : device === 'tablet' ? 'Tablet' : 'Mobile'}</div>
      </div>

      <div>
        <DisplayControl device={device} />
      </div>

      <div>
        <LayoutPresetsControl />
      </div>

      <div>
        <GridLayoutPreviewControl />
      </div>

      <div>
        <AlignControl device={device} />
      </div>

      <div>
        <GapControl device={device} />
      </div>

      <div>
        <SizeControl device={device} />
      </div>

      <div>
        <WrapControl device={device} />
      </div>

      <div>
        <GridColumnsControl device={device} />
      </div>
    </div>
  );
};

export default LayoutSection;
