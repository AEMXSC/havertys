/* eslint-disable */
/* global WebImporter */

/**
 * Parser for call-to-action-signup
 * Base block: call-to-action
 * Source: https://main--hvt-eds--havertys-furniture.aem.live/free-design-service
 * Model: cta (single richtext "content" field: H2 heading + subheadline paragraph + CTA link)
 * Generated: 2026-05-19
 */
export default function parse(element, { document }) {
  // Extract heading (h2) from call-to-action-text area
  const heading = element.querySelector('.call-to-action-text h2, .call-to-action-main-container h2, h2');

  // Extract description paragraph from call-to-action-text area
  const description = element.querySelector('.call-to-action-text p, .call-to-action-main-container p, p');

  // Extract CTA link from call-to-action-cta area
  const ctaLink = element.querySelector('.call-to-action-cta a, .button-container a, a.button');

  // Build content cell: all content goes into a single richtext field per the cta model
  // The cta model has one field: "content" (richtext) containing h2 + p + link
  const contentCell = [];

  // Add field hint for xwalk Universal Editor integration
  const fieldHint = document.createComment(' field:content ');
  contentCell.push(fieldHint);

  if (heading) {
    contentCell.push(heading);
  }

  if (description) {
    contentCell.push(description);
  }

  if (ctaLink) {
    // Ensure the link is a clean <a> element (unwrap from button-container if needed)
    const link = document.createElement('a');
    link.href = ctaLink.href || ctaLink.getAttribute('href') || '';
    link.textContent = ctaLink.textContent.trim();
    if (ctaLink.title) {
      link.title = ctaLink.title;
    }
    contentCell.push(link);
  }

  // Build cells array: single row with combined content (per cta model structure)
  const cells = [contentCell];

  const block = WebImporter.Blocks.createBlock(document, { name: 'call-to-action-signup', cells });
  element.replaceWith(block);
}
