/* eslint-disable */
/* global WebImporter */

/**
 * Parser for product-carousel-sale
 * Base block: carousel
 * Source: https://main--hvt-eds--havertys-furniture.aem.live/sale
 * Generated: 2026-05-19
 *
 * Extracts the category heading from a commerce-integrated product carousel.
 * Products are loaded dynamically via commerce API at runtime - only the
 * category title heading is authored content that needs importing.
 *
 * Source DOM structure:
 *   .product-carousel.block > div
 *     .content-container > .content-container-wrapper
 *       div > div > p.titleStyle-h4  (category heading, e.g. "Shop Living Room Savings")
 *     .product-container  (dynamic commerce products - not imported)
 *
 * Target block structure:
 *   Single row with the category heading text.
 *   Row 1: [heading]
 */
export default function parse(element, { document }) {
  // Extract the category heading from the content container
  // Source uses p.titleStyle-h4 as the heading element
  const heading = element.querySelector(
    '.content-container p.titleStyle-h4, .content-container h4, .content-container h3, .content-container h2, .content-container p[class*="titleStyle"]'
  );

  const cells = [];

  // Row 1: Category heading content
  const contentCell = document.createDocumentFragment();
  contentCell.appendChild(document.createComment(' field:title '));

  if (heading) {
    // Convert the p.titleStyle-h4 to a proper h4 for semantic correctness
    const h4 = document.createElement('h4');
    h4.textContent = heading.textContent.trim();
    contentCell.appendChild(h4);
  }

  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'product-carousel-sale', cells });
  element.replaceWith(block);
}
