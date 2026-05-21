import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Server, Database, Brain, Eye, Image as ImageIcon, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ServiceStatus {
  service: string;
  key: string;
  status: 'online' | 'offline' | 'starting';
  url: string;
}

const AdminMonitoringPanel: React.FC = () => {
  const [aiStatuses, setAiStatuses] = useState<ServiceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Simulated Load Data for Chart
  const [loadData] = useState([
    { time: '10:00', load: 30 }, { time: '10:05', load: 45 },
    { time: '10:10', load: 35 }, { time: '10:15', load: 60 },
    { time: '10:20', load: 55 }, { time: '10:25', load: 80 },
    { time: '10:30', load: 40 }
  ]);

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      // Fetch AI Status from our new Node Gateway
      const response = await fetch('/api/ai/status');
      if (response.ok) {
        const data = await response.json();
        setAiStatuses(data);
      } else {
        // Fallback if API fails
        setAiStatuses([
          { service: "Cerveau (Phi-3.5)", key: "brain", status: 'offline', url: 'http://localhost:8002' },
          { service: "Vision (Moondream)", key: "vision", status: 'offline', url: 'http://localhost:8003' },
          { service: "Image (SDXL)", key: "image", status: 'offline', url: 'http://localhost:8004' }
        ]);
      }
    } catch (error) {
      console.error("Monitoring Error:", error);
    } finally {
      setIsLoading(false);
      setLastUpdated(new Date());
    }
  };

  const handleAction = async (serviceKey: string, action: 'start' | 'stop') => {
    setActionLoading(prev => ({ ...prev, [serviceKey]: true }));
    try {
      const response = await fetch(`/api/admin/ai/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ service: serviceKey })
      });

      if (response.ok) {
        // Optimistic update or just refresh
        setTimeout(checkStatus, 2000);
      }
    } catch (error) {
      console.error(`AI ${action} error:`, error);
    } finally {
      setActionLoading(prev => ({ ...prev, [serviceKey]: false }));
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const getIcon = (name: string) => {
    if (name.includes('Cerveau')) return <Brain className="h-5 w-5" />;
    if (name.includes('Vision')) return <Eye className="h-5 w-5" />;
    if (name.includes('Image')) return <ImageIcon className="h-5 w-5" />;
    return <Server className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-proqblue to-cyan-500 bg-clip-text text-transparent">
            État du Système (Cortex)
          </h2>
          <p className="text-slate-500">Supervision et contrôle en temps réel des microservices IA.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Dernière MàJ: {lastUpdated?.toLocaleTimeString()}</span>
          <button onClick={checkStatus} className="p-2 hover:bg-slate-100 rounded-full transition-colors" title="Actualiser">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AI Services Status & Controls */}
        {aiStatuses.map((service, idx) => (
          <Card key={idx} className="border-l-4 border-l-proqblue shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {getIcon(service.service)}
                  {service.service}
                </div>
                <Badge variant={service.status === 'online' ? 'default' : service.status === 'starting' ? 'outline' : 'destructive'}
                  className={service.status === 'online' ? 'bg-green-500 hover:bg-green-600' : service.status === 'starting' ? 'bg-amber-500 text-white border-amber-500' : ''}>
                  {service.status === 'online' ? 'EN LIGNE' : service.status === 'starting' ? 'DÉMARRAGE...' : 'HORS LIGNE'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Port: {service.url.split(':').pop()}</span>
                {service.status === 'online' ?
                  <CheckCircle className="h-4 w-4 text-green-500" /> :
                  <XCircle className="h-4 w-4 text-red-500" />
                }
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(service.key, 'start')}
                  disabled={service.status === 'online' || service.status === 'starting' || actionLoading[service.key]}
                  className="flex-1 text-xs py-2 bg-proqblue text-white rounded hover:bg-proqblue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1"
                >
                  {actionLoading[service.key] ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Activity className="h-3 w-3" />}
                  Démarrer
                </button>
                <button
                  onClick={() => handleAction(service.key, 'stop')}
                  disabled={service.status === 'offline' || actionLoading[service.key]}
                  className="flex-1 text-xs py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1"
                >
                  {actionLoading[service.key] ? <RefreshCw className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                  Arrêter
                </button>
              </div>

              <p className="text-[10px] text-slate-400 truncate">{service.url}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="h-5 w-5 text-proqblue" />
            Charge Système (Simulation)
          </CardTitle>
          <CardDescription>Utilisation des ressources CPU/GPU par les modèles IA</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={loadData}>
              <defs>
                <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="load" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorLoad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMonitoringPanel;