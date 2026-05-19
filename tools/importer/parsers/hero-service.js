/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-service variant.
 * Base block: hero
 * Source: https://main--hvt-eds--havertys-furniture.aem.live/free-design-service
 * Generated: 2026-05-19
 *
 * Source structure: .section.bg-image.hvt-text-container
 *   - Direct child <img> = background/decorative image
 *   - .hvt-text-wrapper .hvt-text contains:
 *     - <h4> eyebrow (e.g. "DESIGN SERVICE")
 *     - <h1> main heading (e.g. "Always Free. Always Inspired.")
 *     - <p><strong> subtext description
 *   - No CTA buttons in this variant (optional per model)
 *
 * Target table (from block library):
 *   Row 1: Background image (optional)
 *   Row 2: Eyebrow + Heading + Subtext + CTAs (optional)
 *
 * UE Model fields: eyebrow, heading, subtext, cta-primary-label, cta-primary-href,
 *                  cta-secondary-label, cta-secondary-href
 */
export default function parse(element, { document }) {
  // Extract background image from section direct child or nested picture
  const bgImage = element.querySelector(':scope > img, :scope > picture, :scope > div > picture');

  // Extract text content from the hvt-text block
  const textBlock = element.querySelector('.hvt-text, .hero.block, [class*="hvt-text"]');

  // Eyebrow - typically h4 or h5 with short uppercase text
  const eyebrow = textBlock
    ? textBlock.querySelector('h4, h5, .eyebrow, [class*="eyebrow"]')
    : element.querySelector('h4, h5, .eyebrow, [class*="eyebrow"]');

  // Main heading - h1 or h2
  const heading = textBlock
    ? textBlock.querySelector('h1, h2, [class*="heading"]')
    : element.querySelector('h1, h2, [class*="heading"]');

  // Subtext - paragraph content, often with <strong>
  const subtext = textBlock
    ? textBlock.querySelector('p, .description, [class*="subtext"]')
    : element.querySelector('p, .description, [class*="subtext"]');

  // CTA buttons (optional in this variant, but supported by model)
  const ctaPrimary = element.querySelector('a.button.primary, a.cta-primary, a.button:first-of-type');
  const ctaSecondary = element.querySelector('a.button.secondary, a.cta-secondary, a.button:nth-of-type(2)');

  const cells = [];

  // Row 1: Background image (per block library structure)
  if (bgImage) {
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(bgImage);
    cells.push([imageCell]);
  } else {
    // Empty row for image - required for xwalk structure
    cells.push(['']);
  }

  // Row 2: Content cell with eyebrow + heading + subtext + optional CTAs
  const contentCell = document.createDocumentFragment();

  if (eyebrow) {
    const eyebrowHint = document.createComment(' field:eyebrow ');
    contentCell.appendChild(eyebrowHint);
    contentCell.appendChild(eyebrow);
  }

  if (heading) {
    const headingHint = document.createComment(' field:heading ');
    contentCell.appendChild(headingHint);
    contentCell.appendChild(heading);
  }

  if (subtext) {
    const subtextHint = document.createComment(' field:subtext ');
    contentCell.appendChild(subtextHint);
    contentCell.appendChild(subtext);
  }

  if (ctaPrimary) {
    const ctaPrimaryHint = document.createComment(' field:cta-primary-label ');
    contentCell.appendChild(ctaPrimaryHint);
    contentCell.appendChild(ctaPrimary);
  }

  if (ctaSecondary) {
    const ctaSecondaryHint = document.createComment(' field:cta-secondary-label ');
    contentCell.appendChild(ctaSecondaryHint);
    contentCell.appendChild(ctaSecondary);
  }

  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-service', cells });
  element.replaceWith(block);
}
