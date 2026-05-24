import React from 'react';
import { Database, BarChart3, ExternalLink, Server, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AdminInfrastructurePanel = () => {
  const services = [
  {
    name: "BI Metabase",
    description: "Tableaux de bord business intelligence et reporting avancé.",
    url: "http://localhost:3101",
    icon: BarChart3,
    color: "text-blue-500",
    bg: "bg-blue-50",
    status: "External",
    port: "3101"
  },
  {
    name: "API Documentation (Swagger)",
    description: "Documentation technique interactive de l'API Backend.",
    url: "http://localhost:3103",
    icon: Server,
    color: "text-green-500",
    bg: "bg-green-50",
    status: "External",
    port: "3103"
  }];


  return (
    <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Database className="w-6 h-6 text-proqblue" />
                    Infrastructure & Services Externes
                </h2>
                <p className="text-slate-500">
                    Accès direct aux services et interfaces externes utilisés par la plateforme.
                    <br />
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200 inline-block mt-2">
                        ⚠️ Ces outils doivent être démarrés ou accessibles pour fonctionner correctement.
                    </span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {services.map((service, index) =>
        <Card key={index} className="hover:shadow-lg transition-all border-slate-200">
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${service.bg} ${service.color}`}>
                                    <service.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold text-slate-800">
                                        {service.name}
                                    </CardTitle>
                                    <CardDescription className="text-sm mt-1">
                                        Port: <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">{service.port}</span>
                                    </CardDescription>
                                </div>
                            </div>
                            <Badge variant={service.status === "Active" ? "default" : "outline"}>
                                {service.status}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-600 mb-6 text-sm h-10">
                                {service.description}
                            </p>
                            <Button
              className="w-full gap-2 group"
              variant="outline"
              onClick={() => window.open(service.url, '_blank')}>
              
                                Ouvrir l'interface
                                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                            </Button>
                        </CardContent>
                    </Card>
        )}
            </div>

            <div className="p-4 bg-slate-900 text-slate-300 rounded-lg font-mono text-xs overflow-x-auto">
                <p className="mb-2 text-slate-400"># Commande pour redémarrer l'infrastructure complète :</p>
                <div className="text-green-400">
                    docker-compose down && docker-compose up -d
                </div>
            </div>
        </div>);

};

export default AdminInfrastructurePanel;