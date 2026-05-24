
import React from 'react';
import {
  HeroBlock,
  TextBlock,
  ImageBlock,
  HtmlBlock,
  SectionBlock } from
'./blocks/CoreBlocks';

import {
  HeroBannerBlock,
  AudienceOffersBlock,
  VisionMissionBlock,
  LandingStatsBlock,
  LatestNewsBlock,
  PartnerLogosBlock
} from './HomepageBlocks';

// Mapping Type JSON -> React Component
export const ComponentRegistry: Record<string, React.FC<unknown>> = {
  // ── Core generic blocks ───────────────────────────────────────────────────
  'hero': HeroBlock,
  'section': SectionBlock,
  'html': HtmlBlock,
  'text-block': TextBlock,
  'image': ImageBlock,
  // backwards compat
  'text': TextBlock,
  'code': HtmlBlock,

  // ── Homepage "Design Locked" blocks ────────────────────────────────────────
  // These map to the original React components → pixel-perfect rendering
  'HeroBanner': HeroBannerBlock,
  'AudienceOffers': AudienceOffersBlock,
  'VisionMission': VisionMissionBlock,
  'LandingStats': LandingStatsBlock,
  'LatestNews': LatestNewsBlock,
  'PartnerLogos': PartnerLogosBlock,
};