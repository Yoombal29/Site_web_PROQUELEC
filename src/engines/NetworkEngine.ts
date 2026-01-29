/**
 * 🕸️ NetworkEngine — Calcul de Réseau Complet
 *
 * Moteur de calcul pour réseaux électriques complexes selon NF C 15-100
 * Implémente la méthodologie du cahier des câbles :
 * - Calcul des courants aval → amont
 * - Cumul des chutes de tension le long des chemins
 * - Identification du point le plus défavorisé
 *
 * Norme : NF C 15-100 Articles 523, 525
 */

import { GraphStore, GraphNode, GraphEdge, Charge } from '@/stores/GraphStore';
import { TronçonEngine, Tronçon } from './TronçonEngine';

/**
 * Interface NetworkPath — Chemin électrique complet
 */
export interface NetworkPath {
  id: string;
  nodes: string[];          // IDs des nœuds du chemin
  edges: string[];          // IDs des arêtes du chemin
  longueurTotale: number;   // Longueur totale en mètres
  chuteTotale: number;      // Chute totale en volts
  chuteTotalePercent: number; // Chute totale en %
  courant: number;          // Courant du chemin
  conformite: 'CONFORME' | 'NON_CONFORME' | 'AVERTISSEMENT';
}

/**
 * Interface PhaseBalance — Équilibrage des phases triphasées
 */
export interface PhaseBalance {
  phaseR: {
    charges: Charge[];
    puissanceTotale: number;
    courantTotal: number;
  };
  phaseS: {
    charges: Charge[];
    puissanceTotale: number;
    courantTotal: number;
  };
  phaseT: {
    charges: Charge[];
    puissanceTotale: number;
    courantTotal: number;
  };
  desequilibrePercent: number; // Pourcentage de déséquilibre max
  recommandations: string[];
}

/**
 * Interface NetworkResult — Résultat complet du calcul de réseau
 */
export interface NetworkResult {
  chemins: NetworkPath[];
  cheminPlusDefavorise: NetworkPath;
  chuteMax: number;
  chuteMaxPercent: number;
  verdictGlobal: 'CONFORME' | 'NON_CONFORME' | 'AVERTISSEMENT';
  recommandations: string[];
  tronçonsCalcules: Tronçon[];
  equilibragePhases?: PhaseBalance; // Nouveau pour triphasé
  recommandationsCables?: Array<{
    tronçonId: string;
    courant: number;
    sectionRecommandee: number;
    sectionMinimale: number;
    materiau: 'Cu' | 'Al';
    raison: string;
    conformite: 'CONFORME' | 'AVERTISSEMENT' | 'NON_CONFORME';
  }>;
}

/**
 * NetworkEngine — Calcul de réseau électrique complet
 */
export class NetworkEngine {

  /**
   * Calculer l'équilibrage des phases triphasées
   * Répartit automatiquement les charges monophasées sur les 3 phases
   * selon NF C 15-100 (équilibrage pour minimiser les courants de neutre)
   */
  public static calculatePhaseBalance(charges: Charge[]): PhaseBalance {
    const phaseR: Charge[] = [];
    const phaseS: Charge[] = [];
    const phaseT: Charge[] = [];

    // Séparer les charges triphasées (connectées aux 3 phases) des monophasées
    const chargesTriphase = charges.filter(c => c.type === 'TRIPHASE');
    const chargesMonophase = charges.filter(c => c.type === 'MONOPHASE');

    // Les charges triphasées sont automatiquement équilibrées (même puissance sur chaque phase)
    for (const charge of chargesTriphase) {
      // Pour une charge triphasée, la puissance est répartie également sur les 3 phases
      const puissanceParPhase = charge.puissance / 3;
      const courantParPhase = puissanceParPhase / (charge.tension * charge.cosPhi / Math.sqrt(3));

      // Ajouter à chaque phase (simulation)
      phaseR.push({ ...charge, puissance: puissanceParPhase, courantNominal: courantParPhase });
      phaseS.push({ ...charge, puissance: puissanceParPhase, courantNominal: courantParPhase });
      phaseT.push({ ...charge, puissance: puissanceParPhase, courantNominal: courantParPhase });
    }

    // Équilibrer les charges monophasées selon l'algorithme d'équilibrage
    // Méthode: répartition par puissance décroissante (méthode des plus gros d'abord)
    const chargesTriees = [...chargesMonophase].sort((a, b) => b.puissance - a.puissance);

    for (const charge of chargesTriees) {
      // Calculer la puissance actuelle de chaque phase
      const puissanceR = phaseR.reduce((sum, c) => sum + c.puissance, 0);
      const puissanceS = phaseS.reduce((sum, c) => sum + c.puissance, 0);
      const puissanceT = phaseT.reduce((sum, c) => sum + c.puissance, 0);

      // Assigner à la phase avec la plus petite puissance actuelle
      if (puissanceR <= puissanceS && puissanceR <= puissanceT) {
        phaseR.push(charge);
      } else if (puissanceS <= puissanceT) {
        phaseS.push(charge);
      } else {
        phaseT.push(charge);
      }
    }

    // Calculer les totaux pour chaque phase
    const calculerTotaux = (phaseCharges: Charge[]) => ({
      charges: phaseCharges,
      puissanceTotale: phaseCharges.reduce((sum, c) => sum + c.puissance, 0),
      courantTotal: phaseCharges.reduce((sum, c) => sum + c.courantNominal, 0)
    });

    const resultR = calculerTotaux(phaseR);
    const resultS = calculerTotaux(phaseS);
    const resultT = calculerTotaux(phaseT);

    // Calculer le déséquilibre (écart max par rapport à la moyenne)
    const puissanceMoyenne = (resultR.puissanceTotale + resultS.puissanceTotale + resultT.puissanceTotale) / 3;
    const ecarts = [
      Math.abs(resultR.puissanceTotale - puissanceMoyenne),
      Math.abs(resultS.puissanceTotale - puissanceMoyenne),
      Math.abs(resultT.puissanceTotale - puissanceMoyenne)
    ];
    const desequilibreMax = Math.max(...ecarts);
    const desequilibrePercent = puissanceMoyenne > 0 ? (desequilibreMax / puissanceMoyenne) * 100 : 0;

    // Générer des recommandations
    const recommandations: string[] = [];

    if (desequilibrePercent > 20) {
      recommandations.push(`Déséquilibre important (${desequilibrePercent.toFixed(1)}%) - Reconsidérer la répartition des charges`);
    } else if (desequilibrePercent > 10) {
      recommandations.push(`Déséquilibre modéré (${desequilibrePercent.toFixed(1)}%) - Optimisation possible`);
    } else {
      recommandations.push(`Équilibrage satisfaisant (${desequilibrePercent.toFixed(1)}% de déséquilibre)`);
    }

    // Recommandations spécifiques par phase
    const phases = [
      { nom: 'R', data: resultR },
      { nom: 'S', data: resultS },
      { nom: 'T', data: resultT }
    ];

    for (const phase of phases) {
      if (phase.data.courantTotal > 16) {
        recommandations.push(`Phase ${phase.nom}: ${phase.data.courantTotal.toFixed(1)}A - Vérifier section câble (≥ 1.5mm²)`);
      }
    }

    return {
      phaseR: resultR,
      phaseS: resultS,
      phaseT: resultT,
      desequilibrePercent,
      recommandations
    };
  }

  /**
   * Générer des recommandations de sections de câbles
   * Selon NF C 15-100 et normes de protection
   */
  public static generateCableRecommendations(
    graph: GraphStore,
    courantsCalcules: Map<string, number>
  ): Array<{
    tronçonId: string;
    courant: number;
    sectionRecommandee: number;
    sectionMinimale: number;
    materiau: 'Cu' | 'Al';
    raison: string;
    conformite: 'CONFORME' | 'AVERTISSEMENT' | 'NON_CONFORME';
  }> {
    const recommandations: Array<{
      tronçonId: string;
      courant: number;
      sectionRecommandee: number;
      sectionMinimale: number;
      materiau: 'Cu' | 'Al';
      raison: string;
      conformite: 'CONFORME' | 'AVERTISSEMENT' | 'NON_CONFORME';
    }> = [];

    // Table des sections selon NF C 15-100 (cuivre, installation C)
    const sectionsCu: Array<{ section: number; ib: number; iz: number }> = [
      { section: 1.5, ib: 13.5, iz: 16 },
      { section: 2.5, ib: 18, iz: 20 },
      { section: 4, ib: 25, iz: 28 },
      { section: 6, ib: 32, iz: 36 },
      { section: 10, ib: 46, iz: 52 },
      { section: 16, ib: 63, iz: 76 },
      { section: 25, ib: 88, iz: 101 },
      { section: 35, ib: 108, iz: 125 },
      { section: 50, ib: 134, iz: 151 },
      { section: 70, ib: 168, iz: 192 },
      { section: 95, ib: 207, iz: 232 },
      { section: 120, ib: 240, iz: 269 },
      { section: 150, ib: 275, iz: 304 },
      { section: 185, ib: 318, iz: 350 },
      { section: 240, ib: 380, iz: 421 },
      { section: 300, ib: 442, iz: 490 }
    ];

    // Analyser chaque arête (tronçon)
    for (const [edgeId, edge] of graph.edges) {
      const courant = courantsCalcules.get(edgeId) || 0;
      if (courant === 0) continue;

      const materiau = edge.properties.materiau || 'Cu';
      const sectionActuelle = edge.properties.section || 0;

      // Trouver la section minimale pour ce courant
      let sectionMinimale = 0;
      let sectionRecommandee = 0;
      let raison = '';

      if (materiau === 'Cu') {
        // Pour le cuivre, utiliser Iz (courant admissible)
        const sectionAdequate = sectionsCu.find(s => s.iz >= courant);
        if (sectionAdequate) {
          sectionMinimale = sectionAdequate.section;
          // Section recommandée = section minimale + marge de sécurité (typiquement 1 cran supérieur)
          const index = sectionsCu.indexOf(sectionAdequate);
          sectionRecommandee = index < sectionsCu.length - 1 ? sectionsCu[index + 1].section : sectionAdequate.section;
          raison = `Section minimale ${sectionMinimale}mm² (Iz=${sectionAdequate.iz}A), recommandée ${sectionRecommandee}mm² pour marge de sécurité`;
        } else {
          // Courant trop élevé pour les sections standards
          sectionMinimale = 300; // Maximum dans notre table
          sectionRecommandee = 300;
          raison = `Courant ${courant.toFixed(1)}A nécessite section > 300mm² - câble surdimensionné requis`;
        }
      } else {
        // Pour l'aluminium, les courants admissibles sont environ 20% inférieurs
        const sectionAdequate = sectionsCu.find(s => s.iz * 0.8 >= courant);
        if (sectionAdequate) {
          sectionMinimale = sectionAdequate.section;
          const index = sectionsCu.indexOf(sectionAdequate);
          sectionRecommandee = index < sectionsCu.length - 1 ? sectionsCu[index + 1].section : sectionAdequate.section;
          raison = `Aluminium: section minimale ${sectionMinimale}mm² (Iz ajusté=${(sectionAdequate.iz * 0.8).toFixed(1)}A), recommandée ${sectionRecommandee}mm²`;
        } else {
          sectionMinimale = 300;
          sectionRecommandee = 300;
          raison = `Aluminium: courant ${courant.toFixed(1)}A nécessite section > 300mm²`;
        }
      }

      // Déterminer la conformité
      let conformite: 'CONFORME' | 'AVERTISSEMENT' | 'NON_CONFORME' = 'CONFORME';

      if (sectionActuelle === 0) {
        conformite = 'NON_CONFORME';
        raison += ' - Section non définie';
      } else if (sectionActuelle < sectionMinimale) {
        conformite = 'NON_CONFORME';
        raison += ` - Section actuelle ${sectionActuelle}mm² insuffisante`;
      } else if (sectionActuelle < sectionRecommandee) {
        conformite = 'AVERTISSEMENT';
        raison += ` - Section actuelle ${sectionActuelle}mm² acceptable mais marge limitée`;
      } else {
        raison += ` - Section actuelle ${sectionActuelle}mm² conforme avec bonne marge`;
      }

      recommandations.push({
        tronçonId: edgeId,
        courant,
        sectionRecommandee,
        sectionMinimale,
        materiau,
        raison,
        conformite
      });
    }

    return recommandations;
  }

  static calculateNetwork(graph: GraphStore): NetworkResult {
    console.log('🔌 DÉBUT CALCUL RÉSEAU COMPLET');

    // 1. Identifier le point d'alimentation (source)
    const sourceNode = this.findSourceNode(graph);
    if (!sourceNode) {
      throw new Error('Aucun nœud source trouvé dans le graphe');
    }
    console.log(`📍 Source identifiée: ${sourceNode.id} (${sourceNode.type})`);

    // 2. Calculer les courants aval → amont
    const courantsCalcules = this.calculateCurrents(graph, sourceNode.id);
    console.log('⚡ Courants calculés:', courantsCalcules);

    // 3. Identifier tous les chemins vers les charges terminales
    const chemins = this.findAllPathsToLoads(graph, sourceNode.id);
    console.log(`🛣️ ${chemins.length} chemins identifiés`);

    // 4. Calculer les chutes de tension cumulées
    const cheminsCalcules = this.calculatePathVoltageDrops(graph, chemins, courantsCalcules);

    // 5. Identifier le point le plus défavorisé
    const cheminPlusDefavorise = this.findMostDisadvantagedPath(cheminsCalcules);
    console.log(`🎯 Point le plus défavorisé: ${cheminPlusDefavorise.id} (${cheminPlusDefavorise.chuteTotalePercent.toFixed(2)}%)`);

    // 6. Générer les recommandations
    const recommandations = this.generateRecommendations(cheminsCalcules, cheminPlusDefavorise);

    // 7. Calculer les tronçons pour export
    const tronçonsCalcules = this.generateTronçonsForExport(graph, courantsCalcules);

    // 8. Générer les recommandations de sections de câbles
    const recommandationsCables = this.generateCableRecommendations(graph, courantsCalcules);
    console.log(`🔌 ${recommandationsCables.length} recommandations de câbles générées`);

    // Ajouter les recommandations de câbles aux recommandations générales
    for (const rec of recommandationsCables) {
      if (rec.conformite === 'NON_CONFORME') {
        recommandations.push(`❌ ${rec.tronçonId}: ${rec.raison}`);
      } else if (rec.conformite === 'AVERTISSEMENT') {
        recommandations.push(`⚠️ ${rec.tronçonId}: ${rec.raison}`);
      }
    }

    // 9. Calculer l'équilibrage des phases si des charges triphasées existent
    let equilibragePhases: PhaseBalance | undefined;
    const toutesLesCharges = this.collectAllCharges(graph);
    const hasTriphaseCharges = toutesLesCharges.some(c => c.type === 'TRIPHASE');
    const hasMonophaseCharges = toutesLesCharges.some(c => c.type === 'MONOPHASE');

    if (hasTriphaseCharges || hasMonophaseCharges) {
      equilibragePhases = this.calculatePhaseBalance(toutesLesCharges);
      console.log('⚖️ Équilibrage des phases calculé:', {
        desequilibre: `${equilibragePhases.desequilibrePercent.toFixed(1)}%`,
        phaseR: `${equilibragePhases.phaseR.puissanceTotale.toFixed(0)}W`,
        phaseS: `${equilibragePhases.phaseS.puissanceTotale.toFixed(0)}W`,
        phaseT: `${equilibragePhases.phaseT.puissanceTotale.toFixed(0)}W`
      });

      // Ajouter les recommandations d'équilibrage aux recommandations générales
      recommandations.push(...equilibragePhases.recommandations);
    }

    // 9. Verdict global
    const verdictGlobal = this.determineGlobalVerdict(cheminsCalcules);

    return {
      chemins: cheminsCalcules,
      cheminPlusDefavorise,
      chuteMax: cheminPlusDefavorise.chuteTotale,
      chuteMaxPercent: cheminPlusDefavorise.chuteTotalePercent,
      verdictGlobal,
      recommandations,
      tronçonsCalcules,
      equilibragePhases,
      recommandationsCables
    };
  }

  /**
   * Collecter toutes les charges du réseau
   */
  private static collectAllCharges(graph: GraphStore): Charge[] {
    const allCharges: Charge[] = [];

    for (const node of graph.nodes.values()) {
      if (node.type === 'RECEPTOR' && node.charges) {
        allCharges.push(...node.charges);
      }
    }

    return allCharges;
  }

  /**
   * Trouver le nœud source (alimentation)
   */
  private static findSourceNode(graph: GraphStore): GraphNode | null {
    // Chercher d'abord les nœuds de type SOURCE
    for (const node of graph.nodes.values()) {
      if (node.type === 'SOURCE') {
        return node;
      }
    }

    // Si pas de SOURCE explicite, chercher un nœud sans arête entrante
    for (const node of graph.nodes.values()) {
      const hasIncomingEdge = Array.from(graph.edges.values()).some(edge => edge.to === node.id);
      if (!hasIncomingEdge) {
        return node;
      }
    }

    return null;
  }

  /**
   * Calculer les courants aval → amont
   */
  private static calculateCurrents(graph: GraphStore, sourceId: string): Map<string, number> {
    const courants = new Map<string, number>();

    // Calculer récursivement les courants
    this.calculateCurrentRecursive(graph, sourceId, courants);

    return courants;
  }

  /**
   * Calcul récursif des courants aval → amont
   */
  private static calculateCurrentRecursive(
    graph: GraphStore,
    nodeId: string,
    courants: Map<string, number>
  ): number {
    const node = graph.nodes.get(nodeId);
    if (!node) return 0;

    // Si déjà calculé, retourner la valeur
    if (courants.has(nodeId)) {
      return courants.get(nodeId)!;
    }

    let courantTotal = 0;

    // Ajouter le courant des charges locales (si c'est un récepteur)
    if (node.type === 'RECEPTOR' && node.charges && node.charges.length > 0) {
      for (const charge of node.charges) {
        // Calculer le courant de la charge selon son type et ses paramètres
        let courantCharge = 0;

        if (charge.type === 'TRIPHASE') {
          // Pour triphasé: P / (√3 × V × cosφ) pour tension composée
          // ou P / (3 × V_phase × cosφ) pour tension phase-neutre
          // Ici on utilise la tension composée (400V) donc √3 × 230V
          courantCharge = charge.puissance / (Math.sqrt(3) * charge.tension * charge.cosPhi);
        } else if (charge.type === 'MONOPHASE') {
          // Pour monophasé: P / (V × cosφ)
          courantCharge = charge.puissance / (charge.tension * charge.cosPhi);
        } else if (charge.type === 'DC') {
          // Pour DC: P / V (pas de cosφ)
          courantCharge = charge.puissance / charge.tension;
        }

        courantTotal += courantCharge;

        console.log(`🔌 Charge ${charge.nom} (${charge.type}): ${charge.puissance}W à ${charge.tension}V (cosφ=${charge.cosPhi}) → ${courantCharge.toFixed(2)}A`);
      }
    } else if (node.type === 'RECEPTOR') {
      // Fallback si pas de charges définies (compatibilité)
      courantTotal += node.params.courant || 10;
      console.log(`⚠️ Nœud ${node.id}: pas de charges définies, utilisation valeur par défaut ${courantTotal}A`);
    }

    // Ajouter les courants des arêtes sortantes
    const outgoingEdges = Array.from(graph.edges.values()).filter(edge => edge.from === nodeId);
    for (const edge of outgoingEdges) {
      const courantEdge = this.calculateCurrentRecursive(graph, edge.to, courants);
      courantTotal += courantEdge;

      // Stocker le courant de cette arête
      courants.set(edge.id, courantEdge);
    }

    // Stocker le courant de ce nœud
    courants.set(nodeId, courantTotal);

    return courantTotal;
  }

  /**
   * Trouver tous les chemins de la source vers les charges terminales
   */
  private static findAllPathsToLoads(graph: GraphStore, sourceId: string): NetworkPath[] {
    const chemins: NetworkPath[] = [];
    const terminalNodes = this.findTerminalNodes(graph);

    for (const terminalNode of terminalNodes) {
      const path = this.findPath(graph, sourceId, terminalNode.id);
      if (path.nodes.length > 0) {
        chemins.push({
          id: `path_${sourceId}_to_${terminalNode.id}`,
          nodes: path.nodes,
          edges: path.edges,
          longueurTotale: 0, // Calculé plus tard
          chuteTotale: 0,     // Calculé plus tard
          chuteTotalePercent: 0,
          courant: 0,         // Calculé plus tard
          conformite: 'CONFORME'
        });
      }
    }

    return chemins;
  }

  /**
   * Identifier les nœuds terminaux (charges)
   */
  private static findTerminalNodes(graph: GraphStore): GraphNode[] {
    const terminals: GraphNode[] = [];

    for (const node of graph.nodes.values()) {
      if (node.type === 'RECEPTOR') {
        terminals.push(node);
      }
    }

    return terminals;
  }

  /**
   * Trouver un chemin entre deux nœuds (BFS)
   */
  private static findPath(graph: GraphStore, startId: string, endId: string): { nodes: string[], edges: string[] } {
    const queue: { nodeId: string; path: string[]; edges: string[] }[] = [
      { nodeId: startId, path: [startId], edges: [] }
    ];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { nodeId, path, edges } = queue.shift()!;

      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      if (nodeId === endId) {
        return { nodes: path, edges };
      }

      // Explorer les arêtes sortantes
      const outgoingEdges = Array.from(graph.edges.values()).filter(edge => edge.from === nodeId);
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.to)) {
          queue.push({
            nodeId: edge.to,
            path: [...path, edge.to],
            edges: [...edges, edge.id]
          });
        }
      }
    }

    return { nodes: [], edges: [] };
  }

  /**
   * Calculer les chutes de tension le long des chemins
   */
  private static calculatePathVoltageDrops(
    graph: GraphStore,
    chemins: NetworkPath[],
    courants: Map<string, number>
  ): NetworkPath[] {
    return chemins.map(chemin => {
      let longueurTotale = 0;
      let chuteTotale = 0;

      // Calculer la longueur totale et la chute de tension
      for (const edgeId of chemin.edges) {
        const edge = graph.edges.get(edgeId);
        if (edge) {
          longueurTotale += edge.properties.length || 0;
          // Chute simplifiée (à améliorer avec vraie formule)
          const courant = courants.get(edgeId) || 0;
          const resistance = (edge.properties.section && edge.properties.materiau) ?
            this.calculateResistance(edge.properties.length, edge.properties.section, edge.properties.materiau) : 0;
          chuteTotale += courant * resistance;
        }
      }

      const chuteTotalePercent = 230 > 0 ? (chuteTotale / 230) * 100 : 0; // Tension de référence 230V
      const courant = courants.get(chemin.nodes[chemin.nodes.length - 1]) || 0;

      return {
        ...chemin,
        longueurTotale,
        chuteTotale,
        chuteTotalePercent,
        courant
      };
    });
  }

  /**
   * Calculer la résistance d'un câble
   */
  private static calculateResistance(longueur: number, section: number, materiau: string): number {
    // Résistivité en Ω·mm²/m
    const resistivite = materiau === 'Cu' ? 0.0175 : 0.028; // Cuivre ou Aluminium
    return (resistivite * longueur) / section;
  }

  /**
   * Identifier le chemin le plus défavorisé
   */
  private static findMostDisadvantagedPath(chemins: NetworkPath[]): NetworkPath {
    return chemins.reduce((max, chemin) =>
      chemin.chuteTotalePercent > max.chuteTotalePercent ? chemin : max
    );
  }

  /**
   * Générer les recommandations
   */
  private static generateRecommendations(chemins: NetworkPath[], cheminCritique: NetworkPath): string[] {
    const recommandations: string[] = [];

    if (cheminCritique.chuteTotalePercent > 5) {
      recommandations.push(`Chute de tension excessive (${cheminCritique.chuteTotalePercent.toFixed(1)}%) sur le chemin ${cheminCritique.id}`);
    }

    return recommandations;
  }

  /**
   * Générer les tronçons pour export
   */
  private static generateTronçonsForExport(graph: GraphStore, courants: Map<string, number>): Tronçon[] {
    const tronçons: Tronçon[] = [];

    for (const [edgeId, edge] of graph.edges) {
      const courant = courants.get(edgeId) || 0;
      tronçons.push({
        id: edgeId,
        name: edgeId,
        from: edge.from,
        to: edge.to,
        longueur: edge.properties.length || 0,
        section: edge.properties.section || 0,
        materiau: edge.properties.materiau || 'Cu',
        courant,
        modeInstallation: edge.properties.modeOfInstallation || 'Apparent'
      });
    }

    return tronçons;
  }

  /**
   * Déterminer le verdict global du réseau
   */
  private static determineGlobalVerdict(chemins: NetworkPath[]): 'CONFORME' | 'NON_CONFORME' | 'AVERTISSEMENT' {
    const nonConformes = chemins.filter(c => c.conformite === 'NON_CONFORME');
    const avertissements = chemins.filter(c => c.conformite === 'AVERTISSEMENT');

    if (nonConformes.length > 0) {
      return 'NON_CONFORME';
    } else if (avertissements.length > 0) {
      return 'AVERTISSEMENT';
    } else {
      return 'CONFORME';
    }
  }
}
