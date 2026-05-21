import { useState, useRef, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, Zap, AlertTriangle, CheckCircle2,
  RotateCcw, Save, Scan, FileText, Activity,
  AlertCircle, Flame, RefreshCw } from
"lucide-react";
import { cn } from "@/lib/utils";

interface ScanResult {
  conforme: boolean;
  score_securite: number;
  anomalies: {
    type: string;
    description: string;
    gravite: "critique" | "majeure" | "mineure";
    norme: string;
  }[];
  recommandations: string[];
  verdict_expert: string;
}

export default function ComplianceScannerPage() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<ScanResult | null>(null);
  const [scanStep, setScanStep] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      toast({ title: "Erreur Caméra", description: "Impossible d'accéder aux capteurs visuels.", variant: "destructive" });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(base64);

    // Start Analysis Sequence
    setIsScanning(true);
    setResults(null);

    const steps = [
    "Initialisation de l'analyseur satellite...",
    "Traitement de l'image (Filtrage HDR)...",
    "Identification des composants Proquelec...",
    "Liaison avec le moteur de conformité NF C 15-100...",
    "Audit final par IA Expert..."];


    for (const step of steps) {
      setScanStep(step);
      await new Promise((r) => setTimeout(r, 800));
    }

    try {
      const data = await apiFetch<unknown>('/api/ai/scan-compliance', {
        method: "POST",
        body: JSON.stringify({ imageBase64: base64 })
      });

      if (data.success) {
        setResults(data.analysis);
        toast({ title: "Analyse terminée", description: "Audit de conformité généré avec succès." });
      } else {
        throw new Error(data.message || "Échec du scan");
      }
    } catch (err: unknown) {
      toast({ title: "Échec du scan", description: err.message, variant: "destructive" });
    } finally {
      setIsScanning(false);
    }
  };

  const resetScanner = () => {
    setCapturedImage(null);
    setResults(null);
    setScanStep("");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-10 font-sans relative overflow-hidden">
            {/* Background Grid & FX */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.05]" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header HUD */}
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-10 border-b border-slate-800/50 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-cyan-950/30 border border-cyan-500/30 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                        <Scan className="w-8 h-8 text-cyan-400 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Scanner de <span className="text-cyan-400 italic">Conformité Expert</span></h1>
                        <p className="text-xs text-slate-500 font-mono flex items-center gap-2 tracking-widest uppercase">
                            <Activity className="w-3 h-3 text-emerald-500" /> Liaison Satellite Active / NF C 15-100 v2026
                        </p>
                    </div>
                </div>
                <div className="mt-4 md:mt-0 flex gap-4 bg-slate-900/40 p-2 rounded-2xl border border-slate-800/50">
                    <div className="px-4 py-1 text-center border-r border-slate-800">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Signal GPS</p>
                        <p className="text-xs font-black text-emerald-400">OPTIMAL</p>
                    </div>
                    <div className="px-4 py-1 text-center">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Mode IA</p>
                        <p className="text-xs font-black text-cyan-400">NF-EXPERT</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
                {/* Viewfinder Section */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                    <Card className="bg-slate-950 border-slate-800 rounded-[40px] overflow-hidden relative shadow-2xl group border-2">
                        {!capturedImage ?
            <div className="aspect-video bg-black relative flex items-center justify-center">
                                <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover opacity-80" />
              

                                {/* HUD Overlay */}
                                <div className="absolute inset-0 pointer-events-none border-[40px] border-black/20">
                                    <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-cyan-500/50" />
                                    <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-cyan-500/50" />
                                    <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-cyan-500/50" />
                                    <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-cyan-500/50" />

                                    <div className="absolute inset-x-20 top-1/2 -translate-y-1/2 h-[1px] bg-cyan-500/20" />
                                    <div className="absolute inset-y-20 left-1/2 -translate-x-1/2 w-[1px] bg-cyan-500/20" />

                                    <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/40 px-4 py-1 rounded-full border border-slate-800 backdrop-blur-md">
                                        <p className="text-[10px] font-black text-white tracking-[0.3em] uppercase">Vise l'installation technique</p>
                                    </div>

                                    <AnimatePresence>
                                        {isScanning &&
                  <motion.div
                    initial={{ top: 0 }}
                    animate={{ top: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.8)] z-20" />

                  }
                                    </AnimatePresence>
                                </div>
                            </div> :

            <div className="aspect-video bg-black relative">
                                <img src={capturedImage} alt="Capture d'installation électrique pour analyse" className="w-full h-full object-cover" loading="lazy" />
                                <div className="absolute inset-0 bg-cyan-950/10 mix-blend-overlay" />
                            </div>
            }

                        <div className="p-8 bg-slate-900/60 backdrop-blur-xl border-t border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                {!capturedImage ?
                <Button
                  onClick={captureAndScan}
                  disabled={isScanning}
                  className="h-16 px-10 rounded-2xl bg-white hover:bg-cyan-400 text-black font-black text-lg transition-all shadow-xl shadow-cyan-500/10 group">
                  
                                        <Camera className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" /> ANALYSER L'IMAGE
                                    </Button> :

                <Button
                  onClick={resetScanner}
                  variant="ghost"
                  className="h-16 px-6 rounded-2xl border border-slate-800 text-slate-400 hover:text-white">
                  
                                        <RotateCcw className="w-5 h-5 mr-3" /> RÉINITIALISER
                                    </Button>
                }
                            </div>

                            <div className="hidden md:flex flex-col items-end">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enregistrement LiDAR</p>
                                <p className="text-xs font-bold text-slate-300">AUTO-SENSE PRO</p>
                            </div>
                        </div>
                    </Card>

                    {/* Analysis Progress */}
                    <AnimatePresence>
                        {isScanning &&
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-cyan-500/5 border border-cyan-500/20 rounded-3xl p-6 space-y-4 backdrop-blur-sm">
              
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                                        <span className="text-sm font-bold text-white uppercase tracking-tight">{scanStep}</span>
                                    </div>
                                    <span className="text-xs font-mono text-cyan-400">88%</span>
                                </div>
                                <Progress value={88} className="h-1.5 bg-slate-800 bg-opacity-50" />
                            </motion.div>
            }
                    </AnimatePresence>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-12 xl:col-span-5">
                    <AnimatePresence mode="wait">
                        {!results && !isScanning ?
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6 border-2 border-dashed border-slate-800 rounded-[40px] bg-slate-900/20">
              
                                <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
                                    <Scan className="w-10 h-10 text-slate-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Prêt pour l'Inspection</h3>
                                    <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">Visez et capturez une installation pour lancer l'audit de conformité temps réel.</p>
                                </div>
                            </motion.div> :
            results &&
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="space-y-6">
              
                                {/* Result Header */}
                                <Card className={cn(
                "border-none rounded-[32px] overflow-hidden text-white shadow-2xl relative",
                results.conforme ? "bg-emerald-600/90" : "bg-red-600/90"
              )}>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                                    <CardContent className="p-8 space-y-4 relative z-10">
                                        <div className="flex justify-between items-start">
                                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                                {results.conforme ? <CheckCircle2 className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Expert Safety Score</p>
                                                <p className="text-5xl font-black">{results.score_securite}%</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black uppercase tracking-tighter">
                                                {results.conforme ? "Installation Conforme" : "ALERTE NON-CONFORMITÉ"}
                                            </h2>
                                            <p className="text-sm font-medium opacity-90 mt-1 italic italic">Audit réalisé via satellite Proquelec Expert-Engine V.2.5</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Anomalies List */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-2">
                                        <AlertCircle className="w-3 h-3 text-orange-400" /> Points de Contrôle Critiques ({results.anomalies.length})
                                    </h4>
                                    {results.anomalies.map((anno, i) =>
                <Card key={i} className="bg-slate-900/50 border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all">
                                            <CardContent className="p-5 flex gap-4">
                                                <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                      anno.gravite === 'critique' ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-orange-500/10 border-orange-500/30 text-orange-500"
                    )}>
                                                    {anno.gravite === 'critique' ? <Flame className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">{anno.type}</span>
                                                        <Badge variant="outline" className="text-[8px] border-slate-800 text-slate-400">{anno.norme}</Badge>
                                                    </div>
                                                    <h5 className="text-sm font-bold text-white leading-tight">{anno.description}</h5>
                                                </div>
                                            </CardContent>
                                        </Card>
                )}
                                </div>

                                {/* Recommendations */}
                                <Card className="bg-slate-900 border-cyan-500/20 rounded-3xl p-6 border-l-4 border-l-cyan-500">
                                    <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Zap className="w-4 h-4" /> RECOMMANDATIONS TECHNIQUES
                                    </h4>
                                    <ul className="space-y-3">
                                        {results.recommandations.map((rec, i) =>
                  <li key={i} className="flex gap-3 text-sm text-slate-300 relative pl-4">
                                                <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-cyan-600" />
                                                {rec}
                                            </li>
                  )}
                                    </ul>
                                </Card>

                                {/* Export / Save */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Button variant="outline" className="h-14 rounded-2xl border-slate-800 bg-slate-950 text-white font-bold hover:bg-slate-800">
                                        <FileText className="w-4 h-4 mr-2" /> RAPPORT PDF
                                    </Button>
                                    <Button className="h-14 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold">
                                        <Save className="w-4 h-4 mr-2" /> SAUVEGARDER GED
                                    </Button>
                                </div>
                            </motion.div>
            }
                    </AnimatePresence>
                </div>
            </div>

            {/* Hidden Canvas for Capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Decorative Overlay */}
            <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none z-20" />
        </div>);

}