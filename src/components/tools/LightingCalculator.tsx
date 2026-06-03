import React, { useState } from 'react';

interface LightingResult {
  lux: number;
  lumens: number;
  area: number;
  adequacy: 'poor' | 'fair' | 'good' | 'excellent';
  recommendation: string;
}

export default function LightingCalculator() {
  const [area, setArea] = useState<string>('');
  const [lumens, setLumens] = useState<string>('');
  const [result, setResult] = useState<LightingResult | null>(null);

  // Recommended lux levels by room type
  const luxRecommendations: { [key: string]: { min: number; ideal: number; description: string } } = {
    bedroom: { min: 50, ideal: 100, description: 'Chambre à coucher' },
    living_room: { min: 150, ideal: 300, description: 'Salon' },
    kitchen: { min: 300, ideal: 500, description: 'Cuisine' },
    bathroom: { min: 200, ideal: 400, description: 'Salle de bains' },
    office: { min: 400, ideal: 750, description: 'Bureau / Espace de travail' },
    workshop: { min: 500, ideal: 1000, description: 'Atelier' },
    warehouse: { min: 200, ideal: 500, description: 'Entrepôt' },
    retail: { min: 500, ideal: 1000, description: 'Magasin' }
  };

  const calculateLux = () => {
    const areaNum = parseFloat(area);
    const lumensNum = parseFloat(lumens);

    if (isNaN(areaNum) || isNaN(lumensNum) || areaNum <= 0 || lumensNum <= 0) {
      alert('Veuillez entrer des valeurs valides et positives');
      return;
    }

    const lux = lumensNum / areaNum;

    // Determine adequacy
    let adequacy: LightingResult['adequacy'] = 'poor';
    let recommendation = '';

    if (lux < 50) {
      adequacy = 'poor';
      recommendation = 'Éclairement insuffisant - Risque de fatigue oculaire';
    } else if (lux < 150) {
      adequacy = 'fair';
      recommendation = 'Éclairement faible - À améliorer selon l\'utilisation';
    } else if (lux < 500) {
      adequacy = 'good';
      recommendation = 'Éclairement correct pour la plupart des usages résidentiels';
    } else {
      adequacy = 'excellent';
      recommendation = 'Éclairement excellent - Adapté aux espaces de travail';
    }

    setResult({
      lux: Math.round(lux * 10) / 10,
      lumens: lumensNum,
      area: areaNum,
      adequacy,
      recommendation
    });
  };

  const reset = () => {
    setArea('');
    setLumens('');
    setResult(null);
  };

  const applyRecommendation = (luxLevel: number) => {
    const lumensNum = parseFloat(lumens);
    if (!isNaN(lumensNum) && lumensNum > 0) {
      const calculatedArea = (lumensNum / luxLevel).toFixed(1);
      setArea(calculatedArea);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <i className="fas fa-lightbulb text-green-600 text-lg"></i>
        </div>
        <h3 className="text-xl font-semibold text-green-700">
          Calculateur d'éclairage (Lux / m²)
        </h3>
      </div>

      <div className="space-y-4">
        {/* Area Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Surface de la pièce (m²)
          </label>
          <input
            type="number"
            min="1"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="Ex: 30"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            aria-label="Surface en mètres carrés"
          />
        </div>

        {/* Lumens Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Flux lumineux total des lampes (lumens)
          </label>
          <input
            type="number"
            min="1"
            value={lumens}
            onChange={(e) => setLumens(e.target.value)}
            placeholder="Ex: 3000"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            aria-label="Lumens totaux des lampes"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Tip: Vous trouvez le nombre de lumens sur les emballages des ampoules
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-4">
          <button
            onClick={calculateLux}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            aria-label="Calculer l'éclairement en lux"
          >
            <i className="fas fa-calculator mr-2"></i>Calculer
          </button>
          <button
            onClick={reset}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
            aria-label="Réinitialiser le calculateur"
          >
            <i className="fas fa-redo mr-2"></i>Réinitialiser
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-4 space-y-4">
            {/* Main Result Box */}
            <div className={`p-4 rounded-lg border-l-4 ${
              result.adequacy === 'excellent'
                ? 'bg-green-50 border-green-400'
                : result.adequacy === 'good'
                ? 'bg-blue-50 border-blue-400'
                : result.adequacy === 'fair'
                ? 'bg-yellow-50 border-yellow-400'
                : 'bg-red-50 border-red-400'
            }`}>
              <div className="text-3xl font-bold mb-2">
                {result.lux} <span className="text-lg">lux</span>
              </div>
              <p className="text-sm font-medium mb-2">{result.recommendation}</p>
              <div className="text-xs space-y-1">
                <p>Surface : <strong>{result.area} m²</strong></p>
                <p>Flux lumineux : <strong>{result.lumens} lumens</strong></p>
              </div>
            </div>

            {/* Adequacy Scale */}
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-semibold text-gray-800 mb-3">Échelle d'éclairement (lux)</h4>
              <div className="space-y-2">
                {[
                  { level: 'poor', min: 0, max: 50, label: '❌ Insuffisant', color: 'bg-red-300' },
                  { level: 'fair', min: 50, max: 150, label: '⚠️ Faible', color: 'bg-yellow-300' },
                  { level: 'good', min: 150, max: 500, label: '✅ Bon', color: 'bg-blue-300' },
                  { level: 'excellent', min: 500, max: 1000, label: '⭐ Excellent', color: 'bg-green-300' }
                ].map(({ level, min, max, label, color }) => (
                  <div key={level} className="flex items-center justify-between text-xs">
                    <span>{min} - {max} lux</span>
                    <span className={`${color} px-3 py-1 rounded-full font-medium`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations by Room Type */}
        <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-3">
            <i className="fas fa-home mr-2"></i>Niveaux d'éclairage recommandés par pièce
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(luxRecommendations).map(([key, rec]) => (
              <div key={key} className="p-2 bg-white rounded border text-xs">
                <div className="font-medium text-gray-800">{rec.description}</div>
                <div className="text-gray-600">Idéal : {rec.ideal} lux</div>
                <button
                  onClick={() => applyRecommendation(rec.ideal)}
                  className="mt-1 text-green-600 hover:text-green-800 underline text-xs font-medium"
                >
                  Appliquer cette valeur →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Formula Box */}
        <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-calculator text-green-600"></i>
            <span className="font-semibold text-green-800">Formule de calcul :</span>
          </div>
          <div className="text-green-900 font-mono text-sm">
            Lux = Lumens / Surface (m²)
          </div>
          <div className="text-xs text-green-700 mt-2">
            Lux : éclairement lumineux en lumen par mètre carré (lm/m²)
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">
            <i className="fas fa-info-circle mr-2"></i>Comment choisir l'éclairage ?
          </h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc pl-5">
            <li>Vérifiez le nombre de lumens sur les emballages d'ampoules LED/CFL</li>
            <li>Mesurez la surface de votre pièce en m²</li>
            <li>Une ampoule LED de 10W = environ 800-1000 lumens</li>
            <li>Préférez les LED pour l'efficacité énergétique (moins d'électricité, plus de lumière)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
