import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Table,
    Presentation,
    Sparkles,
    Plus,
    X,
    FileCheck,
    Calculator,
    BarChart3,
    Zap,
    Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Template {
    id: string;
    type: 'document' | 'spreadsheet' | 'presentation';
    name: string;
    description: string;
    category: string;
    icon: React.ReactNode;
    gradient: string;
    preview?: string;
}

const templates: Template[] = [
    // Documents
    {
        id: 'rapport-intervention',
        type: 'document',
        name: 'Rapport d\'Intervention',
        description: 'Rapport technique conforme NF C 15-100',
        category: 'Technique',
        icon: <FileCheck className="h-6 w-6" />,
        gradient: 'from-blue-500 to-cyan-500'
    },
    {
        id: 'devis-technique',
        type: 'document',
        name: 'Devis Technique',
        description: 'Devis détaillé avec spécifications',
        category: 'Commercial',
        icon: <FileText className="h-6 w-6" />,
        gradient: 'from-blue-600 to-indigo-600'
    },

    // Tableurs
    {
        id: 'devis-electrique',
        type: 'spreadsheet',
        name: 'Devis Électrique',
        description: 'Calculs automatiques + formules métier',
        category: 'Commercial',
        icon: <Calculator className="h-6 w-6" />,
        gradient: 'from-green-500 to-emerald-500'
    },
    {
        id: 'planning-chantier',
        type: 'spreadsheet',
        name: 'Planning Chantier',
        description: 'Gantt + gestion ressources',
        category: 'Gestion',
        icon: <Table className="h-6 w-6" />,
        gradient: 'from-green-600 to-teal-600'
    },

    // Présentations
    {
        id: 'presentation-projet',
        type: 'presentation',
        name: 'Présentation Projet',
        description: 'Pitch client professionnel',
        category: 'Commercial',
        icon: <Presentation className="h-6 w-6" />,
        gradient: 'from-orange-500 to-red-500'
    },
    {
        id: 'formation-technique',
        type: 'presentation',
        name: 'Formation Technique',
        description: 'Support de formation animé',
        category: 'Formation',
        icon: <BarChart3 className="h-6 w-6" />,
        gradient: 'from-orange-600 to-pink-600'
    }
];

export function OfficeCreationMenu() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<'all' | 'document' | 'spreadsheet' | 'presentation'>('all');

    const documentTypes = [
        {
            type: 'document' as const,
            name: 'Document Texte',
            description: 'Rapports, lettres, notes',
            icon: <FileText className="h-8 w-8" />,
            gradient: 'from-blue-500 to-cyan-500',
            color: 'text-blue-600'
        },
        {
            type: 'spreadsheet' as const,
            name: 'Tableur',
            description: 'Calculs, devis, planning',
            icon: <Table className="h-8 w-8" />,
            gradient: 'from-green-500 to-emerald-500',
            color: 'text-green-600'
        },
        {
            type: 'presentation' as const,
            name: 'Présentation',
            description: 'Slides, pitch, formation',
            icon: <Presentation className="h-8 w-8" />,
            gradient: 'from-orange-500 to-red-500',
            color: 'text-orange-600'
        }
    ];

    const filteredTemplates = selectedType === 'all'
        ? templates
        : templates.filter(t => t.type === selectedType);

    const createBlank = (type: 'document' | 'spreadsheet' | 'presentation') => {
        setIsOpen(false);
        toast.success(`Création d'un nouveau ${type === 'presentation' ? 'support de présentation' : type === 'spreadsheet' ? 'tableur' : 'document'}...`);
        navigate(`/office/${type}/new`);
    };

    const createFromTemplate = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setIsOpen(false);
            toast.info(`Chargement du modèle "${template.name}"...`);
            navigate(`/office/${template.type}/template/${templateId}`);
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <Button
                    onClick={() => setIsOpen(true)}
                    className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl shadow-purple-500/50"
                    size="lg"
                >
                    <motion.div
                        className="absolute inset-0 bg-white"
                        initial={{ x: '-100%', opacity: 0.2 }}
                        animate={{ x: '100%' }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                    />
                    <Plus className="h-5 w-5 mr-2" />
                    <span className="font-bold">Nouveau Document</span>
                    <Sparkles className="h-4 w-4 ml-2" />
                </Button>
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                        >
                            <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden pointer-events-auto bg-white/95 backdrop-blur-xl border-2 border-purple-200 shadow-2xl">
                                {/* Header */}
                                <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
                                    <motion.div
                                        className="absolute inset-0 opacity-20"
                                        animate={{
                                            backgroundPosition: ['0% 0%', '100% 100%'],
                                        }}
                                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                        style={{
                                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                                            backgroundSize: '50px 50px'
                                        }}
                                    />

                                    <div className="relative flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <Crown className="h-8 w-8" />
                                                <h2 className="text-3xl font-black">PROQUELEC Office Suite</h2>
                                                <Badge className="bg-yellow-400 text-yellow-900 font-black">
                                                    <Zap className="h-3 w-3 mr-1" />
                                                    SOUVERAIN
                                                </Badge>
                                            </div>
                                            <p className="text-blue-100 font-medium">
                                                Créez des documents professionnels avec l'IA intégrée
                                            </p>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setIsOpen(false)}
                                            className="text-white hover:bg-white/20"
                                        >
                                            <X className="h-6 w-6" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                                    {/* Document Types */}
                                    <div className="mb-8">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-purple-600" />
                                            Documents Vierges
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {documentTypes.map((docType, index) => (
                                                <motion.div
                                                    key={docType.type}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                >
                                                    <Card
                                                        className="group relative overflow-hidden cursor-pointer border-2 border-gray-200 hover:border-purple-400 hover:shadow-2xl transition-all duration-300"
                                                        onClick={() => createBlank(docType.type)}
                                                    >
                                                        <div className={`absolute inset-0 bg-gradient-to-br ${docType.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />

                                                        <div className="p-6">
                                                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${docType.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                                                                {docType.icon}
                                                            </div>

                                                            <h4 className="text-xl font-bold text-gray-900 mb-2">
                                                                {docType.name}
                                                            </h4>

                                                            <p className="text-sm text-gray-600">
                                                                {docType.description}
                                                            </p>

                                                            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Plus className="h-4 w-4" />
                                                                Créer maintenant
                                                            </div>
                                                        </div>
                                                    </Card>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Templates */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                <FileCheck className="h-5 w-5 text-purple-600" />
                                                Templates Professionnels PROQUELEC
                                            </h3>

                                            <div className="flex gap-2">
                                                <Button
                                                    variant={selectedType === 'all' ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setSelectedType('all')}
                                                >
                                                    Tous
                                                </Button>
                                                <Button
                                                    variant={selectedType === 'document' ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setSelectedType('document')}
                                                >
                                                    Documents
                                                </Button>
                                                <Button
                                                    variant={selectedType === 'spreadsheet' ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setSelectedType('spreadsheet')}
                                                >
                                                    Tableurs
                                                </Button>
                                                <Button
                                                    variant={selectedType === 'presentation' ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setSelectedType('presentation')}
                                                >
                                                    Présentations
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <AnimatePresence mode="popLayout">
                                                {filteredTemplates.map((template, index) => (
                                                    <motion.div
                                                        key={template.id}
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                        transition={{ delay: index * 0.05 }}
                                                    >
                                                        <Card
                                                            className="group relative overflow-hidden cursor-pointer border-2 border-gray-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300"
                                                            onClick={() => createFromTemplate(template.id)}
                                                        >
                                                            <div className={`absolute inset-0 bg-gradient-to-br ${template.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />

                                                            <div className="p-5">
                                                                <div className="flex items-start justify-between mb-3">
                                                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.gradient} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                                                                        {template.icon}
                                                                    </div>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {template.category}
                                                                    </Badge>
                                                                </div>

                                                                <h4 className="font-bold text-gray-900 mb-1">
                                                                    {template.name}
                                                                </h4>

                                                                <p className="text-xs text-gray-600 mb-3">
                                                                    {template.description}
                                                                </p>

                                                                <div className="flex items-center gap-2 text-xs font-medium text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Sparkles className="h-3 w-3" />
                                                                    Utiliser ce template
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
