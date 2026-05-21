import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useCreateProject } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Plus, Search, MapPin, Activity, Calendar, ShieldCheck, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function ProjectList() {
    const navigate = useNavigate();
    const { data: projects, isLoading } = useProjects();
    const createMutation = useCreateProject();
    const [search, setSearch] = useState('');
    const [newProjectOpen, setNewProjectOpen] = useState(false);

    const [newProjectData, setNewProjectData] = useState({
        title: '',
        client_name: '',
        city: 'Dakar',
        address: ''
    });

    const handleCreate = async () => {
        await createMutation.mutateAsync({
            title: newProjectData.title,
            client_info: { name: newProjectData.client_name },
            location: { city: newProjectData.city, address: newProjectData.address },
            status: 'etude'
        });
        setNewProjectOpen(false);
        setNewProjectData({ title: '', client_name: '', city: 'Dakar', address: '' });
    };

    const filteredProjects = projects?.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.reference?.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-proqblue w-10 h-10" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight text-proqblue">Portefeuille de Dossiers Techniques</h1>
                        <p className="text-slate-500 font-medium">Gestion des audits de sécurité et diagnostics énergétiques PROQUELEC.</p>
                    </div>

                    <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-proqblue hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/30">
                                <Plus className="w-5 h-5 mr-2" />
                                Nouveau Dossier Audit
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Ouvrir un Nouveau Dossier Technique</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <Input
                                    placeholder="Nom du Projet (ex: Immeuble Touba)"
                                    value={newProjectData.title}
                                    onChange={e => setNewProjectData({ ...newProjectData, title: e.target.value })}
                                />
                                <Input
                                    placeholder="Nom du Client"
                                    value={newProjectData.client_name}
                                    onChange={e => setNewProjectData({ ...newProjectData, client_name: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        placeholder="Ville (ex: Dakar)"
                                        value={newProjectData.city}
                                        onChange={e => setNewProjectData({ ...newProjectData, city: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Adresse"
                                        value={newProjectData.address}
                                        onChange={e => setNewProjectData({ ...newProjectData, address: e.target.value })}
                                    />
                                </div>
                                <Button onClick={handleCreate} disabled={createMutation.isPending || !newProjectData.title} className="w-full">
                                    {createMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : 'Initialiser Dossier Audit'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                        className="pl-10 h-12 text-lg bg-white border-slate-200 shadow-sm rounded-xl focus:ring-proqblue"
                        placeholder="Chercher un dossier par titre ou référence PQ..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects?.map(project => (
                        <Card
                            key={project.id}
                            className="curso-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-none shadow-md bg-white group cursor-pointer"
                            onClick={() => navigate(`/projects/${project.id}`)}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="mb-2 uppercase text-[10px] font-bold tracking-widest bg-slate-50 text-slate-500 border-slate-200">
                                        {project.reference}
                                    </Badge>
                                    <Badge className={`${project.compliance_score >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'} hover:bg-opacity-80`}>
                                        {project.status}
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl font-bold group-hover:text-proqblue transition-colors">
                                    {project.title}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3" /> {project.location?.city || 'Localisation inconnue'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="border-t border-slate-100 pt-4 mt-2 flex justify-between items-center text-sm text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> {format(new Date(project.updated_at), 'dd MMM')}
                                    </span>
                                    {project.compliance_score > 0 && (
                                        <span className="flex items-center gap-1 font-bold text-emerald-600">
                                            <ShieldCheck className="w-4 h-4" /> {project.compliance_score}% Santé Électrique
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {filteredProjects?.length === 0 && (
                        <div className="col-span-3 text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                            <p className="text-slate-400 font-medium">Aucun projet trouvé. Commencez un nouveau chantier !</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
