import React, { useState } from 'react';

interface UnitGroup {
  name: string;
  icon: string;
  conversions: {
    [key: string]: { label: string; factor: number; decimals: number }
  }
}

export default function ElectricalUnitConverter() {
  const [activeGroup, setActiveGroup] = useState<string>('tension');
  const [values, setValues] = useState<{ [key: string]: string }>({});

  const unitGroups: { [key: string]: UnitGroup } = {
    tension: {
      name: 'Tension',
      icon: 'fas fa-bolt',
      conversions: {
        'mV': { label: 'mV (millivolts)', factor: 1, decimals: 1 },
        'V': { label: 'V (volts)', factor: 1000, decimals: 3 },
        'kV': { label: 'kV (kilovolts)', factor: 1000000, decimals: 6 }
      }
    },
    courant: {
      name: 'Courant',
      icon: 'fas fa-battery-half',
      conversions: {
        'mA': { label: 'mA (milliampères)', factor: 1, decimals: 1 },
        'A': { label: 'A (ampères)', factor: 1000, decimals: 3 },
        'kA': { label: 'kA (kiloampères)', factor: 1000000, decimals: 6 }
      }
    },
    puissance: {
      name: 'Puissance',
      icon: 'fas fa-plug',
      conversions: {
        'W': { label: 'W (watts)', factor: 1, decimals: 1 },
        'kW': { label: 'kW (kilowatts)', factor: 1000, decimals: 3 },
        'MW': { label: 'MW (mégawatts)', factor: 1000000, decimals: 6 }
      }
    },
    energie: {
      name: 'Énergie',
      icon: 'fas fa-fire',
      conversions: {
        'Wh': { label: 'Wh (watt-heures)', factor: 1, decimals: 1 },
        'kWh': { label: 'kWh (kilowatt-heures)', factor: 1000, decimals: 3 },
        'MWh': { label: 'MWh (mégawatt-heures)', factor: 1000000, decimals: 6 }
      }
    },
    impedance: {
      name: 'Impédance',
      icon: 'fas fa-wave-square',
      conversions: {
        'Ω': { label: 'Ω (ohms)', factor: 1, decimals: 1 },
        'kΩ': { label: 'kΩ (kilohms)', factor: 1000, decimals: 3 },
        'MΩ': { label: 'MΩ (mégohms)', factor: 1000000, decimals: 6 }
      }
    },
    capacite: {
      name: 'Capacité',
      icon: 'fas fa-database',
      conversions: {
        'pF': { label: 'pF (picofarads)', factor: 1, decimals: 1 },
        'nF': { label: 'nF (nanofarads)', factor: 1000, decimals: 3 },
        'μF': { label: 'μF (microfarads)', factor: 1000000, decimals: 6 }
      }
    },
    frequence: {
      name: 'Fréquence',
      icon: 'fas fa-signal',
      conversions: {
        'Hz': { label: 'Hz (hertz)', factor: 1, decimals: 1 },
        'kHz': { label: 'kHz (kilohertz)', factor: 1000, decimals: 3 },
        'MHz': { label: 'MHz (mégahertz)', factor: 1000000, decimals: 6 }
      }
    }
  };

  const handleConvert = (fromUnit: string, toUnit: string, value: string) => {
    if (!value || isNaN(parseFloat(value))) return;

    const group = unitGroups[activeGroup];
    const fromFactor = group.conversions[fromUnit].factor;
    const toFactor = group.conversions[toUnit].factor;
    const numValue = parseFloat(value);

    // Convert to base unit then to target unit
    const baseValue = numValue / fromFactor;
    const result = baseValue * toFactor;

    const decimals = group.conversions[toUnit].decimals;
    const rounded = result.toFixed(Math.max(1, decimals - Math.floor(Math.log10(Math.abs(result)))));

    setValues({
      ...values,
      [`${activeGroup}-${toUnit}`]: rounded
    });
  };

  const resetGroup = () => {
    const newValues = { ...values };
    Object.keys(unitGroups[activeGroup].conversions).forEach(unit => {
      delete newValues[`${activeGroup}-${unit}`];
    });
    setValues(newValues);
  };

  const group = unitGroups[activeGroup];
  const units = Object.keys(group.conversions);

  return (
    <div className="bg-white rounded-xl p-6 border shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
          <i className="fas fa-exchange-alt text-yellow-600 text-lg"></i>
        </div>
        <h3 className="text-xl font-semibold text-yellow-700">
          Convertisseur d'unités électriques PRO
        </h3>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b">
        {Object.entries(unitGroups).map(([key, group]) => (
          <button
            key={key}
            onClick={() => {
              setActiveGroup(key);
              resetGroup();
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition ${
              activeGroup === key
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-label={`Afficher les conversions de ${group.name}`}
          >
            <i className={`${group.icon} text-sm`}></i>
            <span className="text-sm">{group.name}</span>
          </button>
        ))}
      </div>

      {/* Active Category Content */}
      <div className="space-y-4">
        {units.map((unit, idx) => (
          <div key={unit} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center mb-2">
              <i className={`${group.icon} text-yellow-600 mr-2`}></i>
              <label className="block text-sm font-medium text-yellow-800">
                {group.conversions[unit].label}
              </label>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={values[`${activeGroup}-${unit}`] || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setValues({
                    ...values,
                    [`${activeGroup}-${unit}`]: val
                  });
                }}
                placeholder="Entrez une valeur"
                className="flex-1 p-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                aria-label={`Valeur en ${unit}`}
              />
              
              {/* Quick Convert Buttons */}
              <div className="flex gap-1">
                {units.map(targetUnit => (
                  targetUnit !== unit && (
                    <button
                      key={targetUnit}
                      onClick={() => handleConvert(unit, targetUnit, values[`${activeGroup}-${unit}`] || '')}
                      className="px-2 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold rounded transition"
                      title={`Convertir ${unit} en ${targetUnit}`}
                    >
                      → {targetUnit}
                    </button>
                  )
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Reset Button */}
        <button
          onClick={resetGroup}
          className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
          aria-label={`Réinitialiser les conversions de ${group.name}`}
        >
          <i className="fas fa-redo mr-2"></i>Réinitialiser
        </button>
      </div>

      {/* Formula Reference */}
      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">
          <i className="fas fa-lightbulb mr-2"></i>Formules et rappels
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc pl-5">
          <li>1 V = 1000 mV | 1 A = 1000 mA | 1 W = 1000 mW</li>
          <li>1 kW = 1000 W | 1 kWh = 1000 Wh | 1 kV = 1000 V</li>
          <li>1 Ω = 1000 kΩ | 1 MΩ = 1000 kΩ | 1 kΩ = 1000 Ω</li>
          <li>1 μF = 1000 nF | 1 nF = 1000 pF</li>
          <li>1 MHz = 1000 kHz | 1 kHz = 1000 Hz</li>
          <li><strong>P = U × I</strong> (puissance en W = tension en V × courant en A)</li>
        </ul>
      </div>

      {/* Info Box */}
      <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">
          <i className="fas fa-info-circle mr-2"></i>Conseil d'utilisation
        </h4>
        <p className="text-sm text-yellow-800">
          Entrez une valeur dans n'importe quel champ, puis cliquez sur le bouton de conversion pour 
          convertir instantanément vers d'autres unités. Les conversions conservent la précision maximale.
        </p>
      </div>
    </div>
  );
}
