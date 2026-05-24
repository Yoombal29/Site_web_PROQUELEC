/**
 * HomepageBlocks.tsx
 * 
 * "Design Locked" blocks — wrappers around the original homepage components.
 * These preserve 100% of the original animations, design and logic.
 * The BE Builder orchestrates WHICH blocks appear and in WHAT ORDER.
 * 
 * Architecture:
 *   BE Builder JSON → HomepageBlocks registry → Original React component
 */

import React from 'react';
import { HeroBanner } from '@/components/HeroBanner';
import { AudienceOffers } from '@/components/AudienceOffers';
import { VisionMission } from '@/components/VisionMission';
import { LandingStats } from '@/components/LandingStats';
import { LatestNews } from '@/components/LatestNews';
import { PartnerLogos } from '@/components/PartnerLogos';

// ─────────────────────────────────────────────────────────────────────────────
// Block: HeroBanner
// Slides are loaded from DB via useHomeSlides hook. Props are optional overrides.
// ─────────────────────────────────────────────────────────────────────────────
export const HeroBannerBlock: React.FC<Record<string, unknown>> = React.memo((props) => {
  return (
    <HeroBanner
      parallax={props.parallax !== false}
      autoplayInterval={typeof props.autoplayInterval === 'number' ? props.autoplayInterval : 8000}
    />
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Block: AudienceOffers
// Text is driven by site_settings. No props needed.
// ─────────────────────────────────────────────────────────────────────────────
export const AudienceOffersBlock: React.FC<Record<string, unknown>> = React.memo(() => {
  return <AudienceOffers />;
});

// ─────────────────────────────────────────────────────────────────────────────
// Block: VisionMission
// All props are optional and have good defaults.
// ─────────────────────────────────────────────────────────────────────────────
export const VisionMissionBlock: React.FC<Record<string, unknown>> = React.memo((props) => {
  return (
    <VisionMission
      title={typeof props.title === 'string' ? props.title : undefined}
      subtitle={typeof props.subtitle === 'string' ? props.subtitle : undefined}
      description={typeof props.description === 'string' ? props.description : undefined}
      missionTitle={typeof props.missionTitle === 'string' ? props.missionTitle : undefined}
      missionDesc={typeof props.missionDesc === 'string' ? props.missionDesc : undefined}
      visionTitle={typeof props.visionTitle === 'string' ? props.visionTitle : undefined}
      visionDesc={typeof props.visionDesc === 'string' ? props.visionDesc : undefined}
      image={typeof props.image === 'string' ? props.image : undefined}
      badge={typeof props.badge === 'string' ? props.badge : undefined}
    />
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Block: LandingStats
// Stats are loaded from DB via useHomeStats hook.
// ─────────────────────────────────────────────────────────────────────────────
export const LandingStatsBlock: React.FC<Record<string, unknown>> = React.memo(() => {
  return <LandingStats />;
});

// ─────────────────────────────────────────────────────────────────────────────
// Block: LatestNews
// Posts loaded from blog API.
// ─────────────────────────────────────────────────────────────────────────────
export const LatestNewsBlock: React.FC<Record<string, unknown>> = React.memo(() => {
  return <LatestNews />;
});

// ─────────────────────────────────────────────────────────────────────────────
// Block: PartnerLogos
// Partners loaded from API with fallback data.
// ─────────────────────────────────────────────────────────────────────────────
export const PartnerLogosBlock: React.FC<Record<string, unknown>> = React.memo(() => {
  return <PartnerLogos />;
});
