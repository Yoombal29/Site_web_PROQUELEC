
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { SEO } from "@/components/SEO";
import { materialsData, MaterialItem } from "@/data/materials";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Wrench, ChevronDown, ChevronRight, FileSpreadsheet } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const Tools = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Filter materials based on search term and selected category
    const filteredMaterials = Object.entries(materialsData).reduce((acc, [category, items]) => {
        if (selectedCategory && selectedCategory !== category) return acc;

        const filteredItems = items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.type.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filteredItems.length > 0) {
            acc[category] = filteredItems;
        }
        return acc;
    }, {} as Record<string, MaterialItem[]>);

    return (
        <div className="min-h-screen bg-slate-50">
            <SEO
                title="Outils & Base Matériaux - PROQUELEC"
                description="Accédez aux caractéristiques techniques détaillées des matériaux électriques (NF C33-209, Câbles, Coffrets) pour vos chantiers au Sénégal."
            />

            <Header />

            <main>
                <HeroSection
                    badge="Ressources Techniques"
                    title="Base de Données Matériaux"
                    subtitle="Caractéristiques techniques officielles"
                    description="Un outil complet pour consulter les fiches techniques des câbles, coffrets et accessoires conformes aux normes Senelec et internationales."
                    gradient="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"
                    showSearch={false}
                />

                <section className="py-12 px-4 md:px-6 lg:px-8 -mt-8 relative z-10">
                    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                            <div className="relative w-full md:w-1/2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    type="text"
                                    placeholder="Rechercher un matériel (ex: 2x16mm, coffret...)"
                                    className="pl-10 h-12 text-base"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                                <Button
                                    variant={selectedCategory === null ? "default" : "outline"}
                                    onClick={() => setSelectedCategory(null)}
                                    className="whitespace-nowrap"
                                >
                                    Tout voir
                                </Button>
                                {Object.keys(materialsData).map(category => (
                                    <Button
                                        key={category}
                                        variant={selectedCategory === category ? "default" : "outline"}
                                        onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                                        className="whitespace-nowrap"
                                    >
                                        {category}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {Object.keys(filteredMaterials).length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                <p>Aucun matériel trouvé pour cette recherche.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(filteredMaterials).map(([category, items]) => (
                                    <div key={category} className="mb-8 last:mb-0">
                                        <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2 border-b pb-2">
                                            <Wrench className="w-5 h-5" /> {category}
                                        </h3>

                                        <Accordion type="single" collapsible className="space-y-3">
                                            {items.map((item, index) => (
                                                <AccordionItem
                                                    key={index}
                                                    value={`${category}-${index}`}
                                                    className="border rounded-lg px-4 bg-slate-50 hover:bg-white transition-colors"
                                                >
                                                    <AccordionTrigger className="hover:no-underline py-4">
                                                        <div className="text-left">
                                                            <div className="font-semibold text-base">{item.name}</div>
                                                            <div className="text-sm text-gray-500 font-normal mt-1">{item.type}</div>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="pt-2 pb-4">
                                                        <div className="bg-white rounded-md border overflow-hidden">
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow className="bg-gray-50">
                                                                        <TableHead className="w-[40%]">Caractéristique</TableHead>
                                                                        <TableHead className="w-[15%]">Unité</TableHead>
                                                                        <TableHead className="w-[25%]">Valeur spécifiée</TableHead>
                                                                        <TableHead className="w-[20%]">Garantie</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {item.specifications.map((spec, idx) => (
                                                                        <TableRow key={idx} className="hover:bg-blue-50/30">
                                                                            <TableCell className="font-medium text-gray-700">{spec.caracteristique}</TableCell>
                                                                            <TableCell className="text-gray-500 text-xs">{spec.unite !== "_" ? spec.unite : "-"}</TableCell>
                                                                            <TableCell className="text-blue-900 font-medium">{spec.valeur_specifiee}</TableCell>
                                                                            <TableCell className="text-gray-500 text-sm">
                                                                                {spec.valeur_garantie || "-"}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Tools;
