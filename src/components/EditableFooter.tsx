import React from 'react';
import { Link } from 'react-router-dom';

export const EditableFooter: React.FC<any> = (props: any) => {
  const {
    companyName = 'PROQUELEC',
    backgroundColor = '#1a1a2e',
    textColor = '#ffffff',
    accentColor = '#fbbf24',
    // TODO: Remplacer les URLs sociales ci-dessous par props.settings.facebook_url / props.settings.linkedin_url
    // provenant des paramètres du site (admin → contact ou réseaux sociaux).
    facebookUrl = '#',
    linkedinUrl = '#',
  } = props;
  return (
    <footer style={{ backgroundColor, color: textColor }} className="py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        <div>
          <h3 className="font-bold mb-2">{companyName}</h3>
          <p className="text-sm opacity-75">Information Sensibilisation Conseil</p>
        </div>
        <div>
          <h4 style={{ color: accentColor }} className="font-semibold mb-4">
            Navigation
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/">Accueil</Link>
            </li>
            <li>
              <Link to="/about">À propos</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: accentColor }} className="font-semibold mb-4">
            Services
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/formations">Formations</Link>
            </li>
            <li>
              <Link to="/contact">Audits</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: accentColor }} className="font-semibold mb-4">
            Réseaux
          </h4>
          <div className="flex gap-3">
            <a href={facebookUrl} className="text-sm">
              FB
            </a>
            <a href={linkedinUrl} className="text-sm">
              LI
            </a>
          </div>
        </div>
      </div>
      <div className="border-t text-center text-xs opacity-70 pt-4 mt-8"> 2026 PROQUELEC</div>
    </footer>
  );
};
