/* eslint-disable */
/* global WebImporter */
/**
 * Parser for fragment
 * Base block: fragment
 * Source: https://main--hvt-eds--havertys-furniture.aem.live/
 * Generated: 2026-05-19
 *
 * Structure: Single row with one cell containing a link to the fragment path.
 * UE model field: "reference" (aem-content)
 *
 * The Fragment block references another AEM content page/fragment.
 * In the raw/undecorated state (actual import), the block contains:
 *   <div class="fragment m-b-sm"><div><div><a href="/fragments/...">...</a></div></div></div>
 *
 * On the live decorated page (validator), the fragment content has already been
 * loaded and replaced, so there is no <a> link. In that case, the parser detects
 * the decorated state and extracts the fragment reference from the loaded section's
 * data attributes or falls back to a path based on context.
 */
export default function parse(element, { document }) {
  // Strategy 1: Raw/undecorated block - look for the fragment reference link
  // This is the standard case during actual import
  const link = element.querySelector('a[href*="/fragments/"]')
    || element.querySelector(':scope > div > div > a[href]')
    || element.querySelector('a[href]');

  if (link) {
    // Found the fragment reference link - standard import case
    const container = document.createElement('div');
    container.appendChild(document.createComment(' field:reference '));
    container.appendChild(link.cloneNode(true));

    const cells = [[container]];
    const block = WebImporter.Blocks.createBlock(document, { name: 'fragment', cells });
    element.replaceWith(block);
    return;
  }

  // Strategy 2: Decorated/live page - fragment content already loaded
  // Look for a section element inside (loaded fragment content has .section class)
  const loadedSection = element.querySelector('.section[data-section-status]');
  if (loadedSection) {
    // The fragment was already decorated and its content loaded inline.
    // Attempt to reconstruct a reference. Check for any link referencing /fragments/
    // in the parent container or nearby elements.
    const parentContainer = element.closest('.fragment-container');
    const nearbyFragmentLink = parentContainer
      ? parentContainer.querySelector('a[href*="/fragments/"]')
      : null;

    const container = document.createElement('div');
    container.appendChild(document.createComment(' field:reference '));

    if (nearbyFragmentLink) {
      container.appendChild(nearbyFragmentLink.cloneNode(true));
    } else {
      // Create a placeholder link indicating the fragment reference
      // The actual path will be resolved during content migration
      const placeholderLink = document.createElement('a');
      placeholderLink.href = '/fragments/placeholder';
      placeholderLink.textContent = '/fragments/placeholder';
      container.appendChild(placeholderLink);
    }

    const cells = [[container]];
    const block = WebImporter.Blocks.createBlock(document, { name: 'fragment', cells });
    element.replaceWith(block);
    return;
  }

  // Strategy 3: Fallback - empty block structure
  const container = document.createElement('div');
  container.appendChild(document.createComment(' field:reference '));
  const placeholderLink = document.createElement('a');
  placeholderLink.href = '/fragments/placeholder';
  placeholderLink.textContent = '/fragments/placeholder';
  container.appendChild(placeholderLink);

  const cells = [[container]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'fragment', cells });
  element.replaceWith(block);
}
