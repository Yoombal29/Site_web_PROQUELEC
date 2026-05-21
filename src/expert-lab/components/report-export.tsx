import { useState } from "react";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter } from
"@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import {
  FileText,
  Download,



  Shield,



  Loader2 } from
"lucide-react";
import { useToast } from "@/hooks/use-toast";

type Message = {role: "user" | "assistant";content: string;images?: string[];};

interface ReportExportProps {
  messages: Message[];
  calculationResults?: unknown;
}

export function ReportExport({ messages, calculationResults }: ReportExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState({
    projectName: "",
    clientName: "",
    location: "",
    inspector: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    reportType: "inspection"
  });
  const { toast } = useToast();

  const generatePDFContent = () => {
    const timestamp = new Date().toLocaleString("fr-FR");

    // Extract key information from conversation
    const technicalContent = messages.
    filter((m) => m.role === "assistant").
    map((m) => m.content).
    join("\n\n---\n\n");

    // Extract compliance status from content
    const hasConformity = technicalContent.includes("✅") || technicalContent.includes("CONFORME");
    const hasWarning = technicalContent.includes("⚠️") || technicalContent.includes("AVERTISSEMENT");
    const hasError = technicalContent.includes("❌") || technicalContent.includes("NON-CONFORME");

    const overallStatus = hasError ? "NON CONFORME" : hasWarning ? "AVEC RÉSERVES" : "CONFORME";
    const statusIcon = hasError ? "❌" : hasWarning ? "⚠️" : "✅";

    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport YEAI - ${reportData.projectName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', sans-serif;
      background: #f8fafc;
      color: #1e293b;
      line-height: 1.6;
    }
    
    .container {
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      padding: 40px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #10b981;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #10b981, #06b6d4);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
    }
    
    .logo-text h1 {
      font-size: 24px;
      font-weight: 900;
      color: #10b981;
    }
    
    .logo-text span {
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .meta {
      text-align: right;
      font-size: 11px;
      color: #64748b;
    }
    
    .meta strong { color: #1e293b; }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      margin: 20px 0;
    }
    
    .status-conforme { background: #d1fae5; color: #065f46; border: 2px solid #10b981; }
    .status-reserves { background: #fef3c7; color: #92400e; border: 2px solid #f59e0b; }
    .status-non-conforme { background: #fee2e2; color: #991b1b; border: 2px solid #ef4444; }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin: 30px 0;
    }
    
    .info-card {
      background: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #10b981;
    }
    
    .info-card label {
      font-size: 10px;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 1px;
    }
    
    .info-card p {
      font-weight: 600;
      color: #1e293b;
      margin-top: 4px;
    }
    
    .section {
      margin: 30px 0;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      color: #10b981;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .content-block {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      font-size: 12px;
      white-space: pre-wrap;
      border: 1px solid #e2e8f0;
    }
    
    .message {
      margin-bottom: 16px;
      padding: 12px;
      border-radius: 8px;
    }
    
    .message-user {
      background: #ede9fe;
      border-left: 4px solid #8b5cf6;
    }
    
    .message-assistant {
      background: #ecfdf5;
      border-left: 4px solid #10b981;
    }
    
    .message-role {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 8px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      font-size: 10px;
      color: #64748b;
    }
    
    .signature-block {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 40px;
      margin: 40px 0;
    }
    
    .signature {
      border-top: 2px solid #1e293b;
      padding-top: 8px;
      text-align: center;
    }
    
    .signature label {
      font-size: 10px;
      color: #64748b;
    }
    
    @media print {
      .container { padding: 20px; }
      .content-block { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">⚡</div>
        <div class="logo-text">
          <h1>YEAI</h1>
          <span>Industrial Intelligence Engine</span>
        </div>
      </div>
      <div class="meta">
        <p><strong>Rapport N°:</strong> YEAI-${Date.now()}</p>
        <p><strong>Date:</strong> ${new Date(reportData.date).toLocaleDateString("fr-FR")}</p>
        <p><strong>Généré le:</strong> ${timestamp}</p>
      </div>
    </div>
    
    <h2 style="font-size: 20px; margin-bottom: 8px;">${reportData.reportType === "inspection" ? "Rapport de Contrôle Technique" : reportData.reportType === "calculation" ? "Note de Calcul" : "Rapport d'Analyse"}</h2>
    <p style="color: #64748b; font-size: 12px; margin-bottom: 20px;">Conformité NF C 15-100 / IEC 60364</p>
    
    <div class="status-badge ${overallStatus === 'CONFORME' ? 'status-conforme' : overallStatus === 'AVEC RÉSERVES' ? 'status-reserves' : 'status-non-conforme'}">
      ${statusIcon} STATUT GLOBAL: ${overallStatus}
    </div>
    
    <div class="info-grid">
      <div class="info-card">
        <label>Projet</label>
        <p>${reportData.projectName || "Non spécifié"}</p>
      </div>
      <div class="info-card">
        <label>Client</label>
        <p>${reportData.clientName || "Non spécifié"}</p>
      </div>
      <div class="info-card">
        <label>Localisation</label>
        <p>${reportData.location || "Non spécifié"}</p>
      </div>
      <div class="info-card">
        <label>Inspecteur</label>
        <p>${reportData.inspector || "YEAI Automated System"}</p>
      </div>
    </div>
    
    <div class="section">
      <h3 class="section-title">📋 Échanges Techniques</h3>
      ${messages.map((m) => `
        <div class="message ${m.role === 'user' ? 'message-user' : 'message-assistant'}">
          <div class="message-role">${m.role === 'user' ? '👤 Utilisateur' : '🤖 YEAI'}</div>
          <div>${m.content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>
        </div>
      `).join('')}
    </div>
    
    ${reportData.notes ? `
    <div class="section">
      <h3 class="section-title">📝 Notes & Observations</h3>
      <div class="content-block">${reportData.notes}</div>
    </div>
    ` : ''}
    
    <div class="signature-block">
      <div class="signature">
        <label>Signature Contrôleur</label>
      </div>
      <div class="signature">
        <label>Signature Client</label>
      </div>
    </div>
    
    <div class="footer">
      <p>Document généré automatiquement par YEAI Industrial OS v7.3</p>
      <p>Référentiels: NF C 15-100 (2024) • UTE C 15-105 • IEC 60364</p>
      <p style="margin-top: 8px; color: #94a3b8;">Ce document est un rapport technique et ne se substitue pas à un contrôle officiel CONSUEL/COSSUEL.</p>
    </div>
  </div>
</body>
</html>
    `;

    return htmlContent;
  };

  const handleExport = async () => {
    setIsGenerating(true);

    try {
      const htmlContent = generatePDFContent();

      // Create a new window for print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Wait for content to load then print
        printWindow.onload = () => {
          printWindow.print();
        };
      }

      toast({ title: "Rapport Généré", description: "Utilisez Ctrl+P pour sauvegarder en PDF" });
      setIsOpen(false);
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de générer le rapport", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="h-8 gap-2 bg-amber-500 hover:bg-amber-400 text-black border border-amber-600 shadow-[0_0_15px_-4px_rgba(245,158,11,0.6)] transition-all">
          <FileText className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-wider">Export Rapport</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="glass bg-black/95 border-amber-500/30 max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="font-black uppercase">Générer Rapport PDF</span>
              <p className="text-[10px] text-zinc-500 font-normal mt-0.5">Format professionnel NF C 15-100</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-black text-zinc-400">Type de Rapport</Label>
              <Select value={reportData.reportType} onValueChange={(v) => setReportData({ ...reportData, reportType: v })}>
                <SelectTrigger className="glass h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass bg-black/90">
                  <SelectItem value="inspection">Contrôle Technique</SelectItem>
                  <SelectItem value="calculation">Note de Calcul</SelectItem>
                  <SelectItem value="analysis">Analyse de Conformité</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-black text-zinc-400">Date</Label>
              <Input
                type="date"
                value={reportData.date}
                onChange={(e) => setReportData({ ...reportData, date: e.target.value })}
                className="glass h-9" />
              
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase font-black text-zinc-400">Nom du Projet</Label>
            <Input
              value={reportData.projectName}
              onChange={(e) => setReportData({ ...reportData, projectName: e.target.value })}
              className="glass h-9"
              placeholder="Ex: Installation électrique Villa Dupont" />
            
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-black text-zinc-400">Client</Label>
              <Input
                value={reportData.clientName}
                onChange={(e) => setReportData({ ...reportData, clientName: e.target.value })}
                className="glass h-9"
                placeholder="Nom du client" />
              
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-black text-zinc-400">Inspecteur</Label>
              <Input
                value={reportData.inspector}
                onChange={(e) => setReportData({ ...reportData, inspector: e.target.value })}
                className="glass h-9"
                placeholder="Nom de l'inspecteur" />
              
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase font-black text-zinc-400">Localisation</Label>
            <Input
              value={reportData.location}
              onChange={(e) => setReportData({ ...reportData, location: e.target.value })}
              className="glass h-9"
              placeholder="Adresse du chantier" />
            
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase font-black text-zinc-400">Notes additionnelles</Label>
            <Textarea
              value={reportData.notes}
              onChange={(e) => setReportData({ ...reportData, notes: e.target.value })}
              className="glass h-20 resize-none"
              placeholder="Observations, remarques..." />
            
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <p className="text-[10px] text-amber-400 flex items-center gap-2">
              <Shield className="w-3 h-3" />
              <span>Le rapport inclura {messages.length} messages et l'analyse de conformité complète.</span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} className="glass">
            Annuler
          </Button>
          <Button onClick={handleExport} disabled={isGenerating} className="bg-amber-500 hover:bg-amber-600 text-black font-black">
            {isGenerating ?
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Génération...</> :

            <><Download className="w-4 h-4 mr-2" /> Générer PDF</>
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}