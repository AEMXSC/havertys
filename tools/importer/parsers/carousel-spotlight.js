/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-spotlight
 * Base block: carousel
 * Source: https://main--hvt-eds--havertys-furniture.aem.live/free-design-service
 * Generated: 2026-05-19
 *
 * Extracts a named carousel with vertical image cards from .carousel.vertical-image.block.
 * Source structure: carousel-name-container (h3 heading) + swiper with slide items,
 * each slide containing a linked image and a linked h4 title.
 *
 * Target structure (from carousel-spotlight.js decorate):
 * - Each row = one slide with two columns: [image, content]
 * - Column 0: slide image (picture/img)
 * - Column 1: slide content (heading with link)
 *
 * The carousel heading ("Design Project Spotlights") is placed in the first row
 * as content-only (no image), which the block can use as its carousel name.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Extract carousel name/heading from .carousel-name-container h3
  const carouselName = element.querySelector('.carousel-name-container h3, .carousel-name-container h2, .carousel-name-container h4');

  // If there's a carousel name, add it as first row (content only, single cell)
  if (carouselName) {
    const nameCell = document.createDocumentFragment();
    nameCell.appendChild(document.createComment(' field:title '));
    nameCell.appendChild(carouselName.cloneNode(true));
    cells.push([nameCell]);
  }

  // Extract slide items from swiper wrapper
  const slides = element.querySelectorAll('.carousel-slide-container.swiper-slide, .swiper-slide');

  slides.forEach((slide) => {
    // Column 0: Image - extract from .dynamic-media-image a > img or direct img
    const imgLink = slide.querySelector('.dynamic-media-image a, .dynamic-media-image-wrapper a');
    const img = slide.querySelector('.dynamic-media-image img, .dynamic-media-image-wrapper img, img');

    // Column 1: Content - extract linked heading from carousel-text
    const headingLink = slide.querySelector('.carousel-text h4 a, .carousel-text h3 a, .carousel-text h2 a, .carousel-text a');
    const heading = slide.querySelector('.carousel-text h4, .carousel-text h3, .carousel-text h2');

    // Build image cell
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    if (imgLink && img) {
      // Wrap image in its link for preservation of link target
      const linkClone = imgLink.cloneNode(false);
      linkClone.appendChild(img.cloneNode(true));
      imageCell.appendChild(linkClone);
    } else if (img) {
      imageCell.appendChild(img.cloneNode(true));
    }

    // Build content cell
    const contentCell = document.createDocumentFragment();
    contentCell.appendChild(document.createComment(' field:slideContent '));
    if (heading) {
      contentCell.appendChild(heading.cloneNode(true));
    } else if (headingLink) {
      const h4 = document.createElement('h4');
      h4.appendChild(headingLink.cloneNode(true));
      contentCell.appendChild(h4);
    }

    // Only add row if we have at least an image or content
    if (img || heading || headingLink) {
      cells.push([imageCell, contentCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-spotlight', cells });
  element.replaceWith(block);
}
