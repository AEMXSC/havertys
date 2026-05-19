/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-linked-image
 * Base block: cards
 * Source: https://main--hvt-eds--havertys-furniture.aem.live/rfg
 * Generated: 2026-05-19
 *
 * Extracts linked image cards from .grid-container.commerce-teaser-container sections.
 * Each card has a large image and a linked heading (h4 with anchor).
 * Produces a Cards container block with one row per card item.
 * Each row has two columns: [image, linked-title].
 *
 * Strategy: The parser is called on each .commerce-teaser.block element individually.
 * It traverses up to the .grid-wrapper parent to collect ALL sibling card elements
 * and builds the complete block. It marks processed wrappers with a data attribute
 * to avoid re-processing from subsequent calls on sibling cards.
 */
export default function parse(element, { document }) {
  // Find the grid wrapper that contains all card items in this group
  const cardWrapper = element.closest('.commerce-teaser-wrapper');
  const gridWrapper = element.closest('.grid-wrapper');

  // If we can't find a grid wrapper, handle just this element
  if (!gridWrapper) {
    const cells = [];
    const row = buildCardRow(element, document);
    if (row) cells.push(row);
    const block = WebImporter.Blocks.createBlock(document, { name: 'cards-linked-image', cells });
    element.replaceWith(block);
    return;
  }

  // Check if this grid-wrapper was already processed by a sibling parser call
  if (gridWrapper.dataset.cardsProcessed === 'true') {
    // Already consumed — replace with empty comment to suppress output
    element.replaceWith(document.createComment(''));
    return;
  }

  // Mark the grid wrapper as processed to prevent duplicate blocks
  gridWrapper.dataset.cardsProcessed = 'true';

  // Collect all commerce-teaser blocks within this grid wrapper
  const allTeasers = gridWrapper.querySelectorAll('.commerce-teaser.block');
  const cells = [];

  allTeasers.forEach((teaser) => {
    const row = buildCardRow(teaser, document);
    if (row) cells.push(row);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-linked-image', cells });
  element.replaceWith(block);
}

/**
 * Builds a single card row with [image, linked-title] columns
 */
function buildCardRow(teaser, document) {
  const row = [];

  // Column 1: Image with field hint
  const img = teaser.querySelector('.image-container img, img');
  if (img) {
    const imgCell = document.createDocumentFragment();
    imgCell.appendChild(document.createComment(' field:image '));
    imgCell.appendChild(img.cloneNode(true));
    row.push(imgCell);
  } else {
    row.push('');
  }

  // Column 2: Linked title (h4 heading with anchor link) with field hint
  const heading = teaser.querySelector('.titles h4, h4.linked-title, h4');
  if (heading) {
    const bodyCell = document.createDocumentFragment();
    bodyCell.appendChild(document.createComment(' field:title '));
    bodyCell.appendChild(heading.cloneNode(true));
    row.push(bodyCell);
  } else {
    const linkEl = teaser.querySelector('.titles a, a.button');
    if (linkEl) {
      const bodyCell = document.createDocumentFragment();
      bodyCell.appendChild(document.createComment(' field:title '));
      bodyCell.appendChild(linkEl.cloneNode(true));
      row.push(bodyCell);
    } else {
      row.push('');
    }
  }

  return row;
}
