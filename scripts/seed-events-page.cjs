#!/usr/bin/env node
/**
 * Seed minimal dynamic data for /events:
 * - site_settings.page_sections.events controls page copy and CTA labels
 * - public.events controls the cards displayed on the public page
 */
const path = require('path');
const { Pool } = require('pg');

require('dotenv').config({
  override: true,
  path: path.resolve(__dirname, '../.env'),
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/proquelec',
});

const pageConfig = {
  sections: [
    { id: 'hero', label: 'Hero agenda', icon: 'Calendar' },
    { id: 'official', label: 'Événements PROQUELEC', icon: 'ShieldCheck' },
    { id: 'partners', label: 'Événements partenaires', icon: 'Handshake' },
    { id: 'cta', label: 'Appel à proposition', icon: 'Monitor' },
  ],
  content: {
    hero: {
      badge: 'Calendrier Expert',
      title: 'Événements & Agenda',
      subtitle: "Le carrefour de l'expertise électrique",
      description:
        'Participez aux moments forts du secteur : conférences institutionnelles PROQUELEC, ateliers techniques et initiatives partenaires.',
      primaryLabel: 'Voir les événements officiels',
      primaryHref: '#official',
      secondaryLabel: 'Événements partenaires',
      secondaryHref: '#partners',
    },
    official: {
      badge: 'Institutionnel',
      title: 'Événements PROQUELEC',
      subtitle:
        'Nos rendez-vous officiels pour la promotion de la sécurité et de la qualité électrique au Sénégal.',
    },
    partners: {
      badge: 'Écosystème',
      title: 'Événements Partenaires',
      subtitle:
        "Des initiatives portées par nos partenaires agréés et certifiés, validées par l'expertise PROQUELEC.",
      buttonLabel: 'Devenir Partenaire',
      buttonHref: '/partner',
    },
    cta: {
      title: 'Diffusez votre expertise via le réseau PROQUELEC',
      description:
        "Partenaires, proposez vos ateliers et conférences sur notre plateforme pour toucher l'ensemble des professionnels du secteur.",
      primaryLabel: 'Soumettre un événement',
      primaryHref: '/contact',
      secondaryLabel: 'En savoir plus',
      secondaryHref: '/partenaires',
    },
  },
};

const events = [
  {
    title: 'Conférence technique : normes 2026',
    date: '2026-07-15T09:00:00.000Z',
    location: 'Siège PROQUELEC, Dakar',
    organizer_type: 'proquelec',
    details: {
      description:
        "Session institutionnelle pour décrypter les évolutions des normes d'installation électrique au Sénégal.",
      time: '09:00',
      endTime: '13:00',
      category: 'conference',
      organizer: 'PROQUELEC',
      maxAttendees: 120,
      eventStatus: 'planifie',
      type: 'Officiel',
      registrationUrl: '/contact',
    },
  },
  {
    title: 'Atelier pratique : solaire et stockage',
    date: '2026-08-05T08:30:00.000Z',
    location: 'Centre de Formation PROQUELEC',
    organizer_type: 'proquelec',
    details: {
      description:
        "Mise en oeuvre de systèmes photovoltaïques avec gestion intelligente de l'énergie et points de conformité.",
      time: '08:30',
      endTime: '17:30',
      category: 'formation',
      organizer: 'PROQUELEC',
      maxAttendees: 40,
      eventStatus: 'planifie',
      type: 'Officiel',
      registrationUrl: '/contact',
    },
  },
  {
    title: "Salon de l'énergie renouvelable",
    date: '2026-08-20T10:00:00.000Z',
    location: 'Place du Souvenir, Dakar',
    organizer_type: 'partner',
    details: {
      description:
        'Rendez-vous des acteurs locaux du renouvelable avec démonstrations et rencontres professionnelles.',
      time: '10:00',
      endTime: '18:00',
      category: 'partenaire',
      organizer: 'EnergiTech Sénégal',
      maxAttendees: 250,
      eventStatus: 'planifie',
      type: 'Partenaire',
      registrationUrl: '/partner',
    },
  },
  {
    title: 'Webinaire : domotique et sécurité',
    date: '2026-09-02T14:00:00.000Z',
    location: 'Lien envoyé par email',
    organizer_type: 'partner',
    details: {
      description:
        'Intégrer des solutions connectées tout en respectant les fondamentaux de la sécurité électrique.',
      time: '14:00',
      endTime: '15:30',
      category: 'partenaire',
      organizer: 'SmartHome Africa',
      maxAttendees: 300,
      eventStatus: 'planifie',
      type: 'Partenaire',
      registrationUrl: '/partner',
    },
  },
];

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE public.site_settings
          SET page_sections = COALESCE(page_sections, '{}'::jsonb) || jsonb_build_object('events', $1::jsonb),
              updated_at = NOW()
        WHERE id = 1`,
      [JSON.stringify(pageConfig)],
    );

    const count = await client.query('SELECT count(*)::int AS total FROM public.events');
    if (count.rows[0].total === 0) {
      for (const event of events) {
        await client.query(
          `INSERT INTO public.events
            (title, date, location, details, status, organizer_type, created_at)
           VALUES ($1, $2, $3, $4, 'published', $5, NOW())`,
          [
            event.title,
            event.date,
            event.location,
            JSON.stringify(event.details),
            event.organizer_type,
          ],
        );
      }
    }

    await client.query('COMMIT');
    console.log('[events-page] Seed complete');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('[events-page] Seed failed:', error);
  process.exit(1);
});
