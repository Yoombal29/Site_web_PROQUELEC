
import { apiFetch } from '@/lib/api-client';

export const seedElectricalData = async () => {
  try {
    // Certifications électriques
    const certifications = [
    {
      name: "Habilitation Électrique B1V",
      code: "B1V",
      description: "Habilitation pour travaux électriques en basse tension avec voisinage",
      validity_period: 36,
      required_training_hours: 21,
      certification_body: "AFNOR Certification",
      cost: 450,
      requirements: [
      "Avoir des compétences en électricité",
      "Être âgé d'au moins 18 ans",
      "Avoir une aptitude médicale"]

    },
    {
      name: "Habilitation Électrique H0V",
      code: "H0V",
      description: "Habilitation pour personnel non électricien travaillant au voisinage de la haute tension",
      validity_period: 36,
      required_training_hours: 14,
      certification_body: "AFNOR Certification",
      cost: 350,
      requirements: [
      "Formation à la sécurité électrique",
      "Sensibilisation aux risques électriques"]

    },
    {
      name: "Qualification QualiPV",
      code: "QUALIPV",
      description: "Qualification pour l'installation de systèmes photovoltaïques",
      validity_period: 48,
      required_training_hours: 35,
      certification_body: "Qualit'EnR",
      cost: 890,
      requirements: [
      "Être électricien qualifié",
      "Expérience en installations électriques",
      "Formation aux énergies renouvelables"]

    }];


    for (const cert of certifications) {
      await apiFetch('/api/electrical-certifications', {
        method: 'POST',
        body: JSON.stringify(cert)
      });
    }

    // Formations professionnelles
    const trainings = [
    {
      title: "Formation Habilitation Électrique B1V",
      description: "Formation complète pour obtenir l'habilitation B1V permettant de réaliser des travaux électriques en basse tension",
      duration_hours: 21,
      level: "intermédiaire",
      price: 450,
      max_participants: 8,
      instructor_name: "Jean-Pierre MARTIN",
      location: "Centre de formation PROQUELEC - Dakar",
      equipment_provided: true,
      prerequisites: [
      "Connaissances de base en électricité",
      "Expérience pratique souhaitée",
      "Aptitude médicale valide"],

      learning_objectives: [
      "Identifier les risques électriques",
      "Appliquer les consignes de sécurité",
      "Utiliser les équipements de protection",
      "Réaliser des travaux hors tension",
      "Intervenir en sécurité sur installations BT"]

    },
    {
      title: "Installation Photovoltaïque - Niveau Avancé",
      description: "Formation spécialisée pour l'installation et la maintenance de systèmes photovoltaïques",
      duration_hours: 35,
      level: "avancé",
      price: 890,
      max_participants: 6,
      instructor_name: "Amadou DIOP",
      location: "Site de démonstration - Thiès",
      equipment_provided: true,
      prerequisites: [
      "Habilitation électrique B2V minimum",
      "2 ans d'expérience en électricité",
      "Notions de base en énergies renouvelables"],

      learning_objectives: [
      "Dimensionner une installation PV",
      "Installer les panneaux et onduleurs",
      "Configurer le système de monitoring",
      "Effectuer la mise en service",
      "Planifier la maintenance préventive"]

    },
    {
      title: "Sécurité Électrique pour Non-Électriciens",
      description: "Formation de sensibilisation aux risques électriques pour personnel non spécialisé",
      duration_hours: 7,
      level: "débutant",
      price: 180,
      max_participants: 15,
      instructor_name: "Fatou KANE",
      location: "Salle de formation PROQUELEC",
      equipment_provided: false,
      prerequisites: [
      "Aucun prérequis technique",
      "Personnel travaillant à proximité d'installations électriques"],

      learning_objectives: [
      "Reconnaître les dangers électriques",
      "Adopter les bons réflexes de sécurité",
      "Connaître les gestes de premier secours",
      "Utiliser les EPI appropriés"]

    }];


    for (const training of trainings) {
      await apiFetch('/api/professional-training', {
        method: 'POST',
        body: JSON.stringify(training)
      });
    }

    // Équipements électriques
    const equipment = [
    {
      name: "Multimètre Numérique Fluke 87V",
      category: "mesure",
      brand: "Fluke",
      model: "87V",
      // Flatten specifications for API compatibility if needed, or server handles JSONB
      // Assuming server handles text/json or we might need to adjust.
      // The table schema has standard fields, but specifications might need to be in description or a new field.
      // The table I created earlier:
      // CREATE TABLE IF NOT EXISTS public.electrical_equipment(..., description TEXT, ...)
      // It doesn't look like it has a JSONB specifications column.
      // I'll append specs to description for now to be safe, or I should have added a jsonb column.
      // Let's modify the seed to use description effectively.
      description: "Multimètre industriel haute performance pour mesures électriques précises. Spécifications: Tension max 1000V, Courant max 10A, Résistance max 50MΩ, Précision ±0.05%.",
      price: 450,
      // rental_price_daily is not in the schema I saw/created? 
      // Wait, I saw: 
      // CREATE TABLE IF NOT EXISTS public.electrical_equipment( ..., price DECIMAL(10,2), stock_quantity INTEGER DEFAULT 0, image_url TEXT ...)
      // It seems simpler than the seed data implies. I will map what I can.
      stock_quantity: 5
      // is_rental field missing in DB. Ignoring.
      // certification_standards missing. Ignoring.
      // safety_instructions missing. Ignoring.
    },
    {
      name: "Pince Ampèremétrique Chauvin Arnoux F605",
      category: "mesure",
      brand: "Chauvin Arnoux",
      model: "F605",
      description: "Pince ampèremétrique pour mesures de courant sans coupure. Ouverture 52mm, Courant AC 600A, Tension max 600V.",
      price: 280,
      stock_quantity: 8
    }];


    for (const eq of equipment) {
      await apiFetch('/api/electrical-equipment', {
        method: 'POST',
        body: JSON.stringify(eq)
      });
    }

    // Normes électriques
    const standards = [
    {
      code: "NFC 15-100",
      title: "Installations électriques à basse tension",
      description: "Norme française définissant les règles de conception et de réalisation des installations électriques BT",
      category: "installation",
      version: "2015 + A5:2019",
      // publication_date, effective_date, applicable_sectors not in my simple schema?
      // simple schema: title, code, category, description, version, status, document_url, summary
      summary: "Règles de sécurité pour les installations électriques domestiques et tertiaires",
      status: "active"
    },
    {
      code: "IEC 60364",
      title: "Installations électriques des bâtiments",
      description: "Norme internationale pour les installations électriques basse tension. Standard international harmonisé.",
      category: "installation",
      version: "2018",
      summary: "Standard international harmonisé pour les installations électriques",
      status: "active"
    }];


    for (const std of standards) {
      await apiFetch('/api/electrical-standards', {
        method: 'POST',
        body: JSON.stringify(std)
      });
    }


    return { success: true };

  } catch (error: unknown) {
    console.error('Erreur lors de la création des données:', error);
    return { success: false, error };
  }
};