import React, { useState } from 'react';
import {
  FileText,
  Download,
  Presentation,
  BookOpen,
  Search,

  FileCheck,
  ShieldCheck } from
'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Input } from '@/components/ui/input';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'pptx';
  category: 'cours' | 'norme' | 'guide';
  normId: 'NS-01-001' | 'NF-C18-510';
  path: string;
  date: string;
  size: string;
}

const SAMPLE_RESOURCES: Resource[] = [
{
  id: 'res-ns-001',
  title: 'Norme NS 01-001 (Originale)',
  description: 'Document officiel complet de la norme sénégalaise pour les installations électriques.',
  type: 'pdf',
  category: 'norme',
  normId: 'NS-01-001',
  path: '/data/NS-01-001/full_ai/NS_01_001.pdf',
  date: '2024-01-15',
  size: '12.4 MB'
},
{
  id: 'res-ns-cours-001',
  title: 'Fiches de Cours - NS 01-001',
  description: 'Supports pédagogiques complets générés par IA pour la formation.',
  type: 'pdf',
  category: 'cours',
  normId: 'NS-01-001',
  path: '/data/NS-01-001/full_ai/datasets/fiches_cours.pdf',
  date: '2025-02-01',
  size: '4.2 MB'
},
{
  id: 'res-ns-ppt-001',
  title: 'Présentation Technique - NS 01-001',
  description: 'Slides PowerPoint pour animation de sessions de formation.',
  type: 'pptx',
  category: 'cours',
  normId: 'NS-01-001',
  path: '/data/NS-01-001/full_ai/datasets/fiches_cours.pptx',
  date: '2025-02-01',
  size: '8.5 MB'
},
{
  id: 'res-nf-001',
  title: 'Norme NF C18-510 (Sécurité)',
  description: 'Recueil des prescriptions de sécurité électrique.',
  type: 'pdf',
  category: 'norme',
  normId: 'NF-C18-510',
  path: '/data/NF_C18-510/full_ai/NF_C18-510_Original.pdf',
  date: '2024-01-20',
  size: '15.1 MB'
},
{
  id: 'res-nf-cours-001',
  title: 'Support Habilitation Électrique',
  description: 'Fiches de cours pour la préparation aux habilitations B1, B2, BC.',
  type: 'pdf',
  category: 'cours',
  normId: 'NF-C18-510',
  path: '/data/NF_C18-510/full_ai/datasets/fiches_cours.pdf',
  date: '2025-02-05',
  size: '3.8 MB'
},
{
  id: 'res-nf-ppt-001',
  title: 'Présentation Habilitation',
  description: 'Support de présentation pour formateurs en habilitation électrique.',
  type: 'pptx',
  category: 'cours',
  normId: 'NF-C18-510',
  path: '/data/NF_C18-510/full_ai/datasets/fiches_cours.pptx',
  date: '2025-02-05',
  size: '7.2 MB'
}];


export const ResourceLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNorm, setSelectedNorm] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredResources = SAMPLE_RESOURCES.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNorm = selectedNorm === 'all' || resource.normId === selectedNorm;
    const matchesType = selectedType === 'all' || resource.type === selectedType;

    return matchesSearch && matchesNorm && matchesType;
  });

  const handleDownload = (resource: Resource) => {
    // Simulation de téléchargement ou ouverture réelle
    window.open(resource.path, '_blank');
    toast.success(`Téléchargement lancé : ${resource.title}`);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf':return <FileText className="w-8 h-8 text-red-500" />;
      case 'pptx':return <Presentation className="w-8 h-8 text-orange-500" />;
      default:return <FileCheck className="w-8 h-8 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
            <Card className="border-blue-100 bg-blue-50/20">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-blue-800">
                                <BookOpen className="w-6 h-6" />
                                Bibliothèque de Ressources
                            </CardTitle>
                            <CardDescription>
                                Accédez et téléchargez tous les supports de cours, normes originales et présentations.
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-white text-blue-700 border-blue-200 px-3 py-1">
                            {filteredResources.length} document(s) disponible(s)
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                placeholder="Rechercher un document..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10" />
              
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Select value={selectedNorm} onValueChange={setSelectedNorm}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Toutes les normes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Toutes les normes</SelectItem>
                                    <SelectItem value="NS-01-001">NS 01-001 (Sénégal)</SelectItem>
                                    <SelectItem value="NF-C18-510">NF C18-510 (Sécurité)</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Tous les types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les types</SelectItem>
                                    <SelectItem value="pdf">Documents PDF</SelectItem>
                                    <SelectItem value="pptx">Présentations PPT</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) =>
        <Card key={resource.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors">
                                    {getIcon(resource.type)}
                                </div>
                                <Badge variant={resource.normId === 'NS-01-001' ? 'default' : 'secondary'}>
                                    {resource.normId}
                                </Badge>
                            </div>
                            <CardTitle className="mt-4 text-lg leading-tight group-hover:text-primary transition-colors">
                                {resource.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2 mt-2 h-10">
                                {resource.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-3 text-xs text-muted-foreground flex justify-between items-center">
                            <span className="flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Officiel
                            </span>
                            <span>{resource.size} • {resource.date}</span>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button
              className="w-full bg-slate-900 group-hover:bg-primary transition-colors"
              onClick={() => handleDownload(resource)}>
              
                                <Download className="w-4 h-4 mr-2" />
                                Télécharger
                            </Button>
                        </CardFooter>
                    </Card>
        )}

                {filteredResources.length === 0 &&
        <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Aucun document ne correspond à vos critères de recherche.</p>
                        <Button variant="link" onClick={() => {setSearchQuery('');setSelectedNorm('all');setSelectedType('all');}}>
                            Réinitialiser les filtres
                        </Button>
                    </div>
        }
            </div>
        </div>);

};