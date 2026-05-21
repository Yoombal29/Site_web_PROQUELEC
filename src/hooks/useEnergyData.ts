import { useState, useEffect } from 'react';
import { DashboardData } from '@/types/energy';

/**
 * Hook Expert pour la gestion des données énergétiques dynamiques de l'Observatoire
 */
export const useEnergyData = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);

                // 1. Fetch World Bank Data (Taux d'accès pour le Sénégal)
                const wbResponse = await fetch('https://api.worldbank.org/v2/country/SEN/indicator/EG.ELC.ACCS.ZS?format=json');
                const wbJson = await wbResponse.json();

                let accessRateValue = 72.5; // Fallback value
                let accessRateYear = 2026;

                if (wbJson && wbJson[1] && wbJson[1][0] && wbJson[1][0].value !== null) {
                    accessRateValue = parseFloat(wbJson[1][0].value.toFixed(1));
                    accessRateYear = parseInt(wbJson[1][0].date);
                }

                // 2. Dashboard Data Structure (Mock-First / Integration Ready)
                const observatoryData: DashboardData = {
                    accessRate: {
                        total: accessRateValue,
                        urban: 96.2,
                        rural: 58.4,
                        year: accessRateYear,
                        source: "API Banque Mondiale"
                    },
                    productionMix: {
                        thermal: 74,
                        solar: 18,
                        wind: 4,
                        hydro: 3,
                        biomass: 1,
                        lastUpdate: "Février 2026"
                    },
                    tariffs: [
                        { category: 'BT', priceXOF: 112.5, unit: 'kWh', effectiveDate: '2023-12-01' },
                        { category: 'MT', priceXOF: 98, unit: 'kWh', effectiveDate: '2023-12-01' }
                    ],
                    solarSimulation: {
                        location: "Dakar",
                        irradiance: 5.8,
                        estimatedOutput: 4200,
                        hourlyForecast: [
                            { hour: '08:00', value: 1.2 },
                            { hour: '12:00', value: 5.8 },
                            { hour: '16:00', value: 3.4 }
                        ]
                    },
                    reliabilityScore: 85,
                    regionalContext: {
                        "thies": {
                            electrificationGap: 22,
                            priorityIssues: ["Surcharge transformateurs BT", "Chaleur câbles"],
                            localRiskLevel: 'élevé'
                        },
                        "dakar": {
                            electrificationGap: 5,
                            priorityIssues: ["Surcharge réseau dense", "Vétusté installations"],
                            localRiskLevel: 'moyen'
                        },
                        "saint-louis": {
                            electrificationGap: 15,
                            priorityIssues: ["Corrosion saline", "Chutes de fils"],
                            localRiskLevel: 'moyen'
                        }
                    },
                    localActors: {
                        "thies": {
                            electriciansCount: 124,
                            companiesCount: 18,
                            trainingCentersCount: 3,
                            commonIncidentTypes: ["Court-circuit", "Surtension"]
                        },
                        "dakar": {
                            electriciansCount: 450,
                            companiesCount: 82,
                            trainingCentersCount: 12,
                            commonIncidentTypes: ["Incendie électrique", "Surcharge"]
                        }
                    },
                    geoMetrics: {
                        "thies": {
                            substationsDensity: 0.82,
                            gridKmPer1000Hab: 4.2,
                            solarPriorityZones: ["Thiès Nord", "Mbour"]
                        },
                        "dakar": {
                            substationsDensity: 2.15,
                            gridKmPer1000Hab: 8.5,
                            solarPriorityZones: ["Diamniadio", "Pikine"]
                        }
                    }
                };

                setData(observatoryData);
            } catch (err) {
                console.error("[OBSERVATORY] hook error:", err);
                setError(err instanceof Error ? err.message : "Erreur de synchronisation");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    return { data, loading, error };
};
