import React from "react";

export function AdminAutoFixPanel() {
  // À terme, ces données pourraient venir d'une API ou d'un fichier de log
  const [stats, setStats] = React.useState({
    lastCommit: "",
    fixedErrors: 0,
    lastPort: 8080,
    lastAutoFix: new Date().toLocaleString(),
  });

  // TODO: Récupérer les vraies données (ex: via API ou logs)

  return (
    <section className="bg-white p-6 rounded-lg shadow-md animate-fade-in mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-proqblue">Suivi des corrections automatiques</h2>
      <ul className="text-proqblue-dark space-y-2">
        <li><strong>Dernier commit:</strong> {stats.lastCommit || "Non disponible"}</li>
        <li><strong>Erreurs corrigées automatiquement:</strong> {stats.fixedErrors}</li>
        <li><strong>Dernier port utilisé:</strong> {stats.lastPort}</li>
        <li><strong>Dernière correction automatique:</strong> {stats.lastAutoFix}</li>
      </ul>
    </section>
  );
}
