import React, { useState } from 'react';

interface EarthComplianceResult {
  compliant: boolean;
  uc: number;
  ul: number;
  message: string;
}

export default function EarthResistanceChecker() {
  const [earthResistance, setEarthResistance] = useState<string>('');
  const [diffSensitivity, setDiffSensitivity] = useState<number>(30);
  const [zone, setZone] = useState<number>(50);
  const [result, setResult] = useState<EarthComplianceResult | null>(null);

  const checkCompliance = () => {
    const r = parseFloat(earthResistance);
    
    if (isNaN(r) || r < 0) {
      setResult({
        compliant: false,
        uc: 0,
        ul: zone,
        message: '❌ Veuillez entrer une résistance de terre valide (en Ω)'
      });
      return;
    }

    // Convert mA to A
    const iDelta = diffSensitivity / 1000;
    
    // Calculate contact voltage: Uc = Rterre × IΔn
    const uc = r * iDelta;
    
    // Check compliance
    const compliant = uc <= zone;
    
    const message = compliant
      ? `✅ Conforme : Uc = ${r} Ω × ${iDelta} A = ${uc.toFixed(2)} V ≤ ${zone} V (limite)`
      : `❌ Non conforme : Uc = ${r} Ω × ${iDelta} A = ${uc.toFixed(2)} V > ${zone} V (dépassement !)`;

    setResult({
      compliant,
      uc,
      ul: zone,
      message
    });
  };

  const reset = () => {
    setEarthResistance('');
    setDiffSensitivity(30);
    setZone(50);
    setResult(null);
  };

  return (
    <div className="bg-white rounded-xl p-6 border shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <i className="fas fa-shield-alt text-blue-600 text-lg"></i>
        </div>
        <h3 className="text-xl font-semibold text-blue-700">
          Vérificateur de conformité des prises de terre
        </h3>
      </div>

      <div className="space-y-4">
        {/* Resistance Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Résistance de terre mesurée (Ω)
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={earthResistance}
            onChange={(e) => setEarthResistance(e.target.value)}
            placeholder="Ex: 20"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            aria-label="Résistance de terre mesurée en ohms"
          />
        </div>

        {/* Differential Sensitivity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sensibilité du différentiel (IΔn en mA)
          </label>
          <select
            value={diffSensitivity}
            onChange={(e) => setDiffSensitivity(parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            aria-label="Sensibilité du différentiel"
          >
            <option value="30">30 mA (usage courant - protection personnelle)</option>
            <option value="100">100 mA</option>
            <option value="300">300 mA</option>
            <option value="500">500 mA</option>
          </select>
        </div>

        {/* Installation Zone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zone d'installation
          </label>
          <select
            value={zone}
            onChange={(e) => setZone(parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            aria-label="Zone d'installation"
          >
            <option value="50">Zone Sèche (Salon, chambre, etc. - UL = 50 V)</option>
            <option value="25">Zone Humide (Salle de bains, cuisine, etc. - UL = 25 V)</option>
            <option value="12">Zone Immergée (Piscine, spa, etc. - UL = 12 V)</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-4">
          <button
            onClick={checkCompliance}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            aria-label="Vérifier la conformité de la prise de terre"
          >
            <i className="fas fa-check mr-2"></i>Vérifier la conformité
          </button>
          <button
            onClick={reset}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
            aria-label="Réinitialiser le vérificateur"
          >
            <i className="fas fa-redo mr-2"></i>Réinitialiser
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className={`mt-4 p-4 rounded-lg border-l-4 ${
            result.compliant
              ? 'bg-green-50 border-green-400 text-green-800'
              : 'bg-red-50 border-red-400 text-red-800'
          }`}>
            <div className="font-semibold mb-2">{result.message}</div>
            <div className="text-sm">
              <p>Tension de contact (Uc) : <strong>{result.uc.toFixed(2)} V</strong></p>
              <p>Limite autorisée (UL) : <strong>{result.ul} V</strong></p>
            </div>
          </div>
        )}

        {/* Formula Box */}
        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-calculator text-blue-600"></i>
            <span className="font-semibold text-blue-800">Formule de calcul :</span>
          </div>
          <div className="text-blue-900 font-mono text-sm">
            U<sub>c</sub> = R<sub>terre</sub> × I<sub>Δn</sub>
          </div>
          <div className="text-xs text-blue-700 mt-2">
            U<sub>c</sub> : tension de contact (V) | R<sub>terre</sub> : résistance de terre (Ω) | I<sub>Δn</sub> : courant de déclenchement du différentiel (A)
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">
            <i className="fas fa-info-circle mr-2"></i>Informations importantes
          </h4>
          <ul className="text-sm text-yellow-800 space-y-1 list-disc pl-5">
            <li>Un différentiel 30 mA est <strong>obligatoire</strong> pour protéger les personnes</li>
            <li>Seul le 30 mA déclenche avant le seuil de danger électrique</li>
            <li>Le test avec un Telluromètre valide l'efficacité réelle de la protection</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
