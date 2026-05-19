/* eslint-disable */
/* global WebImporter */

/**
 * Parser for commerce-teaser-split
 * Base block: commerce-teaser
 * Source: https://main--hvt-eds--havertys-furniture.aem.live/
 * Generated: 2026-05-19
 *
 * Extracts split-layout commerce teasers with image/video on one side and content on the other.
 * Source has .commerce-teaser-wrapper with .featured-right or .featured-left class.
 * Produces a single row with two columns: [image/video, content].
 * Content column includes optional pretitle, heading (h2), description paragraph, and CTA links.
 *
 * Handles variations:
 * - featured-right: image left, content right
 * - featured-left: content left, image/video right
 * - Video vs image media
 * - Optional pretitle text
 * - 1-3 CTA buttons (empty button containers are skipped)
 */
export default function parse(element, { document }) {
  const cells = [];

  // --- Column 1: Media (image or video) with field hint ---
  const mediaCell = document.createDocumentFragment();
  mediaCell.appendChild(document.createComment(' field:image '));

  // Try image first, then video
  const img = element.querySelector('.image-container img, .scene7-image img, img');
  const video = element.querySelector('.video-container video, video');

  if (img) {
    mediaCell.appendChild(img.cloneNode(true));
  } else if (video) {
    mediaCell.appendChild(video.cloneNode(true));
  }

  // --- Column 2: Content (pretitle + heading + description + CTAs) with field hint ---
  const contentCell = document.createDocumentFragment();
  contentCell.appendChild(document.createComment(' field:content '));

  // Extract pretitle (optional, inside [data-prop-name="pretitle"] or .titles > div > p)
  const pretitleDiv = element.querySelector('[data-prop-name="pretitle"], .titles > div:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6)');
  if (pretitleDiv) {
    const pretitleP = pretitleDiv.querySelector('p');
    if (pretitleP && pretitleP.textContent.trim()) {
      contentCell.appendChild(pretitleP.cloneNode(true));
    }
  }

  // Extract heading (h2, h3, h4 from .titles or .content-container)
  const heading = element.querySelector('.titles h2, .titles h3, .titles h4, .content-container h2, .content-container h3');
  if (heading) {
    contentCell.appendChild(heading.cloneNode(true));
  }

  // Extract description paragraph
  const descContainer = element.querySelector('[data-prop-name="description"], .para.description, .description');
  if (descContainer) {
    const descP = descContainer.querySelector('p');
    if (descP && descP.textContent.trim()) {
      contentCell.appendChild(descP.cloneNode(true));
    }
  }

  // Extract CTA button links (up to 3, skip empty containers)
  const buttonContainers = element.querySelectorAll('.button-container');
  buttonContainers.forEach((container) => {
    const link = container.querySelector('a.button, a.cta, a');
    if (link && link.textContent.trim()) {
      const p = document.createElement('p');
      p.appendChild(link.cloneNode(true));
      contentCell.appendChild(p);
    }
  });

  // Build single row: [media, content]
  cells.push([mediaCell, contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'commerce-teaser-split', cells });
  element.replaceWith(block);
}
