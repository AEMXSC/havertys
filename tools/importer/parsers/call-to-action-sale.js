/* eslint-disable */
/* global WebImporter */

/**
 * Parser: call-to-action-sale
 * Base block: call-to-action
 * Source: https://main--hvt-eds--havertys-furniture.aem.live/sale
 * Generated: 2026-05-19
 *
 * Structure: Carousel-based CTA block with background image and text overlay.
 * Each slide row has two columns:
 *   Column 0: Background image (displayed full-bleed behind content)
 *   Column 1: Content (heading + subheading + CTA button)
 *
 * Source DOM: .bg-image.call-to-action-container .call-to-action.block
 *   - Background image is applied as CSS background-image on the ancestor section
 *     (div.section.bg-image.call-to-action-container), accessed via style.backgroundImage
 *   - Text content is in .call-to-action-text (h1 heading, h4 subheading)
 *   - CTA button is in .call-to-action-cta (a.button)
 */
export default function parse(element, { document }) {
  // Find background image from ancestor section's inline style
  // On the live page, the bg image is set as CSS background-image on the section
  // that wraps the .call-to-action-wrapper
  let bgImage = null;

  // Strategy 1: Extract from inline style background-image on ancestor section
  const wrapper = element.closest('.call-to-action-wrapper');
  const parentSection = wrapper ? wrapper.parentElement : element.closest('.bg-image, .call-to-action-container');
  if (parentSection && parentSection.style && parentSection.style.backgroundImage) {
    const bgUrl = parentSection.style.backgroundImage.replace(/url\(["']?/, '').replace(/["']?\)/, '');
    if (bgUrl && bgUrl !== 'none') {
      bgImage = document.createElement('img');
      bgImage.src = bgUrl;
      bgImage.alt = parentSection.getAttribute('aria-label') || 'Sale background';
    }
  }

  // Strategy 2: Check closest section with bg-image class for computed style
  if (!bgImage) {
    const section = element.closest('.section.bg-image');
    if (section && section.style && section.style.backgroundImage) {
      const bgUrl = section.style.backgroundImage.replace(/url\(["']?/, '').replace(/["']?\)/, '');
      if (bgUrl && bgUrl !== 'none') {
        bgImage = document.createElement('img');
        bgImage.src = bgUrl;
        bgImage.alt = section.getAttribute('aria-label') || 'Sale background';
      }
    }
  }

  // Strategy 3: Fallback to img element in ancestors (pre-decoration state)
  if (!bgImage) {
    let parent = element.parentElement;
    let depth = 0;
    while (parent && depth < 5) {
      const img = parent.querySelector(':scope > img, :scope > picture');
      if (img) {
        bgImage = img;
        break;
      }
      parent = parent.parentElement;
      depth += 1;
    }
  }

  // Extract heading from .call-to-action-text
  const heading = element.querySelector('.call-to-action-text h1, .call-to-action-text h2, .call-to-action-text h3');
  const subheading = element.querySelector('.call-to-action-text h4, .call-to-action-text h5, .call-to-action-text p');

  // Extract CTA button(s)
  const ctaLinks = Array.from(
    element.querySelectorAll('.call-to-action-cta a.button, .call-to-action-cta a, .button-container a')
  );

  // Build cells: one row with [image, content]
  const cells = [];

  // Column 0: Background image
  const imageCell = [];
  if (bgImage) {
    imageCell.push(bgImage);
  }

  // Column 1: Content (heading + subheading + CTA)
  const contentCell = [];
  if (heading) {
    contentCell.push(heading);
  }
  if (subheading) {
    contentCell.push(subheading);
  }
  ctaLinks.forEach((link) => {
    contentCell.push(link);
  });

  // Single row: [image, content]
  cells.push([imageCell.length === 1 ? imageCell[0] : imageCell, contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'call-to-action-sale', cells });
  element.replaceWith(block);
}
