/* eslint-disable */
/* global WebImporter */
/**
 * Parser for call-to-action-promo
 * Base block: call-to-action
 * Source: https://main--hvt-eds--havertys-furniture.aem.live/
 * Generated: 2026-05-19
 *
 * Structure: Single row with one cell containing all content
 * (eyebrow heading + main heading + body text + CTA button).
 * UE model field: "content" (richtext)
 */
export default function parse(element, { document }) {
  // Extract text content container preserving natural DOM order
  const textContainer = element.querySelector('.call-to-action-text > div, .call-to-action-text');

  // Extract CTA button(s)
  const ctaLinks = Array.from(
    element.querySelectorAll('.call-to-action-cta a.button, .call-to-action-cta a')
  );

  // Build single content container for one cell
  const container = document.createElement('div');

  // Add field hint for xwalk UE model
  container.appendChild(document.createComment(' field:content '));

  // Append text content elements in their natural DOM order
  // (handles variations: eyebrow+heading+body, heading+subheading, etc.)
  if (textContainer) {
    const contentElements = textContainer.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
    contentElements.forEach((el) => {
      container.appendChild(el);
    });
  }

  // Add CTA button links
  ctaLinks.forEach((link) => {
    // Wrap in paragraph for proper block table rendering
    const p = document.createElement('p');
    p.appendChild(link.cloneNode(true));
    container.appendChild(p);
  });

  // Build cells array - single row with single cell
  const cells = [[container]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'call-to-action-promo', cells });
  element.replaceWith(block);
}
