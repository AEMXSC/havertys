/* eslint-disable */
/* global WebImporter */

/**
 * Parser for commerce-teaser-featured
 * Base block: commerce-teaser
 * Source: https://main--hvt-eds--havertys-furniture.aem.live/rfg
 * Generated: 2026-05-19
 *
 * Extracts featured commerce teasers with large side-by-side image + content layout.
 * Source has .commerce-teaser-wrapper with .featured-right or .featured-left class.
 * Produces a single row with two columns: [image, content].
 * Content column includes heading (h3), description paragraph, and multiple CTA links.
 *
 * Distinguishes from card-variation teasers (handled by cards-linked-image parser)
 * by checking for the featured-right or featured-left wrapper class.
 */
export default function parse(element, { document }) {
  // Only process featured teasers (not card-variation ones in grid wrappers)
  const wrapper = element.closest('.commerce-teaser-wrapper');
  if (!wrapper || (!wrapper.classList.contains('featured-right') && !wrapper.classList.contains('featured-left'))) {
    // Not a featured teaser — skip by replacing with empty comment
    element.replaceWith(document.createComment(''));
    return;
  }

  const cells = [];

  // Column 1: Featured image with field hint
  const img = element.querySelector('.image-container img, img');
  const imgCell = document.createDocumentFragment();
  if (img) {
    imgCell.appendChild(document.createComment(' field:image '));
    imgCell.appendChild(img.cloneNode(true));
  }

  // Column 2: Content (heading + description + CTA buttons) with field hint
  const contentCell = document.createDocumentFragment();
  contentCell.appendChild(document.createComment(' field:content '));

  // Extract heading (h3, h2, or fallback to any heading in .titles)
  const heading = element.querySelector('.titles h3, .titles h2, .titles h4, .content-container h3, .content-container h2');
  if (heading) {
    contentCell.appendChild(heading.cloneNode(true));
  }

  // Extract description paragraph
  const description = element.querySelector('.para.description p, .description p, .content-container p');
  if (description) {
    contentCell.appendChild(description.cloneNode(true));
  }

  // Extract CTA button links (multiple possible)
  const ctaLinks = element.querySelectorAll('.button-container a.button, .button-container a.cta, a.button.cta');
  ctaLinks.forEach((link) => {
    const p = document.createElement('p');
    p.appendChild(link.cloneNode(true));
    contentCell.appendChild(p);
  });

  // Build row: [image, content] — always two columns
  cells.push([imgCell, contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'commerce-teaser-featured', cells });
  element.replaceWith(block);
}
