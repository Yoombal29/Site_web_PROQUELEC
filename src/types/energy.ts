export interface AccessRate {
    total: number;
    urban: number;
    rural: number;
    year: number;
    source: string;
}

export interface ProductionMix {
    thermal: number;
    solar: number;
    wind: number;
    hydro: number;
    biomass: number;
    lastUpdate: string;
}

export interface TariffDecision {
    category: 'BT' | 'MT' | 'HT';
    priceXOF: number;
    unit: string;
    effectiveDate: string;
    documentUrl?: string;
}

export interface SolarSimulation {
    location: string;
    irradiance: number;
    estimatedOutput: number;
    hourlyForecast: { hour: string; value: number }[];
}

export interface RegionalContext {
    electrificationGap: number;
    priorityIssues: string[];
    localRiskLevel: 'faible' | 'moyen' | 'élevé';
}

export interface LocalActors {
    electriciansCount: number;
    companiesCount: number;
    trainingCentersCount: number;
    commonIncidentTypes: string[];
}

export interface GeoMetrics {
    substationsDensity: number;
    gridKmPer1000Hab: number;
    solarPriorityZones: string[];
}

export interface DashboardData {
    accessRate: AccessRate;
    productionMix: ProductionMix;
    tariffs: TariffDecision[];
    solarSimulation: SolarSimulation;
    reliabilityScore: number;
    regionalContext?: Record<string, RegionalContext>;
    localActors?: Record<string, LocalActors>;
    geoMetrics?: Record<string, GeoMetrics>;
}
