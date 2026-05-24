
import React, { lazy, Suspense } from 'react';

// Lazy load core blocks
const HeroBlock = lazy(() => import('./blocks/CoreBlocks').then(m => ({ default: m.HeroBlock })));
const TextBlock = lazy(() => import('./blocks/CoreBlocks').then(m => ({ default: m.TextBlock })));
const ImageBlock = lazy(() => import('./blocks/CoreBlocks').then(m => ({ default: m.ImageBlock })));
const HtmlBlock = lazy(() => import('./blocks/CoreBlocks').then(m => ({ default: m.HtmlBlock })));
const SectionBlock = lazy(() => import('./blocks/CoreBlocks').then(m => ({ default: m.SectionBlock })));

// Lazy load homepage blocks
const HeroBannerBlock = lazy(() => import('./HomepageBlocks').then(m => ({ default: m.HeroBannerBlock })));
const AudienceOffersBlock = lazy(() => import('./HomepageBlocks').then(m => ({ default: m.AudienceOffersBlock })));
const VisionMissionBlock = lazy(() => import('./HomepageBlocks').then(m => ({ default: m.VisionMissionBlock })));
const LandingStatsBlock = lazy(() => import('./HomepageBlocks').then(m => ({ default: m.LandingStatsBlock })));
const LatestNewsBlock = lazy(() => import('./HomepageBlocks').then(m => ({ default: m.LatestNewsBlock })));
const PartnerLogosBlock = lazy(() => import('./HomepageBlocks').then(m => ({ default: m.PartnerLogosBlock })));

// Loading fallback
const BlockLoadingFallback = () => (
  <div className="p-4 border border-slate-200 bg-slate-50 rounded animate-pulse">
    <div className="h-4 bg-slate-200 rounded mb-2"></div>
    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
  </div>
);

// Mapping Type JSON -> React Component
export const ComponentRegistry: Record<string, React.FC<any>> = {
  // ── Core generic blocks ───────────────────────────────────────────────────
  'hero': (props) => (
    <Suspense fallback={<BlockLoadingFallback />}>
      <HeroBlock {...props} />
    </Suspense>
  ),
  'section': (props) => (
    <Suspense fallback={<BlockLoadingFallback />}>
      <SectionBlock {...props} />
    </Suspense>
  ),
  'html': (props) => (
    <Suspense fallback={<BlockLoadingFallback />}>
      <HtmlBlock {...props} />
    </Suspense>
  ),
  'text-block': (props) => (
    <Suspense fallback={<BlockLoadingFallback />}>
      <TextBlock {...props} />
    </Suspense>
  ),
  'image': (props) => (
    <Suspense fallback={<BlockLoadingFallback />}>
      <ImageBlock {...props} />
    </Suspense>
  ),
  // backwards compat
  'text': (props) => (
    <Suspense fallback={<BlockLoadingFallback />}>
      <TextBlock {...props} />
    </Suspense>
  ),
  'code': (props) => (
    <Suspense fallback={<BlockLoadingFallback />}>
      <HtmlBlock {...props} />
    </Suspense>
  ),

  // ── Homepage "Design Locked" blocks ────────────────────────────────────────
  // These map to the original React components → pixel-perfect rendering
  'HeroBanner': (props) => (
    <Suspense fallback={<BlockLoadingFallback />}>
      <HeroBannerBlock {...props} />
    </Suspense>
  ),
  'AudienceOffers': (props) => (
    <Suspense fallback={<BlockLoadingFallback />}>
      <AudienceOffersBlock {...props} />
    </Suspense>
  ),
  'VisionMission': (props) => (
    <Suspense fallback={<BlockLoadingFallback />}>
      <VisionMissionBlock {...props} />
    </Suspense>
  ),
  'LandingStats': (props) => (
    <Suspense fallback={<BlockLoadingFallback />}>
      <LandingStatsBlock {...props} />
    </Suspense>
  ),
  'LatestNews': (props) => (
    <Suspense fallback={<BlockLoadingFallback />}>
      <LatestNewsBlock {...props} />
    </Suspense>
  ),
  'PartnerLogos': (props) => (
    <Suspense fallback={<BlockLoadingFallback />}>
      <PartnerLogosBlock {...props} />
    </Suspense>
  ),
};
