/* eslint-disable */
/* global WebImporter */

/**
 * Parser for commerce-teaser-card
 * Base block: commerce-teaser
 * Source: https://main--hvt-eds--havertys-furniture.aem.live/free-design-service
 * Generated: 2026-05-19
 *
 * Extracts promotional card teasers from .grid-container.commerce-teaser-container sections.
 * Each card has an image, heading (h4), description paragraph, and a CTA button link.
 * Produces a commerce-teaser-card block with one row per card.
 * Each row has two columns: [image, content (heading + description + CTA)].
 *
 * Strategy: The parser is called on each .commerce-teaser.block element individually.
 * It traverses up to the .grid-wrapper parent to collect ALL sibling card elements
 * and builds the complete block. It marks processed wrappers with a data attribute
 * to avoid re-processing from subsequent calls on sibling cards.
 */
export default function parse(element, { document }) {
  // Find the grid wrapper that contains all card items in this group
  const gridWrapper = element.closest('.grid-wrapper');

  // If we can't find a grid wrapper, handle just this element
  if (!gridWrapper) {
    const cells = [];
    const row = buildCardRow(element, document);
    if (row) cells.push(row);
    const block = WebImporter.Blocks.createBlock(document, { name: 'commerce-teaser-card', cells });
    element.replaceWith(block);
    return;
  }

  // Check if this grid-wrapper was already processed by a sibling parser call
  if (gridWrapper.dataset.commerceTeaserCardProcessed === 'true') {
    // Already consumed — replace with empty comment to suppress output
    element.replaceWith(document.createComment(''));
    return;
  }

  // Mark the grid wrapper as processed to prevent duplicate blocks
  gridWrapper.dataset.commerceTeaserCardProcessed = 'true';

  // Collect all commerce-teaser blocks within this grid wrapper
  const allTeasers = gridWrapper.querySelectorAll('.commerce-teaser.block');
  const cells = [];

  allTeasers.forEach((teaser) => {
    const row = buildCardRow(teaser, document);
    if (row) cells.push(row);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'commerce-teaser-card', cells });
  element.replaceWith(block);
}

/**
 * Builds a single card row with [image, content] columns.
 * Content column includes heading, description, and CTA link.
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

  // Column 2: Content (heading + description + CTA) with field hints
  const contentCell = document.createDocumentFragment();
  let hasContent = false;

  // Heading (h4)
  const heading = teaser.querySelector('.titles h4, h4, .titles h3, h3');
  if (heading) {
    contentCell.appendChild(document.createComment(' field:title '));
    contentCell.appendChild(heading.cloneNode(true));
    hasContent = true;
  }

  // Description paragraph
  const description = teaser.querySelector('.para.description p, .description p, .content-container p');
  if (description) {
    contentCell.appendChild(document.createComment(' field:description '));
    contentCell.appendChild(description.cloneNode(true));
    hasContent = true;
  }

  // CTA link (primary button)
  const ctaLink = teaser.querySelector('.button-container a.button, .button-container a.cta, a.button.cta');
  if (ctaLink) {
    contentCell.appendChild(document.createComment(' field:link '));
    const linkClone = ctaLink.cloneNode(true);
    contentCell.appendChild(linkClone);
    hasContent = true;
  }

  row.push(hasContent ? contentCell : '');

  return row;
}
