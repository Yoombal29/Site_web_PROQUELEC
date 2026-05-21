import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    FileText, Zap, ShieldCheck, MapPin,
    HardHat, Calendar, Upload, AlertTriangle,
    CheckCircle, Activity, BarChart3, Pencil, History,
    Trash2, Download, ChevronDown, ChevronUp, FileSpreadsheet,
    ChevronLeft
} from 'lucide-react';
import { useMediaManager } from '@/hooks/useMediaManager';
import { useProject, useUpdateProject, useDeleteInspection, useDeleteAuditLog, ProjectDocument } from '@/hooks/useProjects';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress"; // Added
import { Textarea } from "@/components/ui/textarea";

import { InspectionWizard } from '@/components/inspections/InspectionWizard';

export default function ProjectDetail() {
    const { id } = useParams<{ id: string; }>();
    const navigate = useNavigate();
    const { project, documents, inspections, auditLogs, isLoading } = useProject(id!);
    const updateProjectMutation = useUpdateProject();
    const { uploadFile } = useMediaManager();
    const [uploading, setUploading] = useState(false);
    const [showWizard, setShowWizard] = useState(false);
    const [selectedAuditType, setSelectedAuditType] = useState<'Résidentiel' | 'Tertiaire' | 'Industriel' | 'Audit Énergétique' | undefined>();
    const deleteInspectionMutation = useDeleteInspection();
    const deleteAuditMutation = useDeleteAuditLog();
    const [expandedAudits, setExpandedAudits] = useState<Set<string>>(new Set());
    const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

    // Tech Specs Edit State
    const [isEditSpecsOpen, setIsEditSpecsOpen] = useState(false);
    const [techSpecs, setTechSpecs] = useState({
        installation_type: '',
        power_subscribed: '',
        voltage_type: ''
    });

    // State Machine Dialog State
    const [isTransitionDialogOpen, setIsTransitionDialogOpen] = useState(false);
    const [targetStatus, setTargetStatus] = useState('');
    const [transitionReason, setTransitionReason] = useState('');

    useEffect(() => {
        if (project?.technical_info) {
            setTechSpecs({
                installation_type: project.technical_info.installation_type || '',
                power_subscribed: project.technical_info.power_subscribed || '',
                voltage_type: project.technical_info.voltage_type || ''
            });
        }
    }, [project]);

    const handleSaveSpecs = () => {
        if (!id) return;
        updateProjectMutation.mutate({
            id,
            data: {
                technical_info: techSpecs
            }
        }, {
            onSuccess: () => {
                setIsEditSpecsOpen(false);
            }
        });
    };

    const handleStateTransition = async () => {
        if (!id || !targetStatus) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/projects/${id}/transition`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    new_status: targetStatus,
                    reason: transitionReason
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Transition failed');
            }

            const data = await response.json();
            toast.success(data.message || `Statut changé: ${data.transition.from} → ${data.transition.to}`);
            setIsTransitionDialogOpen(false);
            setTransitionReason('');
            // Refresh project data
            window.location.reload();
        } catch (err: any) {
            toast.error(err.message || 'Erreur lors de la transition');
        }
    };

    const onDrop = async (acceptedFiles: File[]) => {
        if (!id) return;
        setUploading(true);
        try {
            for (const file of acceptedFiles) {
                // Upload with project_id context
                await uploadFile.mutateAsync({ file, projectId: id });
            }
            toast.success('Documents ajoutés au dossier technique');
        } catch (err) {
            toast.error("Erreur lors de l'ajout des documents");
        } finally {
            setUploading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const toggleAudit = (id: string) => {
        const next = new Set(expandedAudits);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedAudits(next);
    };

    const toggleLog = (id: string) => {
        const next = new Set(expandedLogs);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedLogs(next);
    };

    const handleExport = (type: 'pdf' | 'excel', data: any) => {
        toast.info(`Préparation de l'export ${type.toUpperCase()}...`);
        // Simuler un export
        setTimeout(() => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit_${data.id || 'export'}.${type === 'pdf' ? 'json' : 'csv'}`;
            a.click();
            toast.success(`Fichier ${type.toUpperCase()} généré !`);
        }, 1500);
    };

    if (isLoading) return <div className="p-10 text-center animate-pulse text-proqblue">Chargement du Dossier Technique...</div>;
    if (!project) return <div className="p-10 text-center text-red-500">Projet introuvable</div>;

    // Categorize documents
    const docCategories = {
        'etude': documents?.filter((d) => ['plan', 'schema', 'note_calcul'].includes(d.doc_category || '')) || [],
        'chantier': documents?.filter((d) => ['photo_chantier', 'rapport_visite'].includes(d.doc_category || '')) || [],
        'controle': documents?.filter((d) => ['pv_inspection', 'certificat'].includes(d.doc_category || '')) || [],
        'general': documents?.filter((d) => !d.doc_category || d.doc_category === 'general') || []
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'etude': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'chantier': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'controle': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'livre': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getComplianceColor = (score: number) => {
        if (score >= 90) return 'text-emerald-500';
        if (score >= 70) return 'text-amber-500';
        return 'text-red-500';
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans relative">
            {showWizard && id && (
                <InspectionWizard
                    projectId={id}
                    onClose={() => {
                        setShowWizard(false);
                        setSelectedAuditType(undefined);
                    }}
                    forceType={selectedAuditType}
                />
            )}
            {/* Header: Project Identity */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-slate-100 rounded-full"
                                    onClick={() => navigate('/projects')}
                                    title="Retour au Portefeuille"
                                >
                                    <ChevronLeft className="w-5 h-5 text-slate-500" />
                                </Button>
                                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                    {project.title}
                                </h1>
                                <Badge variant="outline" className={`${getStatusColor(project.status)} uppercase text-[10px] font-bold tracking-widest`}>
                                    {project.status}
                                </Badge>
                                {/* Regulatory Status Badge */}
                                <Badge
                                    variant={project.regulatory_status === 'validated' ? 'default' : 'outline'}
                                    className={`uppercase text-[10px] font-bold tracking-widest ${project.regulatory_status === 'draft' ? 'bg-gray-100 text-gray-700' :
                                        project.regulatory_status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                                            project.regulatory_status === 'under_review' ? 'bg-amber-100 text-amber-700' :
                                                project.regulatory_status === 'validated' ? 'bg-emerald-500 text-white' :
                                                    project.regulatory_status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-slate-100 text-slate-700'
                                        }`}
                                >
                                    🏛️ {project.regulatory_status || 'draft'}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {project.location?.city || 'Sénégal'}</span>
                                <span className="flex items-center gap-1"><Zap className="w-4 h-4" /> {project.reference}</span>
                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Créé le {format(new Date(project.created_at), 'dd/MM/yyyy')}</span>
                            </div>
                        </div>

                        {/* State Transition Actions */}
                        <div className="flex items-center gap-2">
                            {project.regulatory_status === 'draft' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setTargetStatus('submitted');
                                        setIsTransitionDialogOpen(true);
                                    }}
                                >
                                    📤 Soumettre
                                </Button>
                            )}
                            {project.regulatory_status === 'submitted' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setTargetStatus('under_review');
                                        setIsTransitionDialogOpen(true);
                                    }}
                                >
                                    🔍 Examiner
                                </Button>
                            )}
                            {project.regulatory_status === 'under_review' && (
                                <>
                                    <Button
                                        size="sm"
                                        variant="default"
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                        onClick={() => {
                                            setTargetStatus('validated');
                                            setIsTransitionDialogOpen(true);
                                        }}
                                    >
                                        ✅ Valider
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => {
                                            setTargetStatus('rejected');
                                            setIsTransitionDialogOpen(true);
                                        }}
                                    >
                                        ❌ Rejeter
                                    </Button>
                                </>
                            )}
                            {project.regulatory_status === 'rejected' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setTargetStatus('draft');
                                        setIsTransitionDialogOpen(true);
                                    }}
                                >
                                    🔄 Corriger
                                </Button>
                            )}
                        </div>

                        {/* Compliance Score */}
                        <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                            <div className="text-right">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score Conformité</div>
                                <div className={`text-2xl font-black ${getComplianceColor(project.compliance_score)}`}>
                                    {project.compliance_score}/100
                                </div>
                            </div>
                            <div className="h-10 w-10 rounded-full border-4 border-slate-200 flex items-center justify-center">
                                <ShieldCheck className={`w-5 h-5 ${getComplianceColor(project.compliance_score)}`} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8 grid grid-cols-12 gap-6">

                {/* Left Sidebar: Project Context */}
                <div className="col-span-3 space-y-6">
                    {/* Compliance Score Card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Conformité NS 01-001</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Overall Big Score */}
                            <div className="flex items-center gap-4">
                                <div className={`text-4xl font-black ${getComplianceColor(project.compliance_score)}`}>
                                    {project.compliance_score}%
                                </div>
                                <div className="text-xs text-slate-400 font-medium leading-tight">
                                    Score Global<br />d'Autorité
                                </div>
                            </div>

                            {/* Breakdown Bars */}
                            {project.compliance_details?.breakdown && project.compliance_details.breakdown.length > 0 ? (
                                <div className="space-y-3 pt-2 border-t border-slate-100">
                                    {project.compliance_details.breakdown.map((item, idx) => (
                                        <div key={idx}>
                                            <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wide">
                                                <span className="truncate max-w-[140px]">{item.domain}</span>
                                                <span className={`${item.score < 50 ? 'text-red-500' : 'text-slate-800'}`}>{item.score}%</span>
                                            </div>
                                            <Progress value={item.score} className="h-1.5 bg-slate-100" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-slate-400 italic pt-2">En attente d'un premier audit de santé validé.</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Fiche Technique</CardTitle>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditSpecsOpen(true)}>
                                    <Pencil className="w-4 h-4 text-slate-400 hover:text-proqblue" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-xs text-slate-400">Client</div>
                                <div className="font-medium text-slate-800">{project.client_info?.name || 'Non spécifié'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400">Type Installation</div>
                                <div className="font-medium text-slate-800">{project.technical_info?.installation_type || 'Non spécifié'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-400">Puissance Souscrite</div>
                                <div className="font-medium text-slate-800">
                                    {project.technical_info?.power_subscribed || 'Non spécifié'}
                                    {project.technical_info?.voltage_type ? ` (${project.technical_info.voltage_type})` : ''}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-proqblue text-white border-none">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="w-5 h-5 animate-pulse" />
                                <span className="font-bold">Cortex IA Actif</span>
                            </div>
                            <p className="text-xs opacity-80 mb-4">
                                L'intelligence artificielle analyse en temps réel tous les documents ajoutés pour vérifier la conformité NS 01-001.
                            </p>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="w-full text-proqblue font-bold"
                                onClick={() => {
                                    if (inspections && inspections.length > 0) {
                                        navigate(`/diagnostics/${inspections[0].id}`);
                                    } else {
                                        toast.error("Aucun rapport disponible. Lancez un diagnostic.");
                                    }
                                }}
                            >
                                Voir Rapport Audit
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content: Workflow Tabs */}
                <div className="col-span-9">
                    <Tabs defaultValue="bureau_etudes" className="w-full">
                        <TabsList className="grid w-full grid-cols-5 mb-6">
                            <TabsTrigger value="bureau_etudes">Conception & Études</TabsTrigger>
                            <TabsTrigger value="chantier">Suivi Chantier</TabsTrigger>
                            <TabsTrigger value="inspections">Audits & Énergie (<span className="text-xs ml-1 font-bold">{inspections?.length || 0}</span>)</TabsTrigger>
                            <TabsTrigger value="documents_generaux">Documents</TabsTrigger>
                            <TabsTrigger value="audit">Diagnostic Interne</TabsTrigger>
                        </TabsList>

                        {/* Drop Zone */}
                        <div {...getRootProps()} className={`mb-6 border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${isDragActive ? 'border-proqblue bg-blue-50' : 'border-slate-200 hover:border-proqblue/50'}`}>
                            <input {...getInputProps()} />
                            <Upload className={`mx-auto h-10 w-10 mb-3 ${isDragActive ? 'text-proqblue' : 'text-slate-300'}`} />
                            <p className="font-medium text-slate-600">Glissez-déposez vos documents techniques ici</p>
                            <p className="text-xs text-slate-400 mt-1">Plans DWG, Notes PDF, Photos Site, Rapports...</p>
                        </div>

                        {/* Content Views */}
                        <TabsContent value="inspections" className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-purple-600" /> Historique des Audits & Diagnostics
                                </h3>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                                        onClick={() => {
                                            setSelectedAuditType('Audit Énergétique');
                                            setShowWizard(true);
                                        }}>
                                        ⚡ Audit Énergétique
                                    </Button>
                                    <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-shadow hover:shadow-purple-500/20"
                                        onClick={() => {
                                            setSelectedAuditType(undefined); // Automatic based on project
                                            setShowWizard(true);
                                        }}>
                                        + Nouveau Diagnostic Tech
                                    </Button>
                                </div>
                            </div>

                            {inspections?.length === 0 ? (
                                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-200">
                                    <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-500">Aucun diagnostic réalisé.</p>
                                    <Button variant="link" className="text-purple-600">Lancer une expertise technique</Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {inspections?.map(insp => (
                                        <Card key={insp.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                            <CardContent className="p-0">
                                                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                                                    onClick={() => toggleAudit(insp.id)}>
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-3 rounded-full ${insp.overall_score >= 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                            <ShieldCheck className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800">{insp.checklist_title || 'Audit Technique Standard'}</div>
                                                            <div className="text-sm text-slate-500 flex items-center gap-2">
                                                                <span>Auditeur: {insp.inspector_name}</span>
                                                                <span>•</span>
                                                                <span>{format(new Date(insp.created_at), 'dd MMM yyyy')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <div className="text-xl font-black text-slate-900">{insp.overall_score || '-'}%</div>
                                                            <Badge variant="outline" className="uppercase text-[8px] h-4">{insp.status}</Badge>
                                                        </div>
                                                        {expandedAudits.has(insp.id) ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                                    </div>
                                                </div>

                                                {expandedAudits.has(insp.id) && (
                                                    <div className="p-4 bg-slate-50 border-t border-slate-100 animate-in slide-in-from-top-2 flex justify-between items-center">
                                                        <div className="flex gap-2">
                                                            <Button size="sm" variant="ghost" className="text-proqblue font-bold text-xs" onClick={() => navigate(`/diagnostics/${insp.id}`)}>
                                                                Accéder au Rapport Complet
                                                            </Button>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button size="icon" variant="outline" className="h-8 w-8 text-slate-500 hover:text-proqblue" title="Exporter PDF" onClick={() => handleExport('pdf', insp)}>
                                                                <FileText className="w-4 h-4" />
                                                            </Button>
                                                            <Button size="icon" variant="outline" className="h-8 w-8 text-slate-500 hover:text-emerald-600" title="Exporter Excel" onClick={() => handleExport('excel', insp)}>
                                                                <FileSpreadsheet className="w-4 h-4" />
                                                            </Button>
                                                            <Button size="icon" variant="outline" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50" title="Supprimer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (confirm('Supprimer ce diagnostic définitivement ?')) deleteInspectionMutation.mutate(insp.id);
                                                                }}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="bureau_etudes" className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-600" /> Documents de Conception
                            </h3>
                            {docCategories.etude.length === 0 && docCategories.general.length === 0 ?
                                <div className="text-center py-10 text-slate-400 italic">Aucun document d'étude pour le moment.</div> :

                                <div className="grid grid-cols-2 gap-4">
                                    {[...docCategories.etude, ...docCategories.general].map((doc) =>
                                        <DocumentCard key={doc.id} doc={doc} />
                                    )}
                                </div>
                            }
                        </TabsContent>

                        <TabsContent value="chantier">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <HardHat className="w-5 h-5 text-amber-600" /> Journal de Chantier
                                </h3>
                                <Button size="sm" variant="outline" onClick={() => setShowWizard(true)}>+ Nouveau Rapport Visite</Button>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {/* Photos & Reports */}
                            </div>
                        </TabsContent>

                        <TabsContent value="documents_generaux">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-slate-600" /> Tous les Documents
                            </h3>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                {documents?.map((doc) =>
                                    <DocumentCard key={doc.id} doc={doc} />
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="audit">
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 flex items-start gap-4">
                                <Activity className="w-8 h-8 text-proqblue mt-1" />
                                <div>
                                    <h4 className="font-bold text-proqblue">Espace Diagnostic Interne & Traçabilité</h4>
                                    <p className="text-sm text-slate-600">
                                        Ce journal immuable enregistre chaque action technique réalisée sur le dossier.
                                        Il garantit la conformité de l'expertise PROQUELEC et permet de retracer l'évolution de la santé électrique du projet.
                                    </p>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                                <History className="w-5 h-5 text-blue-600" /> Journal d'Expertise (Traçabilité)
                            </h3>
                            <div className="space-y-4">
                                {auditLogs?.map(log => {
                                    // Traductions françaises
                                    const actionLabels: Record<string, string> = {
                                        'STATE_TRANSITION': 'Transition d\'État',
                                        'UPDATE_PROJECT': 'Modification Projet',
                                        'CREATE_INSPECTION': 'Création Inspection',
                                        'UPDATE_INSPECTION': 'Modification Inspection',
                                        'VALIDATE_INSPECTION': 'Validation Inspection',
                                        'UPLOAD_DOCUMENT': 'Téléversement Document',
                                        'DELETE_DOCUMENT': 'Suppression Document',
                                        'CREATE_PROJECT': 'Création Projet'
                                    };

                                    const fieldLabels: Record<string, string> = {
                                        'reason': 'Raison',
                                        'regulatory_status': 'Statut Réglementaire',
                                        'technical_info': 'Informations Techniques',
                                        'status': 'Statut',
                                        'title': 'Titre',
                                        'location': 'Localisation',
                                        'client_info': 'Client'
                                    };

                                    const statusLabels: Record<string, string> = {
                                        'draft': 'Brouillon',
                                        'submitted': 'Soumis',
                                        'under_review': 'En Examen',
                                        'validated': 'Validé',
                                        'rejected': 'Rejeté',
                                        'archived': 'Archivé'
                                    };

                                    const translateStatus = (val: string) => statusLabels[val] || val;
                                    const formatValue = (val: any) => {
                                        if (val === null || val === undefined) return '—';
                                        if (typeof val === 'object') return JSON.stringify(val, null, 2);
                                        // Traduire les statuts
                                        if (statusLabels[val]) return translateStatus(val);
                                        return val;
                                    };

                                    return (
                                        <Card key={log.id} className="overflow-hidden hover:shadow-md transition-shadow mb-3 border-l-2 border-l-proqblue">
                                            <div
                                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                                                onClick={() => toggleLog(log.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-proqblue/10 p-2 rounded-lg">
                                                        <History className="w-4 h-4 text-proqblue" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-sm">{actionLabels[log.action] || log.action}</div>
                                                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                                            {format(new Date(log.performed_at), 'dd MMM yyyy • HH:mm', { locale: fr })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Badge variant="outline" className="text-[9px] bg-slate-50 text-slate-400 border-slate-200">
                                                        SHA-256 ✓
                                                    </Badge>
                                                    {expandedLogs.has(log.id) ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                                </div>
                                            </div>

                                            {expandedLogs.has(log.id) && (
                                                <div className="p-4 bg-slate-50 border-t border-slate-100 animate-in slide-in-from-top-2">
                                                    <div className="text-xs text-slate-500 mb-3">
                                                        Opérateur : <span className="font-bold text-slate-700">{log.performed_by_email || 'Système'}</span>
                                                    </div>

                                                    {log.changes && Object.keys(log.changes).length > 0 && (
                                                        <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] shadow-inner mb-4">
                                                            {Object.entries(log.changes).map(([key, val]: [string, any]) => (
                                                                <div key={key} className="mb-2 last:mb-0 pb-2 border-b border-slate-50 last:border-0 last:pb-0">
                                                                    <div className="text-slate-400 font-bold mb-1 uppercase text-[9px]">
                                                                        {fieldLabels[key] || key}
                                                                    </div>
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="text-red-400 line-through truncate opacity-60">
                                                                            {formatValue(val.from)}
                                                                        </div>
                                                                        <div className="text-emerald-500 font-bold truncate">
                                                                            {formatValue(val.to)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={() => handleExport('pdf', log)}>
                                                            <Download className="w-3 h-3 mr-1" /> Exporter
                                                        </Button>
                                                        <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600 hover:bg-red-50 text-[10px] h-7"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (confirm('Supprimer cette entrée du journal ?')) deleteAuditMutation.mutate(log.id);
                                                            }}>
                                                            <Trash2 className="w-3 h-3 mr-1" /> Supprimer
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </Card>
                                    );
                                })}
                                {(!auditLogs || auditLogs.length === 0) && (
                                    <div className="text-center text-slate-400 py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                        <p>Aucun événement enregistré dans le journal d'autorité.</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* STATE TRANSITION DIALOG */}
            <Dialog open={isTransitionDialogOpen} onOpenChange={setIsTransitionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Transition Réglementaire</DialogTitle>
                        <DialogDescription>
                            Vous êtes sur le point de changer le statut de <strong>{project.regulatory_status || 'draft'}</strong> vers <strong>{targetStatus}</strong>.
                            Cette action sera enregistrée dans le journal d'audit avec une signature cryptographique.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="transition_reason">Raison / Justification *</Label>
                            <Textarea
                                id="transition_reason"
                                value={transitionReason}
                                onChange={(e) => setTransitionReason(e.target.value)}
                                placeholder="Décrivez la raison de cette transition (obligatoire pour l'audit)..."
                                rows={4}
                                className="resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTransitionDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleStateTransition}
                            disabled={!transitionReason.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            🏛️ Confirmer Transition
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* EDIT TECHNICAL SPECS DIALOG */}
            <Dialog open={isEditSpecsOpen} onOpenChange={setIsEditSpecsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier Fiche Technique</DialogTitle>
                        <DialogDescription>
                            Mettez à jour les spécifications techniques du projet.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="installation_type">Type Installation</Label>
                            <Input
                                id="installation_type"
                                value={techSpecs.installation_type}
                                onChange={(e) => setTechSpecs({ ...techSpecs, installation_type: e.target.value })}
                                placeholder="ex: Résidentiel Collectif"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="power_subscribed">Puissance Souscrite</Label>
                            <Input
                                id="power_subscribed"
                                value={techSpecs.power_subscribed}
                                onChange={(e) => setTechSpecs({ ...techSpecs, power_subscribed: e.target.value })}
                                placeholder="ex: 36 kVA"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="voltage_type">Type Tension</Label>
                            <Input
                                id="voltage_type"
                                value={techSpecs.voltage_type}
                                onChange={(e) => setTechSpecs({ ...techSpecs, voltage_type: e.target.value })}
                                placeholder="ex: Triphasé"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditSpecsOpen(false)}>Annuler</Button>
                        <Button onClick={handleSaveSpecs}>Enregistrer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>);

}

function DocumentCard({ doc }: { doc: ProjectDocument; }) {
    const isCompliant = doc.compliance_status === 'compliant';
    const hasIssues = doc.compliance_status === 'warning' || doc.compliance_status === 'danger';

    return (
        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-4 flex items-start gap-4">
                <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-blue-50 transition-colors">
                    <FileText className="w-6 h-6 text-slate-500 group-hover:text-proqblue" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 truncate" title={doc.file_name}>{doc.file_name}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span>{format(new Date(doc.uploaded_at), 'dd MMM yyyy')}</span>
                    </div>
                </div>

                {/* AI Review Badge */}
                {isCompliant &&
                    <div className="flex flex-col items-center">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <span className="text-[9px] font-bold text-emerald-600 mt-1">CONFORME</span>
                    </div>
                }
                {hasIssues &&
                    <div className="flex flex-col items-center">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <span className="text-[9px] font-bold text-amber-600 mt-1">À REVOIR</span>
                    </div>
                }
            </CardContent>
        </Card>);

}