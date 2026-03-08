import { describe, it, expect } from 'vitest';
import { ROUTE_CONFIG, getRouteConfig } from '../../src/config/routes.js';

describe('ROUTE_CONFIG', () => {
  it('has a key for /', () => {
    expect(ROUTE_CONFIG['/']).toBeDefined();
  });

  it('has a key for /analyze/acquisition', () => {
    expect(ROUTE_CONFIG['/analyze/acquisition']).toBeDefined();
  });

  it('has a key for /analyze/conversion', () => {
    expect(ROUTE_CONFIG['/analyze/conversion']).toBeDefined();
  });

  it('has a key for /copilot', () => {
    expect(ROUTE_CONFIG['/copilot']).toBeDefined();
  });

  it('/analyze/acquisition has the correct 7 valid tabs', () => {
    const tabs = ROUTE_CONFIG['/analyze/acquisition'].validTabs;
    expect(tabs).toEqual([
      'channels',
      'creatives',
      'campaigns',
      'adSets',
      'landingPages',
      'topPerformers',
      'comparative',
    ]);
  });

  it('/analyze/acquisition has showFilterBar set to true', () => {
    expect(ROUTE_CONFIG['/analyze/acquisition'].showFilterBar).toBe(true);
  });
});

describe('getRouteConfig', () => {
  it('returns config for exact match paths', () => {
    const config = getRouteConfig('/');
    expect(config).toBe(ROUTE_CONFIG['/']);
  });

  it('returns config for /analyze/acquisition exact match', () => {
    const config = getRouteConfig('/analyze/acquisition');
    expect(config).toBe(ROUTE_CONFIG['/analyze/acquisition']);
  });

  it('returns config for /copilot exact match', () => {
    const config = getRouteConfig('/copilot');
    expect(config).toBe(ROUTE_CONFIG['/copilot']);
  });

  it('returns creative detail config for dynamic /creatives/:id path', () => {
    const config = getRouteConfig('/creatives/abc-123');
    expect(config.breadcrumbs).toHaveLength(3);
    expect(config.breadcrumbs[0].label).toBe('Analyze');
    expect(config.breadcrumbs[1].label).toBe('Creatives');
    expect(config.breadcrumbs[1].to).toBe('/analyze/acquisition?tab=creatives');
    expect(config.breadcrumbs[2].label).toBe('Detail');
  });

  it('returns Home breadcrumb for unknown paths', () => {
    const config = getRouteConfig('/nonexistent');
    expect(config.breadcrumbs).toHaveLength(1);
    expect(config.breadcrumbs[0].label).toBe('Home');
  });
});
