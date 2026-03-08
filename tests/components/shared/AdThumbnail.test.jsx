import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdThumbnail from '../../../src/components/shared/AdThumbnail';

const videoAd = {
  format: 'Video',
  platform: 'Meta',
  thumbnail: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  isVideo: true,
};

const imageAd = {
  format: 'Image',
  platform: 'TikTok',
  thumbnail: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  isVideo: false,
};

describe('AdThumbnail', () => {
  it('renders format badge text', () => {
    render(<AdThumbnail ad={videoAd} />);
    expect(screen.getByText('Video')).toBeDefined();
  });

  it('renders platform badge text', () => {
    render(<AdThumbnail ad={videoAd} />);
    expect(screen.getByText('Meta')).toBeDefined();
  });

  it('shows play button when ad.isVideo is true', () => {
    const { container } = render(<AdThumbnail ad={videoAd} />);
    // The play button is inside a div with a Play icon
    const playButtons = container.querySelectorAll('svg');
    expect(playButtons.length).toBeGreaterThan(0);
  });

  it('hides play button when ad.isVideo is false', () => {
    const { container } = render(<AdThumbnail ad={imageAd} />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(0);
  });
});
