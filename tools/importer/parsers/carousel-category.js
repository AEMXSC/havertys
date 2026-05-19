/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-category
 * Base block: carousel
 * Source: https://main--hvt-eds--havertys-furniture.aem.live/
 * Generated: 2026-05-19
 *
 * Extracts category carousel slides from the decorated .carousel.vertical-image block.
 * Each slide contains a linked image (category photo) and a linked heading (category name/CTA).
 * Produces a carousel-category block with one row per slide.
 * Each row has two columns: [image, heading/link].
 *
 * Decorated DOM structure per slide:
 *   .carousel-slide-container > .carousel-slide section
 *     .dynamic-media-image-wrapper > .dynamic-media-image > a > img
 *     .carousel-text-wrapper > .carousel-text > div > div > h4 > a
 *
 * Target block structure (from carousel-category.js decorate):
 *   Row per slide: [Column 0: image, Column 1: content (heading + link)]
 */
export default function parse(element, { document }) {
  // Find all slide containers within the carousel
  const slides = element.querySelectorAll('.carousel-slide-container, .swiper-slide');

  const cells = [];

  slides.forEach((slide) => {
    // Column 0: Image
    // The image is inside .dynamic-media-image block wrapped in a link
    const img = slide.querySelector('.dynamic-media-image img, img');
    const imgLink = slide.querySelector('.dynamic-media-image a[href], .dynamic-media-image-wrapper a[href]');

    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    if (img) {
      if (imgLink) {
        // Wrap image in its link to preserve linked behavior
        const link = imgLink.cloneNode(false);
        link.appendChild(img.cloneNode(true));
        imageCell.appendChild(link);
      } else {
        imageCell.appendChild(img.cloneNode(true));
      }
    }

    // Column 1: Heading/CTA text
    // The heading is an h4 with a link inside .carousel-text block
    const heading = slide.querySelector('.carousel-text h4, .carousel-text h3, .carousel-text h2, h4, h3');
    const contentCell = document.createDocumentFragment();
    contentCell.appendChild(document.createComment(' field:title '));
    if (heading) {
      contentCell.appendChild(heading.cloneNode(true));
    } else {
      // Fallback: look for any link in the text area
      const textLink = slide.querySelector('.carousel-text a, .carousel-text-wrapper a');
      if (textLink) {
        contentCell.appendChild(textLink.cloneNode(true));
      }
    }

    cells.push([imageCell, contentCell]);
  });

  // If no slides found via .carousel-slide-container, try rows pattern (pre-decoration)
  if (cells.length === 0) {
    const rows = element.querySelectorAll(':scope > div');
    rows.forEach((row) => {
      const columns = row.querySelectorAll(':scope > div');
      if (columns.length >= 2) {
        const imgEl = columns[0].querySelector('img');
        const headingEl = columns[1].querySelector('h4, h3, h2, a');

        const imageCell = document.createDocumentFragment();
        imageCell.appendChild(document.createComment(' field:image '));
        if (imgEl) {
          imageCell.appendChild(imgEl.cloneNode(true));
        }

        const contentCell = document.createDocumentFragment();
        contentCell.appendChild(document.createComment(' field:title '));
        if (headingEl) {
          contentCell.appendChild(headingEl.cloneNode(true));
        }

        cells.push([imageCell, contentCell]);
      }
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-category', cells });
  element.replaceWith(block);
}
