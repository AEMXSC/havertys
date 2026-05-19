/* eslint-disable */
/* global WebImporter */

/**
 * Parser: quote-testimonial
 * Base block: quote
 * Source: https://main--hvt-eds--havertys-furniture.aem.live/free-design-service
 * Generated: 2026-05-19
 *
 * Structure (5 rows, 1 column):
 *   Row 1: Quote text (testimonial paragraph)
 *   Row 2: Attribution (person name)
 *   Row 3: Text color token
 *   Row 4: Background color token
 *   Row 5: Style class (e.g. "apply-border")
 */
export default function parse(element, { document }) {
  // Extract the blockquote element (contains data attributes for colors)
  const blockquote = element.querySelector('blockquote');

  // Row 1: Quote text - from <p> inside .quote-inner or blockquote
  const quoteText = element.querySelector('.quote-inner p, blockquote p, p');
  const quoteContent = quoteText ? quoteText.textContent.trim() : '';

  // Row 2: Attribution - from <cite> element, strip leading dash/hyphen
  const citeEl = element.querySelector('cite');
  let attribution = '';
  if (citeEl) {
    attribution = citeEl.textContent.trim().replace(/^[-—]\s*/, '');
  }

  // Row 3: Text color - from data-text-color attribute on blockquote
  const textColor = blockquote ? (blockquote.getAttribute('data-text-color') || '') : '';

  // Row 4: Background color - from data-background-color attribute on blockquote
  const bgColor = blockquote ? (blockquote.getAttribute('data-background-color') || '') : '';

  // Row 5: Style class - from .quote-inner class list (excluding "quote-inner")
  const quoteInner = element.querySelector('.quote-inner');
  let styleClass = '';
  if (quoteInner) {
    const classes = Array.from(quoteInner.classList).filter((c) => c !== 'quote-inner');
    styleClass = classes.join(' ');
  }

  // Build cells array matching target table structure
  const cells = [
    [quoteContent],
    [attribution],
    [textColor],
    [bgColor],
    [styleClass],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote-testimonial', cells });
  element.replaceWith(block);
}
