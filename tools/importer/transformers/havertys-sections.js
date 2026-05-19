/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Havertys section breaks and section metadata.
 * Inserts <hr> between sections and adds Section Metadata blocks for styled sections.
 * Selectors from page-templates.json, validated against migration-work/cleaned.html.
 *
 * Note: The Havertys EDS site renders sections as nested divs (not flat siblings).
 * This transformer finds each section element via querySelector on the full subtree,
 * using the template selectors which work as descendant selectors.
 *
 * Section selectors found in cleaned.html:
 *   .section.hero-container
 *   .section.call-to-action-container
 *   .section.carousel-container
 *   .section.bg-image.call-to-action-container
 *   .section.bg-image.commerce-teaser-container (x2)
 *   .section.read-more-container.fragment-container
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

/**
 * Resolves a section selector to a specific DOM element.
 * Handles :nth-of-type and :last-of-type by finding all matches and picking the right one.
 * Also handles array selectors (takes first).
 */
function resolveSection(element, selectorValue) {
  if (!selectorValue) return null;

  // Handle :nth-of-type(N) by extracting the base selector and index
  const nthMatch = selectorValue.match(/^(.+):nth-of-type\((\d+)\)$/);
  if (nthMatch) {
    const baseSelector = nthMatch[1];
    const index = parseInt(nthMatch[2], 10) - 1;
    const matches = element.querySelectorAll(baseSelector);
    return matches[index] || null;
  }

  // Handle :last-of-type by extracting the base selector and picking the last match
  const lastMatch = selectorValue.match(/^(.+):last-of-type$/);
  if (lastMatch) {
    const baseSelector = lastMatch[1];
    const matches = element.querySelectorAll(baseSelector);
    return matches[matches.length - 1] || null;
  }

  // Handle :first-of-type
  const firstMatch = selectorValue.match(/^(.+):first-of-type$/);
  if (firstMatch) {
    const baseSelector = firstMatch[1];
    const matches = element.querySelectorAll(baseSelector);
    return matches[0] || null;
  }

  // Handle :not() selectors - try direct querySelector
  // Standard CSS selectors
  try {
    return element.querySelector(selectorValue);
  } catch (e) {
    return null;
  }
}

export default function transform(hookName, element, payload) {
  if (hookName === H.after) {
    const document = element.ownerDocument || element.getRootNode();
    const template = payload && payload.template;

    if (!template || !template.sections || template.sections.length < 2) {
      return;
    }

    const sections = template.sections;

    // Resolve all section elements first (forward pass) to get stable references
    const sectionEls = sections.map((section) => {
      const selectorValue = Array.isArray(section.selector) ? section.selector[0] : section.selector;
      return resolveSection(element, selectorValue);
    });

    // Process sections in reverse order to avoid position shifts from DOM insertions
    for (let i = sections.length - 1; i >= 0; i--) {
      const sectionEl = sectionEls[i];
      if (!sectionEl) continue;

      // Add Section Metadata block if section has a style
      if (sections[i].style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: sections[i].style },
        });
        sectionEl.append(sectionMetadata);
      }

      // Insert <hr> before each section except the first
      if (i > 0) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
