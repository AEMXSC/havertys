/* eslint-disable */
/* global WebImporter */

import carouselCategoryParser from './parsers/carousel-category.js';
import callToActionSaleParser from './parsers/call-to-action-sale.js';
import productCarouselSaleParser from './parsers/product-carousel-sale.js';
import commerceTeaserSplitParser from './parsers/commerce-teaser-split.js';
import fragmentParser from './parsers/fragment.js';

import cleanupTransformer from './transformers/havertys-cleanup.js';
import sectionsTransformer from './transformers/havertys-sections.js';

const parsers = {
  'carousel-category': carouselCategoryParser,
  'call-to-action-sale': callToActionSaleParser,
  'product-carousel-sale': productCarouselSaleParser,
  'commerce-teaser-split': commerceTeaserSplitParser,
  'fragment': fragmentParser,
};

const PAGE_TEMPLATE = {
  name: 'sale-page',
  description: 'Commerce/sale page with product savings carousels organized by room category',
  urls: ['https://main--hvt-eds--havertys-furniture.aem.live/sale'],
  blocks: [
    { name: 'carousel-category', instances: ['.carousel-container .carousel.vertical-image.block'] },
    { name: 'call-to-action-sale', instances: ['.bg-image.call-to-action-container .call-to-action.block'] },
    { name: 'product-carousel-sale', instances: ['.product-carousel-container .product-carousel.block'] },
    { name: 'commerce-teaser-split', instances: ['.commerce-teaser-container .commerce-teaser.block'] },
    { name: 'fragment', instances: ['.fragment-container .fragment.block'] },
  ],
  sections: [
    { id: 'section-1-carousel', name: 'Sale Highlights Carousel', selector: '.section.carousel-container', style: null, blocks: ['carousel-category'], defaultContent: [] },
    { id: 'section-2-cta', name: 'Additional Savings CTA', selector: '.section.bg-image.call-to-action-container', style: 'sale-red', blocks: ['call-to-action-sale'], defaultContent: [] },
    { id: 'section-3-living', name: 'Living Room Savings', selector: '.section.product-carousel-container.separator-container:nth-of-type(1)', style: null, blocks: ['product-carousel-sale'], defaultContent: [] },
    { id: 'section-4-dining', name: 'Dining Room Savings', selector: '.section.product-carousel-container.separator-container:nth-of-type(2)', style: null, blocks: ['product-carousel-sale'], defaultContent: [] },
    { id: 'section-5-bedroom', name: 'Bedroom Savings', selector: '.section.product-carousel-container:not(.separator-container)', style: null, blocks: ['product-carousel-sale'], defaultContent: [] },
    { id: 'section-6-mattress', name: 'Mattress Teaser', selector: '.section.commerce-teaser-container:first-of-type', style: null, blocks: ['commerce-teaser-split'], defaultContent: [] },
    { id: 'section-7-seo', name: 'SEO & Legal Content', selector: '.section.hvt-text-container.fragment-container', style: null, blocks: ['fragment'], defaultContent: ['strong', 'p'] },
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
