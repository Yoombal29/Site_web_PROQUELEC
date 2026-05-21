import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Zap, Server, Globe, SignalHigh, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ControlRoomStatusBar: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [latency, setLatency] = useState(24);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        const latencyTimer = setInterval(() => setLatency(Math.floor(Math.random() * (45 - 18 + 1) + 18)), 3000);
        return () => {
            clearInterval(timer);
            clearInterval(latencyTimer);
        };
    }, []);

    return (
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between border-t border-white/5 font-mono text-[10px] tracking-widest uppercase">
            <div className="flex items-center gap-8">
                {/* System Status */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <span className="font-black text-emerald-500">Node-01: Connecté</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] border-white/10 text-white/40 h-5 px-2">V4.0.2 Stable</Badge>
                </div>

                {/* DB & Sync Status */}
                <div className="hidden md:flex items-center gap-6 border-l border-white/10 pl-8">
                    <div className="flex items-center gap-2 text-white/60">
                        <Server className="h-3 w-3" />
                        <span>Data Warehouse: OK</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                        <Activity className="h-3 w-3 text-proqblue" />
                        <span>COSSUEL Sync: Actif</span>
                    </div>
                </div>

                {/* Network Metrics */}
                <div className="hidden lg:flex items-center gap-6 border-l border-white/10 pl-8">
                    <div className="flex items-center gap-2 text-white/40">
                        <SignalHigh className="h-3 w-3" />
                        <span>Latence: {latency}ms</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/40">
                        <Globe className="h-3 w-3" />
                        <span>Tunnel: Chiffré AES-256</span>
                    </div>
                </div>
            </div>

            {/* Right Side: Identity & Time */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    <AlertCircle className="h-3 w-3" />
                    <span>Mode Supervision Institutionnelle</span>
                </div>
                <div className="flex items-center gap-3 border-l border-white/10 pl-6">
                    <Zap className="h-3 w-3 text-proqblue animate-pulse" />
                    <span className="font-black text-white/80">{currentTime.toLocaleTimeString()}</span>
                </div>
            </div>
        </div>
    );
};

export default ControlRoomStatusBar;
