/* eslint-disable */
/* global WebImporter */

/**
 * Parser for commerce-teaser-video
 * Base block: commerce-teaser
 * Source: https://main--hvt-eds--havertys-furniture.aem.live/free-design-service
 * Generated: 2026-05-19
 *
 * Extracts commerce teasers that feature an embedded video alongside text content.
 * Source has .commerce-teaser-wrapper with .featured-right class and a .video-container
 * holding a <video> element (muted, loop, playsinline).
 *
 * Structure: Single row with two columns - [video, content].
 * Column 1: Video element (the <video> tag with source).
 * Column 2: Content combining pretitle paragraph, heading (h3/h2), and description paragraph.
 *
 * Distinguishes from other commerce-teaser variants by checking for .video-container presence.
 * No CTA buttons in this variant (content-only alongside video).
 *
 * UE model fields: "video" (reference/video), "content" (richtext containing pretitle, heading, description).
 */
export default function parse(element, { document }) {
  // Only process teasers that contain a video container
  const videoContainer = element.querySelector('.video-container');
  if (!videoContainer) {
    // Not a video teaser — skip
    element.replaceWith(document.createComment(''));
    return;
  }

  const cells = [];

  // Column 1: Video with field hint
  const video = element.querySelector('.video-container video, video');
  const videoCell = document.createDocumentFragment();
  if (video) {
    videoCell.appendChild(document.createComment(' field:video '));
    // Clone the video element with its source children
    videoCell.appendChild(video.cloneNode(true));
  }

  // Column 2: Content (pretitle + heading + description) with field hint
  const contentCell = document.createDocumentFragment();
  contentCell.appendChild(document.createComment(' field:content '));

  // Extract pretitle (paragraph inside [data-prop-name="pretitle"] or .titles > div > p)
  const pretitleEl = element.querySelector('[data-prop-name="pretitle"] p, .titles > div > p');
  if (pretitleEl) {
    contentCell.appendChild(pretitleEl.cloneNode(true));
  }

  // Extract heading (h3, h2, or h4 in .titles or .content-container)
  const heading = element.querySelector('.titles h3, .titles h2, .titles h4, .content-container h3, .content-container h2');
  if (heading) {
    contentCell.appendChild(heading.cloneNode(true));
  }

  // Extract description paragraph
  const description = element.querySelector('.para.description p, .description p, [data-prop-name="description"] p');
  if (description) {
    contentCell.appendChild(description.cloneNode(true));
  }

  // Extract CTA button links if present (some video teasers may have CTAs)
  const ctaLinks = element.querySelectorAll('.button-container a.button, .button-container a.cta');
  ctaLinks.forEach((link) => {
    const p = document.createElement('p');
    p.appendChild(link.cloneNode(true));
    contentCell.appendChild(p);
  });

  // Build row: [video, content] — always two columns
  cells.push([videoCell, contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'commerce-teaser-video', cells });
  element.replaceWith(block);
}
