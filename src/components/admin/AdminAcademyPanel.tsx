import { GraduationCap, Wand2, History, BookOpen, Settings, Library } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseGenerator } from './academy/CourseGenerator';
import { NormativeCourseGeneratorUI } from './academy/NormativeCourseGenerator';
import { CourseHistory } from './academy/CourseHistory';
import { AppStatus } from './academy/AppStatus';
import { UserGuide } from './academy/UserGuide';
import { NormExplorer } from './academy/NormExplorer';
import { NormativeQuizGenerator } from './academy/NormativeQuizGenerator';
import { ResourceLibrary } from './academy/ResourceLibrary';
import { BrainCircuit, FileText } from 'lucide-react';

export default function AdminAcademyPanel() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Académie PROQUELEC</h1>
                    <p className="text-muted-foreground">Génération de formations assistée par IA et conformité normative.</p>
                </div>
            </div>

            <Tabs defaultValue="generator" className="w-full">
                <TabsList className="grid w-full grid-cols-8 h-12 gap-1 rounded-xl bg-muted/20 p-1">
                    <TabsTrigger value="generator" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Wand2 className="h-4 w-4" />
                        <span className="hidden lg:inline">Générateur</span>
                    </TabsTrigger>
                    <TabsTrigger value="normative" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <GraduationCap className="h-4 w-4" />
                        <span className="hidden lg:inline">Normatif</span>
                    </TabsTrigger>
                    <TabsTrigger value="quiz" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-blue-700 bg-blue-50/50">
                        <BrainCircuit className="h-4 w-4" />
                        <span className="hidden lg:inline font-semibold">Quiz</span>
                    </TabsTrigger>
                    <TabsTrigger value="explorer" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-purple-700 bg-purple-50/50 data-[state=active]:text-purple-900 border border-purple-100/50">
                        <Library className="h-4 w-4" />
                        <span className="hidden lg:inline font-semibold">Explorateur</span>
                    </TabsTrigger>
                    <TabsTrigger value="resources" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-indigo-700 bg-indigo-50/50 data-[state=active]:text-indigo-900 border border-indigo-100/50">
                        <FileText className="h-4 w-4" />
                        <span className="hidden lg:inline font-semibold">Documents</span>
                    </TabsTrigger>
                    <TabsTrigger value="history" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <History className="h-4 w-4" />
                        <span className="hidden lg:inline">Historique</span>
                    </TabsTrigger>
                    <TabsTrigger value="status" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Settings className="h-4 w-4" />
                        <span className="hidden lg:inline">Système</span>
                    </TabsTrigger>
                    <TabsTrigger value="guide" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <BookOpen className="h-4 w-4" />
                        <span className="hidden lg:inline">Guide</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="generator" className="mt-6">
                    <CourseGenerator />
                </TabsContent>

                <TabsContent value="normative" className="mt-6">
                    <NormativeCourseGeneratorUI />
                </TabsContent>

                <TabsContent value="explorer" className="mt-6">
                    <NormExplorer />
                </TabsContent>

                <TabsContent value="quiz" className="mt-6">
                    <NormativeQuizGenerator />
                </TabsContent>

                <TabsContent value="resources" className="mt-6">
                    <ResourceLibrary />
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    <CourseHistory />
                </TabsContent>

                <TabsContent value="status" className="mt-6">
                    <AppStatus />
                </TabsContent>

                <TabsContent value="guide" className="mt-6">
                    <UserGuide />
                </TabsContent>
            </Tabs>
        </div>
    );
}
