/* eslint-disable */
/* global WebImporter */

/**
 * Parser for product-carousel
 * Base block: product-carousel
 * Source: https://main--hvt-eds--havertys-furniture.aem.live/free-design-service
 * Generated: 2026-05-19T18:42:00.000Z
 *
 * Extracts the section heading from a "shop the look" style product carousel
 * on service pages. Products are loaded dynamically via commerce API at runtime -
 * only the title heading is authored content that needs importing.
 *
 * Source DOM structure:
 *   .product-carousel.block > div
 *     .content-container > .content-container-wrapper
 *       div > div > p.titleStyle-h4  (section heading, e.g. "Shop the look")
 *       .para > div  (empty description area)
 *     .product-container  (dynamic commerce products - not imported)
 *
 * Target block structure:
 *   Single row with the section heading text.
 *   Row 1: [heading]
 *
 * Selector: .product-carousel-container .product-carousel.block
 */
export default function parse(element, { document }) {
  // Extract the section heading from the content container
  // Source uses p.titleStyle-h4 as the heading element
  const heading = element.querySelector(
    '.content-container p.titleStyle-h4, .content-container p[class*="titleStyle"], .content-container h4, .content-container h3, .content-container h2'
  );

  const cells = [];

  // Row 1: Section heading content with field hint for xwalk UE integration
  const contentCell = document.createDocumentFragment();
  contentCell.appendChild(document.createComment(' field:title '));

  if (heading) {
    // Convert the p.titleStyle-h4 to a proper h4 for semantic correctness
    const h4 = document.createElement('h4');
    h4.textContent = heading.textContent.trim();
    contentCell.appendChild(h4);
  }

  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'product-carousel', cells });
  element.replaceWith(block);
}
