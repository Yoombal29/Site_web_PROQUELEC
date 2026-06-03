import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import { DesignEditor } from '@/components/admin/DesignEditor';
import type { PageRecord } from '@/types/PageSystem';

const fakePage: PageRecord = {
  id: 'page-1',
  title: 'Test',
  slug: 'test',
  status: 'published',
  design_options: {
    layout: 'default',
    content_width: 'default',
    hero_enabled: false,
    hero_height: 'medium',
    hero_alignment: 'center',
    hero_overlay: 0.5,
    sidebar_enabled: false,
    sidebar_position: 'left',
    footer_cta_enabled: false,
    background_color: '#ffffff',
    accent_color: '#2563eb',
    text_color: '#111111',
    heading_font: 'system-ui, sans-serif',
    body_font: 'system-ui, sans-serif',
    custom_css: '',
    custom_sections: []
  },
  seo_options: {
    focus_keyword: '',
    meta_description: '',
    canonical_url: '',
    og_title: '',
    og_description: '',
    twitter_card: 'summary',
    schema_type: 'WebPage'
  }
};

describe('DesignEditor', () => {
  it('renders and shows main tabs', () => {
    render(
      <DesignEditor
        page={fakePage}
        onDesignChange={vi.fn()}
        onSeoChange={vi.fn()}
        onLayoutChange={vi.fn()}
        previewMode="desktop"
        onPreviewModeChange={vi.fn()}
      />
    );

    const tablist = screen.getByRole('tablist');
    expect(within(tablist).getByText(/Layout/i)).toBeInTheDocument();
    expect(within(tablist).getByText(/Couleurs/i)).toBeInTheDocument();
    expect(within(tablist).getByText(/SEO/i)).toBeInTheDocument();
  });
});
