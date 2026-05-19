/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-video-sale
 * Base block: hero
 * Source: https://main--hvt-eds--havertys-furniture.aem.live/
 * Generated: 2026-05-19
 *
 * Extracts a hero block with background video, eyebrow text, heading,
 * optional feature text link, and primary CTA button.
 *
 * Source structure:
 *   .hero-main-container
 *     .hero-video-wrapper > video.hero-video (background video)
 *     .feature-product-text > p > a (secondary/feature link)
 *     .hero-text-content > .para
 *       h4 (eyebrow)
 *       h1 (heading)
 *       .hero-button-wrapper > .button-container > a.button (primary CTA)
 *
 * Target table (per block library):
 *   Row 1: Background media (video element)
 *   Row 2: Content (eyebrow + heading + feature text + CTA)
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 1: Background media (video)
  // Validated selectors: video.hero-video inside .hero-video-wrapper
  const video = element.querySelector('.hero-video-wrapper video.hero-video, .hero-video-wrapper video, video');
  const mediaCell = document.createDocumentFragment();
  mediaCell.appendChild(document.createComment(' field:backgroundMedia '));
  if (video) {
    mediaCell.appendChild(video.cloneNode(true));
  }
  cells.push([mediaCell]);

  // Row 2: Content cell (eyebrow, heading, subtext/feature text, CTA)
  const contentCell = document.createDocumentFragment();
  contentCell.appendChild(document.createComment(' field:content '));

  // Eyebrow (h4 in .hero-text-content or .hero-hero-gradient-layout)
  const eyebrow = element.querySelector('.hero-text-content h4, .hero-hero-gradient-layout h4, .para h4');
  if (eyebrow) {
    contentCell.appendChild(eyebrow.cloneNode(true));
  }

  // Main heading (h1 in .hero-text-content or .hero-hero-gradient-layout)
  const heading = element.querySelector('.hero-text-content h1, .hero-hero-gradient-layout h1, .para h1, .para h2');
  if (heading) {
    contentCell.appendChild(heading.cloneNode(true));
  }

  // Feature/subtext (link in .feature-product-text — secondary descriptive link)
  const featureText = element.querySelector('.feature-product-text p, .feature-product-text');
  if (featureText) {
    const featurePara = featureText.tagName === 'P' ? featureText : featureText.querySelector('p');
    if (featurePara) {
      contentCell.appendChild(featurePara.cloneNode(true));
    }
  }

  // Primary CTA button(s)
  const ctaLinks = element.querySelectorAll(
    '.hero-button-wrapper a.button, .hero-button-wrapper a, .button-container a.button'
  );
  ctaLinks.forEach((link) => {
    const p = document.createElement('p');
    p.appendChild(link.cloneNode(true));
    contentCell.appendChild(p);
  });

  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-video-sale', cells });
  element.replaceWith(block);
}
