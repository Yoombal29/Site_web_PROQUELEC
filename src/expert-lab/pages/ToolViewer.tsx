import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { freeApps, premiumApps } from '@/data/applications-catalog';
import YEAISenegal from '@/components/tools/YEAISenegal';
import VoltageDropCalculator from '@/components/tools/VoltageDropCalculator';
import ConsumptionCalculator from '@/components/tools/ConsumptionCalculator';
import CableSizingTool from '@/components/tools/CableSizingTool';
import SolarSizingTool from '@/components/tools/SolarSizingTool';
import SafetyDiagnostic from '@/components/tools/SafetyDiagnostic';
import SafetyChecklist from '@/components/tools/SafetyChecklist';
import QuoteGenerator from '@/components/tools/QuoteGenerator';
import LabelRequestForm from '@/components/tools/LabelRequestForm';
import GroundingGuide from '@/components/tools/GroundingGuide';
import NormativeDatabase from '@/components/tools/NormativeDatabase';
import FAQNormes from '@/components/tools/FAQNormes';
import GlossaireElectrique from '@/components/tools/GlossaireElectrique';
import EarthResistanceChecker from '@/components/tools/EarthResistanceChecker';
import ElectricalUnitConverter from '@/components/tools/ElectricalUnitConverter';
import LightingCalculator from '@/components/tools/LightingCalculator';
import OperationalToolSuite, { hasOperationalTool } from '@/components/tools/OperationalToolSuite';

const allApps = [...freeApps, ...premiumApps];

export default function ToolViewer() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();

  const app = allApps.find((a) => a.id === toolId);

  if (!app) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Outil introuvable</h1>
          <p className="text-slate-400 mb-6">L'outil "{toolId}" n'existe pas.</p>
          <Button onClick={() => navigate('/expert-lab')} variant="outline" className="border-slate-600 text-slate-300">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au Hub
          </Button>
        </div>
      </div>
    );
  }

  const renderTool = () => {
    switch (toolId) {
      case 'sovereign-ai':
        return <YEAISenegal />;
      case 'eng-calcs':
        return <VoltageDropCalculator />;
      case 'verif-mise-terre':
        return <EarthResistanceChecker />;
      case 'convertisseur-unites':
        return <ElectricalUnitConverter />;
      case 'simulateur-consommation':
        return <ConsumptionCalculator />;
      case 'diagnostic-securite':
        return <SafetyDiagnostic />;
      case 'checklist-securite':
        return <SafetyChecklist />;
      case 'dimensionnement-cables':
        return <CableSizingTool />;
      case 'dimensionnement-solaire':
        return <SolarSizingTool />;
      case 'calcul-puissance':
        return <OperationalToolSuite toolId="calcul-puissance" />;
      case 'generateur-devis':
        return <QuoteGenerator />;
      case 'faq-normes':
        return <FAQNormes />;
      case 'glossaire-electrique':
        return <GlossaireElectrique />;
      case 'label-qualite':
        return <LabelRequestForm />;
      case 'guide-terre-differentiel':
        return <GroundingGuide />;
      case 'base-normative':
        return <NormativeDatabase />;
      case 'calcul-eclairage':
        return <LightingCalculator />;
      default:
        if (hasOperationalTool(toolId)) {
          return <OperationalToolSuite toolId={toolId} />;
        }
        return (
          <div className="text-center py-20">
            <h2 className="text-xl font-bold text-white mb-2">{app.title}</h2>
            <p className="text-slate-400">{app.description}</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#111827]">
      <div className="container mx-auto px-4 md:px-6 py-6">
        <button
          onClick={() => navigate('/expert-lab')}
          className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au Hub
        </button>
        <div className="max-w-5xl mx-auto">
          {renderTool()}
        </div>
      </div>
    </div>
  );
}
