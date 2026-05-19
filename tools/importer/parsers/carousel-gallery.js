/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-gallery
 * Base block: carousel
 * Source: https://main--hvt-eds--havertys-furniture.aem.live/free-design-service
 * Generated: 2026-05-19
 *
 * Structure: Container block - one row per slide, each row has one cell
 * containing a linked image. Slides extracted from swiper slide containers.
 *
 * Source selectors validated against:
 *   .carousel-slide-container.swiper-slide
 *   .dynamic-media-image a (linked image)
 *   .dynamic-media-image img (image element)
 *
 * Also handles the hero gallery variant (single-image-hero-carousel)
 * which uses .hero-slide-wrapper > .hero-single-asset > a > picture > img
 */
export default function parse(element, { document }) {
  // Determine which carousel variant we are dealing with
  const isHeroCarousel = element.classList.contains('single-image-hero-carousel');

  let slides;

  if (isHeroCarousel) {
    // Hero gallery: slides are in .swiper-slide > .hero-slide-wrapper > .hero-single-asset
    slides = Array.from(element.querySelectorAll('.swiper-slide .hero-single-asset'));
  } else {
    // Full-width gallery: slides are in .carousel-slide-container
    slides = Array.from(element.querySelectorAll('.carousel-slide-container'));
  }

  const cells = [];

  slides.forEach((slide) => {
    // Extract linked image from the slide
    const link = slide.querySelector('a[href]');
    const img = slide.querySelector('img');

    if (!img) return; // Skip slides without images

    // Build the cell content
    const cellContent = document.createElement('div');

    // Add field hint for xwalk UE model (image field)
    cellContent.appendChild(document.createComment(' field:image '));

    if (link) {
      // Preserve the linked image structure
      const anchor = document.createElement('a');
      anchor.href = link.getAttribute('href');
      if (link.getAttribute('title')) {
        anchor.title = link.getAttribute('title');
      }

      // Create picture element with img
      const picture = document.createElement('picture');
      const newImg = document.createElement('img');
      newImg.src = img.getAttribute('src');
      newImg.alt = img.getAttribute('alt') || '';
      picture.appendChild(newImg);
      anchor.appendChild(picture);
      cellContent.appendChild(anchor);
    } else {
      // Image without link
      const picture = document.createElement('picture');
      const newImg = document.createElement('img');
      newImg.src = img.getAttribute('src');
      newImg.alt = img.getAttribute('alt') || '';
      picture.appendChild(newImg);
      cellContent.appendChild(picture);
    }

    // Each slide is one row with one cell
    cells.push([cellContent]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-gallery', cells });
  element.replaceWith(block);
}
