/* eslint-disable */
/* global WebImporter */

import heroVideoSaleParser from './parsers/hero-video-sale.js';
import callToActionPromoParser from './parsers/call-to-action-promo.js';
import carouselCategoryParser from './parsers/carousel-category.js';
import commerceTeaserSplitParser from './parsers/commerce-teaser-split.js';
import fragmentParser from './parsers/fragment.js';

import cleanupTransformer from './transformers/havertys-cleanup.js';
import sectionsTransformer from './transformers/havertys-sections.js';

const parsers = {
  'hero-video-sale': heroVideoSaleParser,
  'call-to-action-promo': callToActionPromoParser,
  'carousel-category': carouselCategoryParser,
  'commerce-teaser-split': commerceTeaserSplitParser,
  'fragment': fragmentParser,
};

const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Main landing page with hero carousel, promotional banners, and featured collections',
  urls: ['https://main--hvt-eds--havertys-furniture.aem.live/'],
  blocks: [
    { name: 'hero-video-sale', instances: ['.hero-container .hero.block'] },
    { name: 'call-to-action-promo', instances: ['.call-to-action-container .call-to-action.block'] },
    { name: 'carousel-category', instances: ['.carousel-container .carousel.vertical-image.block'] },
    { name: 'commerce-teaser-split', instances: ['.commerce-teaser-container .commerce-teaser.block'] },
    { name: 'fragment', instances: ['.fragment-container .fragment.block'] },
  ],
  sections: [
    { id: 'section-1-hero', name: 'Hero Section', selector: '.section.hero-container', style: null, blocks: ['hero-video-sale'], defaultContent: [] },
    { id: 'section-2-cta', name: 'Financing CTA', selector: '.section.call-to-action-container:nth-of-type(1)', style: null, blocks: ['call-to-action-promo'], defaultContent: [] },
    { id: 'section-3-carousel', name: 'Category Carousel', selector: '.section.carousel-container', style: null, blocks: ['carousel-category'], defaultContent: [] },
    { id: 'section-4-lookbook', name: 'Spring Lookbook CTA', selector: '.section.bg-image.call-to-action-container', style: 'bg-image', blocks: ['call-to-action-promo'], defaultContent: [] },
    { id: 'section-5-design', name: 'Design Service Teaser', selector: ['.section.bg-image.commerce-teaser-container:nth-of-type(1)'], style: 'bg-image', blocks: ['commerce-teaser-split'], defaultContent: [] },
    { id: 'section-6-brand', name: 'Brand Story Teaser', selector: ['.section.bg-image.commerce-teaser-container:nth-of-type(2)'], style: 'bg-image', blocks: ['commerce-teaser-split'], defaultContent: [] },
    { id: 'section-7-signup', name: 'Newsletter Signup', selector: '.section.call-to-action-container:last-of-type', style: null, blocks: ['call-to-action-promo'], defaultContent: [] },
    { id: 'section-8-legal', name: 'Legal Disclaimers', selector: '.section.read-more-container.fragment-container', style: null, blocks: ['fragment'], defaultContent: [] },
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
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index'
    );

    return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
  },
};
