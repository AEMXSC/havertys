/* eslint-disable */
/* global WebImporter */

/**
 * Parser: accordion-faq
 * Base block: accordion
 * Source: https://main--hvt-eds--havertys-furniture.aem.live/free-design-service
 * Generated: 2026-05-19
 *
 * Structure: Each accordion item has a question (label) and answer (body).
 * Source DOM uses <details> with <summary> for questions and .accordion-item-body for answers.
 * Target: Two-column rows — column 0 = question heading, column 1 = answer content.
 */
export default function parse(element, { document }) {
  // Extract accordion item containers (each wraps one <details>)
  // Use .accordion-item-container first; fallback to direct <details> children if structure differs
  let items = element.querySelectorAll(':scope > .accordion-item-container');
  if (items.length === 0) {
    items = element.querySelectorAll(':scope > details.accordion-item');
  }

  const cells = [];

  items.forEach((item) => {
    // Get the details element (could be the item itself or a child)
    const details = item.matches('details') ? item : item.querySelector('details.accordion-item');
    if (!details) return;

    // Extract question from summary > h3 > p, or summary text
    const summary = details.querySelector('summary.accordion-item-label, summary');
    const questionCell = [];

    if (summary) {
      // The source has h3 > p inside summary; extract the heading content
      const heading = summary.querySelector('h3, h4, h2');
      if (heading) {
        // Clone the heading to preserve it as semantic HTML
        const h = document.createElement('h3');
        const headingText = heading.querySelector('p');
        h.textContent = headingText ? headingText.textContent : heading.textContent;
        questionCell.push(h);
      } else {
        // Fallback: use summary text directly
        const p = document.createElement('p');
        p.textContent = summary.textContent.trim();
        questionCell.push(p);
      }
    }

    // Extract answer from .accordion-item-body
    const body = details.querySelector('.accordion-item-body, .accordion-item-content');
    const answerCell = [];

    if (body) {
      // Collect all child elements from the body preserving semantic HTML
      const bodyChildren = body.querySelectorAll(':scope > p, :scope > ul, :scope > ol, :scope > div');
      if (bodyChildren.length > 0) {
        bodyChildren.forEach((child) => {
          answerCell.push(child);
        });
      } else {
        // Fallback: use the entire body content
        answerCell.push(body);
      }
    }

    // Each row is [question, answer] — two columns
    cells.push([questionCell.length === 1 ? questionCell[0] : questionCell, answerCell.length === 1 ? answerCell[0] : answerCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
