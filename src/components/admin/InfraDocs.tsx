import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, GitPullRequest, Server, Database, Terminal } from 'lucide-react';

export default function InfraDocs() {
    return (
        <div className="space-y-6">
            <Card className="p-6 bg-white rounded-xl border border-slate-100">
                <h2 className="text-2xl font-black mb-2">Infrastructure Docker</h2>
                <p className="text-sm text-slate-600 mb-4">Documentation rapide des services Docker utilisés par <strong>site-proquelec</strong> et commandes utiles pour les administrateurs.</p>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-bold">Services démarrés</h3>
                        <ul className="list-disc ml-5 mt-2 text-sm text-slate-700 space-y-1">
                            <li><strong>gateway (nginx)</strong> — point d'entrée HTTP (local: <span className="font-mono">3102</span> → container: <span className="font-mono">80</span>).</li>
                            <li><strong>metabase</strong> — BI (local: <span className="font-mono">3111</span> → container: <span className="font-mono">3000</span>).</li>
                            <li><strong>db (postgres)</strong> — base de données (local: <span className="font-mono">5437</span> → container: <span className="font-mono">5432</span>).</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold">Commandes utiles</h3>
                        <div className="mt-2 space-y-2 text-sm">
                            <div className="bg-slate-50 p-3 rounded">Démarrer la stack (depuis la racine du projet):
                                <pre className="mt-2 p-2 bg-white rounded border border-slate-100 font-mono">cd docker
docker compose up -d</pre>
                            </div>

                            <div className="bg-slate-50 p-3 rounded">Arrêter la stack :
                                <pre className="mt-2 p-2 bg-white rounded border border-slate-100 font-mono">docker compose -f docker/docker-compose.yml down</pre>
                            </div>

                            <div className="bg-slate-50 p-3 rounded">Lister les containers actifs :
                                <pre className="mt-2 p-2 bg-white rounded border border-slate-100 font-mono">{'docker ps --format "table {{.Names}}\\t{{.Image}}\\t{{.Ports}}"'}</pre>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold">Éviter les conflits de ports</h3>
                        <p className="text-sm text-slate-700 mt-2">Si un port local est déjà utilisé (ex: <span className="font-mono">:3000</span> ou <span className="font-mono">:5432</span>), modifiez le mappage hôte:container dans <strong>docker/docker-compose.yml</strong> avant de démarrer la stack. Exemple :
                            <pre className="mt-2 p-2 bg-white rounded border border-slate-100 font-mono">ports:
  - "5437:5432"  # hôte:container</pre>
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold">Fichiers et documentation</h3>
                        <p className="text-sm text-slate-700 mt-2">Le fichier principal compose se trouve à : <strong>docker/docker-compose.yml</strong>. Voir aussi <strong>DOCKER_GPU_SETUP_GUIDE.md</strong> et <strong>DOCKER_GPU_CONFIG_MANIFEST.md</strong> pour des guides d'installation avancés.</p>
                        <div className="mt-3 flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText('docker compose -f docker/docker-compose.yml up -d')}>
                                <Copy className="mr-2" /> Copier commande
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
