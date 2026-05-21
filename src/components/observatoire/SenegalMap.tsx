/**
 * Carte interactive du Sénégal haute fidélité
 * Basée sur Leaflet + GeoJSON GADM
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import type { Layer, LeafletMouseEvent, PathOptions, LatLngBounds } from 'leaflet';
import L from 'leaflet';
import type { Feature, Polygon, MultiPolygon, FeatureCollection } from 'geojson';
import 'leaflet/dist/leaflet.css';
import { regionsInfo, gadmNameToSlug, getRegionByGadmName } from '@/data/regions';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Layers, Zap, Sun, ShieldCheck, Map as MapIcon, Loader2, Info, Users, CheckCircle, AlertTriangle, Calculator, ShieldAlert, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import './SenegalMap.css';
import { SimulateurRaccordement } from './dialogs/SimulateurRaccordement';
import { SignalementIncident } from './dialogs/SignalementIncident';

// Types
interface GADMProperties {
    NAME_1: string;
}
type SenegalFeature = Feature<Polygon | MultiPolygon, GADMProperties>;
type SenegalFeatureCollection = FeatureCollection<Polygon | MultiPolygon, GADMProperties>;

interface RegionStats {
    total: number;
    conformes: number;
    non_conformes: number;
}

/**
 * Composant pour gérer le zoom animé
 */
const ZoomHandler: React.FC<{ targetBounds: LatLngBounds | null; onZoomComplete: () => void; }> = ({ targetBounds, onZoomComplete }) => {
    const map = useMap();
    useEffect(() => {
        if (targetBounds) {
            map.flyToBounds(targetBounds, { duration: 0.8, easeLinearity: 0.25, padding: [50, 50] });
            const timer = setTimeout(() => onZoomComplete(), 900);
            return () => clearTimeout(timer);
        }
    }, [targetBounds, map, onZoomComplete]);
    return null;
};

interface SenegalMapProps {
    onRegionSelect?: (region: string) => void;
}

const SenegalMap: React.FC<SenegalMapProps> = ({ onRegionSelect }) => {
    const [geoData, setGeoData] = useState<SenegalFeatureCollection | null>(null);
    const [isLoadingGeo, setIsLoadingGeo] = useState(true);
    const [errorGeo, setErrorGeo] = useState<string | null>(null);
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [zoomTarget, setZoomTarget] = useState<{ bounds: LatLngBounds; slug: string; } | null>(null);
    const [activeLayer, setActiveLayer] = useState<'default' | 'access' | 'solar' | 'reliability'>('default');
    const [radarActive, setRadarActive] = useState<string | null>(null);
    const geoJsonRef = useRef<L.GeoJSON | null>(null);

    // Stats Query
    const { data: stats } = useQuery({
        queryKey: ['observatory-map-stats'],
        queryFn: async () => {
            const res = await fetch('/api/observatoire/map/stats', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (!res.ok) return {};
            const data = await res.json();
            return data as Record<string, RegionStats>;
        }
    });

    // Load GeoJSON
    useEffect(() => {
        const loadGeoJSON = async () => {
            try {
                setIsLoadingGeo(true);
                const response = await fetch('/data/senegal-adm1.geojson');
                if (!response.ok) throw new Error('Erreur de chargement des données géographiques');
                const data = await response.json();
                setGeoData(data);
            } catch (err) {
                setErrorGeo(err instanceof Error ? err.message : 'Erreur');
            } finally {
                setIsLoadingGeo(false);
            }
        };
        loadGeoJSON();
    }, []);

    const getRegionStyle = useCallback((feature: SenegalFeature | undefined): PathOptions => {
        if (!feature) return {};
        const gadmName = feature.properties?.NAME_1;
        const regionInfo = gadmName ? getRegionByGadmName(gadmName) : null;

        let fillColor = regionInfo?.color || '#cbd5e1';

        if (activeLayer === 'access' && regionInfo) {
            const rate = regionInfo.profile.rate;
            fillColor = rate > 90 ? '#10b981' : rate > 70 ? '#34d399' : '#6ee7b7';
        } else if (activeLayer === 'solar' && regionInfo) {
            const pot = regionInfo.renewable.solarPotential;
            fillColor = pot.includes('Elevé') ? '#f59e0b' : '#fcd34d';
        } else if (activeLayer === 'reliability' && regionInfo) {
            const loss = regionInfo.stats.technicalLosses;
            fillColor = loss < 15 ? '#6366f1' : '#a5b4fc';
        } else {
            // Default: Conformity
            const regionStats = stats?.[gadmName];
            if (regionStats && regionStats.total > 0) {
                const rate = regionStats.conformes / regionStats.total;
                fillColor = rate >= 0.8 ? '#10b981' : rate >= 0.5 ? '#f59e0b' : '#ef4444';
            }
        }

        return {
            fillColor,
            weight: selectedRegion === gadmName ? 3 : 1,
            opacity: 0.8,
            color: selectedRegion === gadmName ? '#3b82f6' : 'white',
            fillOpacity: 0.7,
            className: `region-polygon ${radarActive === gadmName ? 'radar-flash' : ''}`
        };
    }, [activeLayer, radarActive, selectedRegion, stats]);

    const handleRegionClick = useCallback((e: LeafletMouseEvent, feature: SenegalFeature) => {
        const gadmName = feature.properties?.NAME_1;
        if (!gadmName) return;
        setSelectedRegion(gadmName);
        if (onRegionSelect) onRegionSelect(gadmName);
        const layer = e.target as L.Polygon;
        setZoomTarget({ bounds: layer.getBounds(), slug: gadmNameToSlug(gadmName) });
    }, [onRegionSelect]);

    const onEachFeature = useCallback((feature: SenegalFeature, layer: Layer) => {
        const gadmName = feature.properties?.NAME_1;
        const regionInfo = gadmName ? getRegionByGadmName(gadmName) : null;

        if (regionInfo) {
            layer.bindTooltip(`<div class="tooltip-content"><div class="tooltip-name">${regionInfo.name}</div><div class="tooltip-capital">${regionInfo.capital}</div></div>`, {
                permanent: false, direction: 'top', className: 'region-tooltip', html: true
            } as any);
        }

        layer.on({
            mouseover: (e) => {
                const l = e.target as L.Path & { _path: HTMLElement };
                l.setStyle({ fillOpacity: 0.9, weight: 2 });
                if (l._path) l._path.classList.add('filter-glow');
            },
            mouseout: (e) => {
                const l = e.target as L.Path & { _path: HTMLElement };
                l.setStyle(getRegionStyle(feature));
                if (l._path) l._path.classList.remove('filter-glow');
            },
            click: (e: LeafletMouseEvent) => {
                handleRegionClick(e, feature);
            }
        });
    }, [getRegionStyle]);

    if (isLoadingGeo) return <div className="flex justify-center p-20"><Loader2 className="animate-spin w-12 h-12 text-proqblue" /></div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <Card className="lg:col-span-3 p-0 map-container-card overflow-hidden relative min-h-[600px]">
                {/* Layer Selector */}
                <div className="absolute top-6 left-6 z-[1000] flex flex-wrap gap-2">
                    <Button size="sm" variant={activeLayer === 'default' ? 'default' : 'outline'} onClick={() => setActiveLayer('default')} className="rounded-full bg-white/90 backdrop-blur">
                        <Layers className="w-3.5 h-3.5 mr-2" /> Conformité
                    </Button>
                    <Button size="sm" variant={activeLayer === 'access' ? 'default' : 'outline'} onClick={() => setActiveLayer('access')} className="rounded-full bg-white/90 backdrop-blur">
                        <Zap className="w-3.5 h-3.5 mr-2" /> Accès
                    </Button>
                    <Button size="sm" variant={activeLayer === 'solar' ? 'default' : 'outline'} onClick={() => setActiveLayer('solar')} className="rounded-full bg-white/90 backdrop-blur">
                        <Sun className="w-3.5 h-3.5 mr-2" /> Solaire
                    </Button>
                </div>

                <MapContainer center={[14.5, -14.5]} zoom={7} minZoom={6} maxZoom={10} className="w-full h-[600px] senegal-map" zoomControl={true} attributionControl={false}>
                    <ZoomHandler targetBounds={zoomTarget?.bounds || null} onZoomComplete={() => setZoomTarget(null)} />
                    {geoData && <GeoJSON ref={geoJsonRef as any} data={geoData} style={(f) => getRegionStyle(f as SenegalFeature)} onEachFeature={onEachFeature} />}
                </MapContainer>

                <div className="absolute bottom-6 right-6 z-[1000] bg-white/80 backdrop-blur p-4 rounded-2xl shadow-lg border border-slate-100">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Légende</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[9px] font-bold">
                            <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Optimal {">"} 80%
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-bold">
                            <div className="w-3 h-3 bg-amber-500 rounded-sm"></div> Moyen 50-80%
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-bold">
                            <div className="w-3 h-3 bg-rose-500 rounded-sm"></div> Critique {"<"} 50%
                        </div>
                    </div>
                </div>
            </Card>

            <div className="space-y-6">
                <Card className="p-8 border-slate-200 shadow-xl rounded-3xl bg-white border-b-4 border-b-proqblue">
                    <h3 className="font-black text-slate-800 mb-6 flex items-center gap-3 uppercase tracking-tight">
                        <Info className="w-6 h-6 text-proqblue" /> Analyse Régionale
                    </h3>
                    {selectedRegion ? (
                        <div className="space-y-6 animate-in slide-in-from-right-5 fade-in duration-300">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{selectedRegion}</h4>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Région GIS</p>
                                </div>
                                <Badge className="bg-proqblue/10 text-proqblue border-0 px-4 py-1.5 rounded-full font-black">
                                    {stats?.[selectedRegion]?.total || 0} Dossiers
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-emerald-700 font-black text-[10px] uppercase tracking-widest">
                                            <CheckCircle className="w-3 h-3" /> Conformes
                                        </div>
                                        <div className="text-3xl font-black text-emerald-800">{stats?.[selectedRegion]?.conformes || 0}</div>
                                    </div>
                                </div>
                                <div className="p-5 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-red-700 font-black text-[10px] uppercase tracking-widest">
                                            <AlertTriangle className="w-3 h-3" /> Écarts
                                        </div>
                                        <div className="text-3xl font-black text-red-800">{stats?.[selectedRegion]?.non_conformes || 0}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-4">
                                <SimulateurRaccordement regionName={selectedRegion}>
                                    <Button variant="outline" className="h-16 rounded-2xl flex flex-col items-center justify-center gap-1 border-slate-100 hover:border-proqblue hover:bg-blue-50/50 transition-all group">
                                        <Calculator className="w-5 h-5 text-proqblue group-hover:scale-110 transition-transform" />
                                        <span className="text-[9px] font-black uppercase tracking-tighter">Simuler Devis</span>
                                    </Button>
                                </SimulateurRaccordement>
                                <SignalementIncident regionName={selectedRegion}>
                                    <Button variant="outline" className="h-16 rounded-2xl flex flex-col items-center justify-center gap-1 border-slate-100 hover:border-rose-200 hover:bg-rose-50/50 transition-all group">
                                        <ShieldAlert className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
                                        <span className="text-[9px] font-black uppercase tracking-tighter">Signaler Alerte</span>
                                    </Button>
                                </SignalementIncident>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
                            <MapIcon className="w-12 h-12 mx-auto mb-4 opacity-10" />
                            <p className="font-bold text-sm">Exploration GIS</p>
                            <p className="text-[10px] font-medium mt-2 px-8">Cliquez sur une région officielle pour les détails.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default SenegalMap;
