/* eslint-disable */
/* global WebImporter */

import heroServiceParser from './parsers/hero-service.js';
import carouselGalleryParser from './parsers/carousel-gallery.js';
import carouselSpotlightParser from './parsers/carousel-spotlight.js';
import commerceTeaserVideoParser from './parsers/commerce-teaser-video.js';
import commerceTeaserCardParser from './parsers/commerce-teaser-card.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import quoteTestimonialParser from './parsers/quote-testimonial.js';
import callToActionSignupParser from './parsers/call-to-action-signup.js';
import productCarouselParser from './parsers/product-carousel.js';

import cleanupTransformer from './transformers/havertys-cleanup.js';
import sectionsTransformer from './transformers/havertys-sections.js';

const parsers = {
  'hero-service': heroServiceParser,
  'carousel-gallery': carouselGalleryParser,
  'carousel-spotlight': carouselSpotlightParser,
  'commerce-teaser-video': commerceTeaserVideoParser,
  'commerce-teaser-card': commerceTeaserCardParser,
  'accordion-faq': accordionFaqParser,
  'quote-testimonial': quoteTestimonialParser,
  'call-to-action-signup': callToActionSignupParser,
  'product-carousel': productCarouselParser,
};

const PAGE_TEMPLATE = {
  name: 'service-page',
  description: 'Service-focused page with hero, value propositions, FAQ accordion, testimonials, and CTAs',
  urls: ['https://main--hvt-eds--havertys-furniture.aem.live/free-design-service'],
  blocks: [
    { name: 'hero-service', instances: ['.bg-image.hvt-text-container .hero.block', '.section.bg-image.hvt-text-container'] },
    { name: 'carousel-gallery', instances: ['.carousel-container .carousel.block', '.grid-container.carousel-container .carousel.block'] },
    { name: 'carousel-spotlight', instances: ['.carousel-container .carousel.vertical-image.block'] },
    { name: 'commerce-teaser-video', instances: ['.commerce-teaser-container .commerce-teaser.block'] },
    { name: 'commerce-teaser-card', instances: ['.grid-container.commerce-teaser-container .commerce-teaser.block'] },
    { name: 'accordion-faq', instances: ['.accordion-container .accordion.block'] },
    { name: 'quote-testimonial', instances: ['.quote-container .quote.block'] },
    { name: 'call-to-action-signup', instances: ['.call-to-action-container .call-to-action.block'] },
    { name: 'product-carousel', instances: ['.product-carousel-container .product-carousel.block'] },
  ],
  sections: [
    { id: 'section-1-hero', name: 'Hero with Gallery', selector: '.section.bg-image.hvt-text-container', style: 'navy-fabric', blocks: ['hero-service', 'carousel-gallery'], defaultContent: [] },
    { id: 'section-2-booking', name: 'Booking CTA', selector: '.section.hvt-text-container.hvt-button-container', style: null, blocks: [], defaultContent: ['h2', 'a.button'] },
    { id: 'section-3-renders', name: '3D Renders Gallery', selector: '.section.grid-container.carousel-container', style: null, blocks: ['carousel-gallery'], defaultContent: [] },
    { id: 'section-4-spotlights', name: 'Project Spotlights', selector: '.section.carousel-container:not(.grid-container)', style: null, blocks: ['carousel-spotlight'], defaultContent: [] },
    { id: 'section-5-video', name: 'Video Teaser', selector: '.section.commerce-teaser-container.product-carousel-container', style: null, blocks: ['commerce-teaser-video', 'product-carousel'], defaultContent: [] },
    { id: 'section-6-faq', name: 'FAQ Section', selector: '.section.accordion-container', style: null, blocks: ['accordion-faq'], defaultContent: ['h2'] },
    { id: 'section-7-testimonial', name: 'Customer Testimonial', selector: '.section.quote-container', style: null, blocks: ['quote-testimonial'], defaultContent: [] },
    { id: 'section-8-cards', name: 'Promotional Cards', selector: '.section.grid-container.commerce-teaser-container', style: null, blocks: ['commerce-teaser-card'], defaultContent: [] },
    { id: 'section-9-signup', name: 'Newsletter Signup', selector: '.section.call-to-action-container', style: 'teal-accent', blocks: ['call-to-action-signup'], defaultContent: [] },
    { id: 'section-10-seo', name: 'SEO Content', selector: '.section.hvt-text-container:last-of-type', style: null, blocks: [], defaultContent: ['strong', 'p'] },
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
