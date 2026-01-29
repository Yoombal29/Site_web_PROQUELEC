export default function News() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-proqblue mb-4">Actualités PROQUELEC</h1>
          <p className="text-lg text-gray-600">Restez informé des actualités, événements et nouveautés de PROQUELEC</p>
        </div>

        {/* News Articles */}
        <div className="space-y-8">
          {/* Article 1 */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 border-proqblue">
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Nouvelle Formation Électrique</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded">22 Janvier 2026</span>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                PROQUELEC annonce le lancement de sa nouvelle formation spécialisée en installations électriques basse tension.
                Cette formation complète couvre les dernières normes et techniques de l'industrie, avec une approche pratique et modulable
                adaptée aux professionnels de tous les niveaux.
              </p>
              <a href="/formations" className="text-proqblue font-semibold hover:underline inline-flex items-center gap-2">
                Découvrir nos formations →
              </a>
            </div>
          </article>

          {/* Article 2 */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 border-green-600">
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Certification ISO Obtenue</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded">15 Janvier 2026</span>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                PROQUELEC a obtenu sa certification ISO 9001:2015 pour la qualité de ses services et formations.
                Cette reconnaissance témoigne de notre engagement envers l'excellence et la satisfaction de nos clients.
                Nous continuons à améliorer continuellement nos processus et nos offres.
              </p>
              <a href="/certifications" className="text-green-600 font-semibold hover:underline inline-flex items-center gap-2">
                En savoir plus sur nos certifications →
              </a>
            </div>
          </article>

          {/* Article 3 */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 border-purple-600">
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Conférence Énergie & Conformité</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded">8 Janvier 2026</span>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Rejoignez-nous pour une conférence interactive sur les audits énergétiques et la conformité réglementaire.
                Des experts du secteur électrique partageront leurs insights sur les meilleures pratiques et les évolutions normatives.
                Inscription gratuite - Places limitées.
              </p>
              <a href="/events" className="text-purple-600 font-semibold hover:underline inline-flex items-center gap-2">
                Voir tous les événements →
              </a>
            </div>
          </article>

          {/* Article 4 */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 border-orange-600">
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Ressources Techniques Mises à Jour</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded">1 Janvier 2026</span>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Les mémentos techniques et guides pratiques ont été mis à jour selon les dernières normes 2025.
                Consultez nos ressources pour rester à jour sur les normes d'installation, les sections de câbles,
                la prise de terre et tous les domaines de compétence de PROQUELEC.
              </p>
              <a href="/documents" className="text-orange-600 font-semibold hover:underline inline-flex items-center gap-2">
                Accéder aux documents →
              </a>
            </div>
          </article>
        </div>

        {/* Newsletter Section */}
        <div className="mt-16 bg-gradient-to-r from-proqblue to-blue-700 rounded-lg p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Rester Informé</h2>
          <p className="text-lg mb-8 text-blue-100">
            Inscrivez-vous à notre newsletter pour recevoir les actualités directement dans votre boîte mail.
          </p>
          <button className="bg-white text-proqblue px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            S'inscrire à la Newsletter
          </button>
        </div>
      </div>
    </div>
  );
}
