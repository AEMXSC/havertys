/* eslint-disable */
/* global WebImporter */

import commerceTeaserFeaturedParser from './parsers/commerce-teaser-featured.js';
import cardsLinkedImageParser from './parsers/cards-linked-image.js';

import cleanupTransformer from './transformers/havertys-cleanup.js';
import sectionsTransformer from './transformers/havertys-sections.js';

const parsers = {
  'commerce-teaser-featured': commerceTeaserFeaturedParser,
  'cards-linked-image': cardsLinkedImageParser,
};

const PAGE_TEMPLATE = {
  name: 'brand-page',
  description: 'Brand messaging page with service highlights, content grids, and guarantee information',
  urls: ['https://main--hvt-eds--havertys-furniture.aem.live/rfg'],
  blocks: [
    { name: 'commerce-teaser-featured', instances: ['.commerce-teaser-container .commerce-teaser.block'] },
    { name: 'cards-linked-image', instances: ['.grid-container.commerce-teaser-container .commerce-teaser.block'] },
  ],
  sections: [
    { id: 'section-1-intro', name: 'Page Introduction', selector: '.section.hvt-text-container:first-of-type', style: null, blocks: [], defaultContent: ['h1', 'p'] },
    { id: 'section-2-beyond', name: 'Beyond the Furniture', selector: '.section.commerce-teaser-container:not(.grid-container):nth-of-type(1)', style: null, blocks: ['commerce-teaser-featured'], defaultContent: [] },
    { id: 'section-3-delivery-cards', name: 'Delivery & Planning Cards', selector: '.section.grid-container.commerce-teaser-container:nth-of-type(1)', style: null, blocks: ['cards-linked-image'], defaultContent: [] },
    { id: 'section-4-inspiration', name: 'Design & Inspiration', selector: '.section.commerce-teaser-container:not(.grid-container):nth-of-type(2)', style: null, blocks: ['commerce-teaser-featured'], defaultContent: [] },
    { id: 'section-5-service-cards', name: 'Service & Care Cards', selector: '.section.grid-container.commerce-teaser-container:nth-of-type(2)', style: null, blocks: ['cards-linked-image'], defaultContent: [] },
    { id: 'section-6-guarantee', name: 'Guarantee Statement', selector: '.section.hvt-text-container:last-of-type', style: null, blocks: [], defaultContent: ['strong', 'p'] },
  ],
};

const transformers = [cleanupTransformer, sectionsTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name}:`, e);
        }
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
  },
};
