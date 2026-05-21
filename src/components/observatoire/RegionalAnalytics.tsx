import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Zap, TrendingUp, PieChart as PieChartIcon, BarChart3, Sun, Battery, Flame } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock Data pour l'intelligence énergétique
const consumptionData = [
    { month: 'Jan', residentiel: 4000, industriel: 2400, public: 2400 },
    { month: 'Fév', residentiel: 3000, industriel: 1398, public: 2210 },
    { month: 'Mar', residentiel: 2000, industriel: 9800, public: 2290 },
    { month: 'Avr', residentiel: 2780, industriel: 3908, public: 2000 },
    { month: 'Mai', residentiel: 1890, industriel: 4800, public: 2181 },
    { month: 'Juin', residentiel: 2390, industriel: 3800, public: 2500 },
    { month: 'Juil', residentiel: 3490, industriel: 4300, public: 2100 },
];

const mixData = [
    { name: 'Solaire', value: 35, color: '#10b981' }, // Emerald
    { name: 'Thermique', value: 45, color: '#f59e0b' }, // Amber
    { name: 'Hydraulique', value: 20, color: '#3b82f6' }, // Blue
];

const reliabilityData = [
    { time: '00:00', saidi: 12, saifi: 0.5 },
    { time: '04:00', saidi: 8, saifi: 0.2 },
    { time: '08:00', saidi: 25, saifi: 1.2 },
    { time: '12:00', saidi: 18, saifi: 0.8 },
    { time: '16:00', saidi: 32, saifi: 1.5 },
    { time: '20:00', saidi: 45, saifi: 2.1 },
    { time: '23:59', saidi: 22, saifi: 0.9 },
];

export const RegionalAnalytics: React.FC<{ selectedRegion?: string | null }> = ({ selectedRegion }) => {
    return (
        <Card className="border-0 shadow-premium bg-white/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-3 text-xl font-black text-slate-800">
                            <Activity className="h-6 w-6 text-proqblue animate-pulse" />
                            Intelligence Énergétique Territorial
                        </CardTitle>
                        <CardDescription className="font-medium text-slate-500">
                            Analyse temporelle et structurelle du réseau {selectedRegion ? `pour ${selectedRegion}` : 'à l’échelle nationale'}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-slate-100 p-1 rounded-2xl w-full flex justify-start h-auto gap-2">
                        <TabsTrigger value="overview" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-md py-2.5 px-4 flex gap-2">
                            <TrendingUp className="h-4 w-4" /> Courbe de Charge
                        </TabsTrigger>
                        <TabsTrigger value="mix" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-md py-2.5 px-4 flex gap-2">
                            <PieChartIcon className="h-4 w-4" /> Mix Source
                        </TabsTrigger>
                        <TabsTrigger value="reliability" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-md py-2.5 px-4 flex gap-2">
                            <Zap className="h-4 w-4" /> Qualité de Service
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: Consommation */}
                    <TabsContent value="overview" className="h-[350px] w-full mt-4">
                        <div className="h-full w-full bg-white rounded-3xl p-4 border border-slate-100 shadow-inner">
                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Injection vs Consommation (MWh)</h4>
                            <ResponsiveContainer width="100%" height="85%">
                                <AreaChart data={consumptionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorInd" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f080" />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="industriel" stroke="#1e3a8a" strokeWidth={3} fillOpacity={1} fill="url(#colorInd)" />
                                    <Area type="monotone" dataKey="residentiel" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRes)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>

                    {/* TAB 2: Energy Mix */}
                    <TabsContent value="mix" className="h-[350px] w-full mt-4 flex gap-6">
                        <div className="w-1/2 h-full bg-white rounded-3xl p-4 border border-slate-100 shadow-inner flex items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={mixData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {mixData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <p className="text-3xl font-black text-slate-800">35%</p>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Vert</p>
                                </div>
                            </div>
                        </div>

                        <div className="w-1/2 space-y-4 flex flex-col justify-center">
                            {mixData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-proqblue transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                                            {item.name === 'Solaire' && <Sun className="h-5 w-5" />}
                                            {item.name === 'Thermique' && <Flame className="h-5 w-5" />}
                                            {item.name === 'Hydraulique' && <Battery className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-800">{item.name}</p>
                                            <p className="text-[10px] text-slate-500 font-medium tracking-tight">Capacité du Réseau</p>
                                        </div>
                                    </div>
                                    <span className="font-black text-lg" style={{ color: item.color }}>{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* TAB 3: Reliability */}
                    <TabsContent value="reliability" className="h-[350px] w-full mt-4">
                        <div className="h-full w-full bg-white rounded-3xl p-4 border border-slate-100 shadow-inner">
                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 px-2 flex justify-between">
                                <span>Indice d'Interruptions</span>
                                <div className="flex gap-4 text-[10px]">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-400"></div> SAIDI (Durée)</span>
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400"></div> SAIFI (Fréquence)</span>
                                </div>
                            </h4>
                            <ResponsiveContainer width="100%" height="85%">
                                <BarChart data={reliabilityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="saidi" fill="#fb7185" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="saifi" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>

                </Tabs>
            </CardContent>
        </Card>
    );
};

export default RegionalAnalytics;
