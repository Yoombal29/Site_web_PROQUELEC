/**
 * NS 01-001 Data Loader
 * Chargement et gestion de la norme sénégalaise NS 01-001
 */

import ns01001Data from '../docs/NS01001/FINAL_DATA/NS01001_v2_core.json';
import sommaireData from '../docs/NS01001/FINAL_DATA/sommaire_gold.json';

export interface NS01001Rule {
    id: string;
    titre: string;
    article: string;
    content: string;
    page: number;
}

export interface SommaireEntry {
    index: string;
    label: string;
    level: number;
    children?: SommaireEntry[];
}

/**
 * Classe singleton pour gérer les données NS 01-001
 */
class NS01001Manager {
    private static instance: NS01001Manager;
    private rules: NS01001Rule[];
    private sommaire: SommaireEntry[];
    private searchIndex: Map<string, NS01001Rule[]>;

    private constructor() {
        this.rules = ns01001Data as NS01001Rule[];
        this.sommaire = sommaireData as SommaireEntry[];
        this.searchIndex = new Map();
        this.buildSearchIndex();
    }

    static getInstance(): NS01001Manager {
        if (!NS01001Manager.instance) {
            NS01001Manager.instance = new NS01001Manager();
        }
        return NS01001Manager.instance;
    }

    /**
     * Construction d'un index de recherche pour améliorer les performances
     */
    private buildSearchIndex(): void {
        this.rules.forEach(rule => {
            // Indexation par article
            const articleKey = rule.article.toLowerCase();
            if (!this.searchIndex.has(articleKey)) {
                this.searchIndex.set(articleKey, []);
            }
            this.searchIndex.get(articleKey)!.push(rule);

            // Indexation par mots-clés du contenu
            const words = rule.content.toLowerCase().split(/\s+/).filter(w => w.length > 3);
            words.slice(0, 20).forEach(word => {
                if (!this.searchIndex.has(word)) {
                    this.searchIndex.set(word, []);
                }
                this.searchIndex.get(word)!.push(rule);
            });
        });
    }

    /**
     * Recherche full-text dans toutes les règles
     */
    searchRules(query: string, limit: number = 10): NS01001Rule[] {
        const searchTerms = query.toLowerCase().split(/\s+/);
        const results = new Map<string, { rule: NS01001Rule, score: number }>();

        searchTerms.forEach(term => {
            // Recherche exacte dans l'index
            const indexedRules = this.searchIndex.get(term) || [];
            indexedRules.forEach(rule => {
                const existing = results.get(rule.id);
                const score = (existing?.score || 0) + 1;
                results.set(rule.id, { rule, score });
            });

            // Recherche partielle dans le contenu
            this.rules.forEach(rule => {
                if (rule.content.toLowerCase().includes(term)) {
                    const existing = results.get(rule.id);
                    const score = (existing?.score || 0) + 0.5;
                    results.set(rule.id, { rule, score });
                }
            });
        });

        // Tri par score décroissant
        return Array.from(results.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(r => r.rule);
    }

    /**
     * Recherche par numéro d'article exact
     */
    findByArticle(articleRef: string): NS01001Rule | undefined {
        return this.rules.find(r => r.article === articleRef);
    }

    /**
     * Obtenir toutes les règles d'un titre spécifique
     */
    getRulesByTitre(titreNumber: string): NS01001Rule[] {
        const pattern = new RegExp(`TITRE ${titreNumber}`, 'i');
        return this.rules.filter(r => pattern.test(r.titre));
    }

    /**
     * Obtenir toutes les règles d'une annexe
     */
    getRulesByAnnexe(annexeLetter: string): NS01001Rule[] {
        const pattern = new RegExp(`ANNEXE ${annexeLetter}`, 'i');
        return this.rules.filter(r => pattern.test(r.titre));
    }

    /**
     * Obtenir le sommaire complet
     */
    getSommaire(): SommaireEntry[] {
        return this.sommaire;
    }

    /**
     * Obtenir toutes les règles
     */
    getAllRules(): NS01001Rule[] {
        return this.rules;
    }

    /**
     * Statistiques
     */
    getStats() {
        const titres = new Set(this.rules.map(r => r.titre)).size;
        const annexes = this.rules.filter(r => r.titre.includes('ANNEXE')).length;

        return {
            totalRules: this.rules.length,
            totalTitres: titres,
            totalAnnexes: annexes,
            pageRange: {
                start: Math.min(...this.rules.map(r => r.page)),
                end: Math.max(...this.rules.map(r => r.page))
            }
        };
    }
}

// Export singleton
export const ns01001Manager = NS01001Manager.getInstance();

// Export helpers
export const searchNS01001 = (query: string, limit?: number) =>
    ns01001Manager.searchRules(query, limit);

export const findArticle = (articleRef: string) =>
    ns01001Manager.findByArticle(articleRef);

export const getRulesByTitre = (titreNumber: string) =>
    ns01001Manager.getRulesByTitre(titreNumber);

export const getSommaire = () =>
    ns01001Manager.getSommaire();

export const getStats = () =>
    ns01001Manager.getStats();
