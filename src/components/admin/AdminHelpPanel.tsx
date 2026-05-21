import React from 'react';
import {
  Card, CardContent, CardHeader, CardTitle } from
"@/components/ui/card";
import {
  BookOpen, FileText, Settings, Zap, BarChart3,
  ShieldCheck, ArrowRight, Save } from
'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const AdminHelpPanel = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 border-b pb-6">
                <div className="p-3 bg-proqblue/10 rounded-xl">
                    <BookOpen className="w-8 h-8 text-proqblue" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Guide d'utilisation du CMS</h1>
                    <p className="text-gray-500">Apprenez à maîtriser toutes les fonctionnalités de votre plateforme PROQUELEC.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow cursor-default">
                    <CardHeader className="pb-2">
                        <FileText className="w-5 h-5 text-blue-500 mb-2" />
                        <CardTitle className="text-lg">Gestion des Pages</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-600">
                        Structurez votre site en créant des pages dynamiques, des articles de blog ou des sections informatives.
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow cursor-default">
                    <CardHeader className="pb-2">
                        <Zap className="w-5 h-5 text-purple-500 mb-2" />
                        <CardTitle className="text-lg">IA & Automatisation</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-600">
                        Utilisez l'intelligence artificielle intégrée pour optimiser votre contenu et votre SEO.
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow cursor-default">
                    <CardHeader className="pb-2">
                        <ShieldCheck className="w-5 h-5 text-green-500 mb-2" />
                        <CardTitle className="text-lg">Sécurité & Robustesse</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-600">
                        Bénéficiez d'une validation stricte et d'un système de sauvegarde automatique anti-perte.
                    </CardContent>
                </Card>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
                {/* Section 1: Gestion du Contenu */}
                <AccordionItem value="content-mgmt" className="border rounded-lg bg-white px-4">
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                                <span className="font-bold text-gray-900 block">Gestion des Pages & Articles</span>
                                <span className="text-xs text-gray-500 font-normal">Création, édition et structure URL (slugs)</span>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 text-gray-700 space-y-4">
                        <p>Le panneau <strong>"Gestion des Pages"</strong> est le cœur de votre CMS. Voici comment l'utiliser :</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Création</strong> : Cliquez sur <em>"Créer une Nouvelle Page"</em>. Un titre et un slug unique (URL) sont obligatoires.</li>
                            <li><strong>Éditeur WYSIWYG</strong> : Utilisez la barre d'outils pour mettre en forme votre texte (Gras, Italique, Titres H1-H3).</li>
                            <li><strong>Slugs</strong> : Ils forment l'URL de votre page (ex: `/nos-services`). Ils doivent être en minuscules, sans espaces ni caractères spéciaux.</li>
                            <li><strong>Templates</strong> : Choisissez entre <em>"default"</em>, <em>"landing"</em> ou <em>"sidebar"</em> pour changer l'apparence visuelle de la page sans recoder.</li>
                        </ul>
                    </AccordionContent>
                </AccordionItem>

                {/* Section 2: Workflow & Publication */}
                <AccordionItem value="workflow" className="border rounded-lg bg-white px-4">
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                            <Settings className="w-5 h-5 text-orange-600" />
                            <div>
                                <span className="font-bold text-gray-900 block">Workflow de Publication</span>
                                <span className="text-xs text-gray-500 font-normal">États, révisions et mise en ligne</span>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 text-gray-700 space-y-4">
                        <p>Le système utilise un workflow à 4 étapes pour garantir la qualité du contenu :</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                            <div className="p-3 bg-gray-50 rounded border italic">
                                <span className="font-bold text-gray-400">1. Brouillon (Draft)</span> : La page est en cours de rédaction, invisible pour le public.
                            </div>
                            <div className="p-3 bg-blue-50 rounded border italic border-blue-100">
                                <span className="font-bold text-blue-500">2. En Révision (Review)</span> : Le contenu est prêt à être relu par un administrateur.
                            </div>
                            <div className="p-3 bg-yellow-50 rounded border italic border-yellow-100">
                                <span className="font-bold text-yellow-600">3. Approuvé (Approved)</span> : Validé techniquement, prêt pour la mise en ligne.
                            </div>
                            <div className="p-3 bg-green-50 rounded border italic border-green-100">
                                <span className="font-bold text-green-600">4. Publié (Published)</span> : La page est officiellement accessible via son URL.
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Section 3: Robustesse & Auto-save */}
                <AccordionItem value="robustness" className="border rounded-lg bg-white px-4">
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                            <Save className="w-5 h-5 text-green-600" />
                            <div>
                                <span className="font-bold text-gray-900 block">Sauvegarde & Récupération</span>
                                <span className="text-xs text-gray-500 font-normal">Anti-perte, versioning et réinitialisation</span>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 text-gray-700 space-y-4">
                        <div className="bg-green-50 border border-green-200 p-4 rounded-md flex gap-3">
                            <Zap className="w-6 h-6 text-green-600 shrink-0" />
                            <div>
                                <p className="font-bold text-green-800">Sauvegarde Automatique Actived</p>
                                <p className="text-sm text-green-700">Toutes les 2 secondes, votre travail est mémorisé localement dans votre navigateur.</p>
                            </div>
                        </div>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Restauration</strong> : En cas de coupure de courant ou rafraîchissement accidentel, cliquez sur <em>"Restaurer brouillon local"</em> dans le formulaire d'édition.</li>
                            <li><strong>Historique (Versioning)</strong> : Consultez l'onglet <em>"Historique"</em> pour voir les anciennes versions enregistrées sur le serveur et revenir en arrière si nécessaire.</li>
                            <li><strong>Réinitialisation d'urgence</strong> : Si le CMS affiche un écran blanc persistant, utilisez le bouton de réinitialisation qui apparaît après 3 échecs pour purger les caches corrompus.</li>
                        </ul>
                    </AccordionContent>
                </AccordionItem>

                {/* Section 4: AI & SEO */}
                <AccordionItem value="ai-seo" className="border rounded-lg bg-white px-4">
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                            <BarChart3 className="w-5 h-5 text-indigo-600" />
                            <div>
                                <span className="font-bold text-gray-900 block">Optimisation IA & SEO</span>
                                <span className="text-xs text-gray-500 font-normal">Analyse en temps réel et métadonnées</span>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4 text-gray-700 space-y-4">
                        <p>Le CMS intègre des algorithmes d'analyse pour améliorer votre visibilité :</p>
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                                <p><strong>Meta Description</strong> : Essentielle pour Google. Elle doit résumer la page en moins de 160 caractères.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                                <p><strong>Score de Lisibilité</strong> : Calcule la complexité de votre texte pour s'assurer qu'il est compréhensible par vos clients.</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2 shrink-0" />
                                <p><strong>Analytique Réelle</strong> : Contrairement aux anciennes versions simulées, les graphiques du dashboard montrent maintenant les vrais événements (clics, vues) capturés sur le site.</p>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <div className="bg-proqblue p-6 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                    <h3 className="text-xl font-bold">Besoin d'une assistance technique ?</h3>
                    <p className="text-blue-100 opacity-80">Notre support expert est disponible pour vous accompagner dans la configuration complexe de vos rubriques.</p>
                </div>
                <button className="px-6 py-3 bg-white text-proqblue font-bold rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 whitespace-nowrap">
                    Contacter le Support Expert
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            <footer className="text-center text-gray-400 text-sm pb-8">
                <p>© 2026 PROQUELEC - Système de Gestion de Contenu V4.0 (Robustness Edition)</p>
            </footer>
        </div>);

};

export default AdminHelpPanel;