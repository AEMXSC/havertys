/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-service-page.js
  var import_service_page_exports = {};
  __export(import_service_page_exports, {
    default: () => import_service_page_default
  });

  // tools/importer/parsers/hero-service.js
  function parse(element, { document }) {
    const bgImage = element.querySelector(":scope > img, :scope > picture, :scope > div > picture");
    const textBlock = element.querySelector('.hvt-text, .hero.block, [class*="hvt-text"]');
    const eyebrow = textBlock ? textBlock.querySelector('h4, h5, .eyebrow, [class*="eyebrow"]') : element.querySelector('h4, h5, .eyebrow, [class*="eyebrow"]');
    const heading = textBlock ? textBlock.querySelector('h1, h2, [class*="heading"]') : element.querySelector('h1, h2, [class*="heading"]');
    const subtext = textBlock ? textBlock.querySelector('p, .description, [class*="subtext"]') : element.querySelector('p, .description, [class*="subtext"]');
    const ctaPrimary = element.querySelector("a.button.primary, a.cta-primary, a.button:first-of-type");
    const ctaSecondary = element.querySelector("a.button.secondary, a.cta-secondary, a.button:nth-of-type(2)");
    const cells = [];
    if (bgImage) {
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(bgImage);
      cells.push([imageCell]);
    } else {
      cells.push([""]);
    }
    const contentCell = document.createDocumentFragment();
    if (eyebrow) {
      const eyebrowHint = document.createComment(" field:eyebrow ");
      contentCell.appendChild(eyebrowHint);
      contentCell.appendChild(eyebrow);
    }
    if (heading) {
      const headingHint = document.createComment(" field:heading ");
      contentCell.appendChild(headingHint);
      contentCell.appendChild(heading);
    }
    if (subtext) {
      const subtextHint = document.createComment(" field:subtext ");
      contentCell.appendChild(subtextHint);
      contentCell.appendChild(subtext);
    }
    if (ctaPrimary) {
      const ctaPrimaryHint = document.createComment(" field:cta-primary-label ");
      contentCell.appendChild(ctaPrimaryHint);
      contentCell.appendChild(ctaPrimary);
    }
    if (ctaSecondary) {
      const ctaSecondaryHint = document.createComment(" field:cta-secondary-label ");
      contentCell.appendChild(ctaSecondaryHint);
      contentCell.appendChild(ctaSecondary);
    }
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-service", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-gallery.js
  function parse2(element, { document }) {
    const isHeroCarousel = element.classList.contains("single-image-hero-carousel");
    let slides;
    if (isHeroCarousel) {
      slides = Array.from(element.querySelectorAll(".swiper-slide .hero-single-asset"));
    } else {
      slides = Array.from(element.querySelectorAll(".carousel-slide-container"));
    }
    const cells = [];
    slides.forEach((slide) => {
      const link = slide.querySelector("a[href]");
      const img = slide.querySelector("img");
      if (!img) return;
      const cellContent = document.createElement("div");
      cellContent.appendChild(document.createComment(" field:image "));
      if (link) {
        const anchor = document.createElement("a");
        anchor.href = link.getAttribute("href");
        if (link.getAttribute("title")) {
          anchor.title = link.getAttribute("title");
        }
        const picture = document.createElement("picture");
        const newImg = document.createElement("img");
        newImg.src = img.getAttribute("src");
        newImg.alt = img.getAttribute("alt") || "";
        picture.appendChild(newImg);
        anchor.appendChild(picture);
        cellContent.appendChild(anchor);
      } else {
        const picture = document.createElement("picture");
        const newImg = document.createElement("img");
        newImg.src = img.getAttribute("src");
        newImg.alt = img.getAttribute("alt") || "";
        picture.appendChild(newImg);
        cellContent.appendChild(picture);
      }
      cells.push([cellContent]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-gallery", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-spotlight.js
  function parse3(element, { document }) {
    const cells = [];
    const carouselName = element.querySelector(".carousel-name-container h3, .carousel-name-container h2, .carousel-name-container h4");
    if (carouselName) {
      const nameCell = document.createDocumentFragment();
      nameCell.appendChild(document.createComment(" field:title "));
      nameCell.appendChild(carouselName.cloneNode(true));
      cells.push([nameCell]);
    }
    const slides = element.querySelectorAll(".carousel-slide-container.swiper-slide, .swiper-slide");
    slides.forEach((slide) => {
      const imgLink = slide.querySelector(".dynamic-media-image a, .dynamic-media-image-wrapper a");
      const img = slide.querySelector(".dynamic-media-image img, .dynamic-media-image-wrapper img, img");
      const headingLink = slide.querySelector(".carousel-text h4 a, .carousel-text h3 a, .carousel-text h2 a, .carousel-text a");
      const heading = slide.querySelector(".carousel-text h4, .carousel-text h3, .carousel-text h2");
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      if (imgLink && img) {
        const linkClone = imgLink.cloneNode(false);
        linkClone.appendChild(img.cloneNode(true));
        imageCell.appendChild(linkClone);
      } else if (img) {
        imageCell.appendChild(img.cloneNode(true));
      }
      const contentCell = document.createDocumentFragment();
      contentCell.appendChild(document.createComment(" field:slideContent "));
      if (heading) {
        contentCell.appendChild(heading.cloneNode(true));
      } else if (headingLink) {
        const h4 = document.createElement("h4");
        h4.appendChild(headingLink.cloneNode(true));
        contentCell.appendChild(h4);
      }
      if (img || heading || headingLink) {
        cells.push([imageCell, contentCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-spotlight", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/commerce-teaser-video.js
  function parse4(element, { document }) {
    const videoContainer = element.querySelector(".video-container");
    if (!videoContainer) {
      element.replaceWith(document.createComment(""));
      return;
    }
    const cells = [];
    const video = element.querySelector(".video-container video, video");
    const videoCell = document.createDocumentFragment();
    if (video) {
      videoCell.appendChild(document.createComment(" field:video "));
      videoCell.appendChild(video.cloneNode(true));
    }
    const contentCell = document.createDocumentFragment();
    contentCell.appendChild(document.createComment(" field:content "));
    const pretitleEl = element.querySelector('[data-prop-name="pretitle"] p, .titles > div > p');
    if (pretitleEl) {
      contentCell.appendChild(pretitleEl.cloneNode(true));
    }
    const heading = element.querySelector(".titles h3, .titles h2, .titles h4, .content-container h3, .content-container h2");
    if (heading) {
      contentCell.appendChild(heading.cloneNode(true));
    }
    const description = element.querySelector('.para.description p, .description p, [data-prop-name="description"] p');
    if (description) {
      contentCell.appendChild(description.cloneNode(true));
    }
    const ctaLinks = element.querySelectorAll(".button-container a.button, .button-container a.cta");
    ctaLinks.forEach((link) => {
      const p = document.createElement("p");
      p.appendChild(link.cloneNode(true));
      contentCell.appendChild(p);
    });
    cells.push([videoCell, contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "commerce-teaser-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/commerce-teaser-card.js
  function parse5(element, { document }) {
    const gridWrapper = element.closest(".grid-wrapper");
    if (!gridWrapper) {
      const cells2 = [];
      const row = buildCardRow(element, document);
      if (row) cells2.push(row);
      const block2 = WebImporter.Blocks.createBlock(document, { name: "commerce-teaser-card", cells: cells2 });
      element.replaceWith(block2);
      return;
    }
    if (gridWrapper.dataset.commerceTeaserCardProcessed === "true") {
      element.replaceWith(document.createComment(""));
      return;
    }
    gridWrapper.dataset.commerceTeaserCardProcessed = "true";
    const allTeasers = gridWrapper.querySelectorAll(".commerce-teaser.block");
    const cells = [];
    allTeasers.forEach((teaser) => {
      const row = buildCardRow(teaser, document);
      if (row) cells.push(row);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "commerce-teaser-card", cells });
    element.replaceWith(block);
  }
  function buildCardRow(teaser, document) {
    const row = [];
    const img = teaser.querySelector(".image-container img, img");
    if (img) {
      const imgCell = document.createDocumentFragment();
      imgCell.appendChild(document.createComment(" field:image "));
      imgCell.appendChild(img.cloneNode(true));
      row.push(imgCell);
    } else {
      row.push("");
    }
    const contentCell = document.createDocumentFragment();
    let hasContent = false;
    const heading = teaser.querySelector(".titles h4, h4, .titles h3, h3");
    if (heading) {
      contentCell.appendChild(document.createComment(" field:title "));
      contentCell.appendChild(heading.cloneNode(true));
      hasContent = true;
    }
    const description = teaser.querySelector(".para.description p, .description p, .content-container p");
    if (description) {
      contentCell.appendChild(document.createComment(" field:description "));
      contentCell.appendChild(description.cloneNode(true));
      hasContent = true;
    }
    const ctaLink = teaser.querySelector(".button-container a.button, .button-container a.cta, a.button.cta");
    if (ctaLink) {
      contentCell.appendChild(document.createComment(" field:link "));
      const linkClone = ctaLink.cloneNode(true);
      contentCell.appendChild(linkClone);
      hasContent = true;
    }
    row.push(hasContent ? contentCell : "");
    return row;
  }

  // tools/importer/parsers/accordion-faq.js
  function parse6(element, { document }) {
    let items = element.querySelectorAll(":scope > .accordion-item-container");
    if (items.length === 0) {
      items = element.querySelectorAll(":scope > details.accordion-item");
    }
    const cells = [];
    items.forEach((item) => {
      const details = item.matches("details") ? item : item.querySelector("details.accordion-item");
      if (!details) return;
      const summary = details.querySelector("summary.accordion-item-label, summary");
      const questionCell = [];
      if (summary) {
        const heading = summary.querySelector("h3, h4, h2");
        if (heading) {
          const h = document.createElement("h3");
          const headingText = heading.querySelector("p");
          h.textContent = headingText ? headingText.textContent : heading.textContent;
          questionCell.push(h);
        } else {
          const p = document.createElement("p");
          p.textContent = summary.textContent.trim();
          questionCell.push(p);
        }
      }
      const body = details.querySelector(".accordion-item-body, .accordion-item-content");
      const answerCell = [];
      if (body) {
        const bodyChildren = body.querySelectorAll(":scope > p, :scope > ul, :scope > ol, :scope > div");
        if (bodyChildren.length > 0) {
          bodyChildren.forEach((child) => {
            answerCell.push(child);
          });
        } else {
          answerCell.push(body);
        }
      }
      cells.push([questionCell.length === 1 ? questionCell[0] : questionCell, answerCell.length === 1 ? answerCell[0] : answerCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/quote-testimonial.js
  function parse7(element, { document }) {
    const blockquote = element.querySelector("blockquote");
    const quoteText = element.querySelector(".quote-inner p, blockquote p, p");
    const quoteContent = quoteText ? quoteText.textContent.trim() : "";
    const citeEl = element.querySelector("cite");
    let attribution = "";
    if (citeEl) {
      attribution = citeEl.textContent.trim().replace(/^[-—]\s*/, "");
    }
    const textColor = blockquote ? blockquote.getAttribute("data-text-color") || "" : "";
    const bgColor = blockquote ? blockquote.getAttribute("data-background-color") || "" : "";
    const quoteInner = element.querySelector(".quote-inner");
    let styleClass = "";
    if (quoteInner) {
      const classes = Array.from(quoteInner.classList).filter((c) => c !== "quote-inner");
      styleClass = classes.join(" ");
    }
    const cells = [
      [quoteContent],
      [attribution],
      [textColor],
      [bgColor],
      [styleClass]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "quote-testimonial", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/call-to-action-signup.js
  function parse8(element, { document }) {
    const heading = element.querySelector(".call-to-action-text h2, .call-to-action-main-container h2, h2");
    const description = element.querySelector(".call-to-action-text p, .call-to-action-main-container p, p");
    const ctaLink = element.querySelector(".call-to-action-cta a, .button-container a, a.button");
    const contentCell = [];
    const fieldHint = document.createComment(" field:content ");
    contentCell.push(fieldHint);
    if (heading) {
      contentCell.push(heading);
    }
    if (description) {
      contentCell.push(description);
    }
    if (ctaLink) {
      const link = document.createElement("a");
      link.href = ctaLink.href || ctaLink.getAttribute("href") || "";
      link.textContent = ctaLink.textContent.trim();
      if (ctaLink.title) {
        link.title = ctaLink.title;
      }
      contentCell.push(link);
    }
    const cells = [contentCell];
    const block = WebImporter.Blocks.createBlock(document, { name: "call-to-action-signup", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/product-carousel.js
  function parse9(element, { document }) {
    const heading = element.querySelector(
      '.content-container p.titleStyle-h4, .content-container p[class*="titleStyle"], .content-container h4, .content-container h3, .content-container h2'
    );
    const cells = [];
    const contentCell = document.createDocumentFragment();
    contentCell.appendChild(document.createComment(" field:title "));
    if (heading) {
      const h4 = document.createElement("h4");
      h4.textContent = heading.textContent.trim();
      contentCell.appendChild(h4);
    }
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "product-carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/havertys-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#gladlyChat_container"
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        "header.header-wrapper",
        "footer.footer-wrapper",
        ".skip-to-link",
        "iframe",
        "link",
        "noscript"
      ]);
      const trackingImgs = element.querySelectorAll('img[src*="arttrk.com"], img[src*="rfihub.com"]');
      trackingImgs.forEach((img) => img.remove());
      element.querySelectorAll("[onclick], [data-track]").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("data-track");
      });
    }
  }

  // tools/importer/transformers/havertys-sections.js
  var H2 = { before: "beforeTransform", after: "afterTransform" };
  function resolveSection(element, selectorValue) {
    if (!selectorValue) return null;
    const nthMatch = selectorValue.match(/^(.+):nth-of-type\((\d+)\)$/);
    if (nthMatch) {
      const baseSelector = nthMatch[1];
      const index = parseInt(nthMatch[2], 10) - 1;
      const matches = element.querySelectorAll(baseSelector);
      return matches[index] || null;
    }
    const lastMatch = selectorValue.match(/^(.+):last-of-type$/);
    if (lastMatch) {
      const baseSelector = lastMatch[1];
      const matches = element.querySelectorAll(baseSelector);
      return matches[matches.length - 1] || null;
    }
    const firstMatch = selectorValue.match(/^(.+):first-of-type$/);
    if (firstMatch) {
      const baseSelector = firstMatch[1];
      const matches = element.querySelectorAll(baseSelector);
      return matches[0] || null;
    }
    try {
      return element.querySelector(selectorValue);
    } catch (e) {
      return null;
    }
  }
  function transform2(hookName, element, payload) {
    if (hookName === H2.after) {
      const document = element.ownerDocument || element.getRootNode();
      const template = payload && payload.template;
      if (!template || !template.sections || template.sections.length < 2) {
        return;
      }
      const sections = template.sections;
      const sectionEls = sections.map((section) => {
        const selectorValue = Array.isArray(section.selector) ? section.selector[0] : section.selector;
        return resolveSection(element, selectorValue);
      });
      for (let i = sections.length - 1; i >= 0; i--) {
        const sectionEl = sectionEls[i];
        if (!sectionEl) continue;
        if (sections[i].style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: sections[i].style }
          });
          sectionEl.append(sectionMetadata);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-service-page.js
  var parsers = {
    "hero-service": parse,
    "carousel-gallery": parse2,
    "carousel-spotlight": parse3,
    "commerce-teaser-video": parse4,
    "commerce-teaser-card": parse5,
    "accordion-faq": parse6,
    "quote-testimonial": parse7,
    "call-to-action-signup": parse8,
    "product-carousel": parse9
  };
  var PAGE_TEMPLATE = {
    name: "service-page",
    description: "Service-focused page with hero, value propositions, FAQ accordion, testimonials, and CTAs",
    urls: ["https://main--hvt-eds--havertys-furniture.aem.live/free-design-service"],
    blocks: [
      { name: "hero-service", instances: [".bg-image.hvt-text-container .hero.block", ".section.bg-image.hvt-text-container"] },
      { name: "carousel-gallery", instances: [".carousel-container .carousel.block", ".grid-container.carousel-container .carousel.block"] },
      { name: "carousel-spotlight", instances: [".carousel-container .carousel.vertical-image.block"] },
      { name: "commerce-teaser-video", instances: [".commerce-teaser-container .commerce-teaser.block"] },
      { name: "commerce-teaser-card", instances: [".grid-container.commerce-teaser-container .commerce-teaser.block"] },
      { name: "accordion-faq", instances: [".accordion-container .accordion.block"] },
      { name: "quote-testimonial", instances: [".quote-container .quote.block"] },
      { name: "call-to-action-signup", instances: [".call-to-action-container .call-to-action.block"] },
      { name: "product-carousel", instances: [".product-carousel-container .product-carousel.block"] }
    ],
    sections: [
      { id: "section-1-hero", name: "Hero with Gallery", selector: ".section.bg-image.hvt-text-container", style: "navy-fabric", blocks: ["hero-service", "carousel-gallery"], defaultContent: [] },
      { id: "section-2-booking", name: "Booking CTA", selector: ".section.hvt-text-container.hvt-button-container", style: null, blocks: [], defaultContent: ["h2", "a.button"] },
      { id: "section-3-renders", name: "3D Renders Gallery", selector: ".section.grid-container.carousel-container", style: null, blocks: ["carousel-gallery"], defaultContent: [] },
      { id: "section-4-spotlights", name: "Project Spotlights", selector: ".section.carousel-container:not(.grid-container)", style: null, blocks: ["carousel-spotlight"], defaultContent: [] },
      { id: "section-5-video", name: "Video Teaser", selector: ".section.commerce-teaser-container.product-carousel-container", style: null, blocks: ["commerce-teaser-video", "product-carousel"], defaultContent: [] },
      { id: "section-6-faq", name: "FAQ Section", selector: ".section.accordion-container", style: null, blocks: ["accordion-faq"], defaultContent: ["h2"] },
      { id: "section-7-testimonial", name: "Customer Testimonial", selector: ".section.quote-container", style: null, blocks: ["quote-testimonial"], defaultContent: [] },
      { id: "section-8-cards", name: "Promotional Cards", selector: ".section.grid-container.commerce-teaser-container", style: null, blocks: ["commerce-teaser-card"], defaultContent: [] },
      { id: "section-9-signup", name: "Newsletter Signup", selector: ".section.call-to-action-container", style: "teal-accent", blocks: ["call-to-action-signup"], defaultContent: [] },
      { id: "section-10-seo", name: "SEO Content", selector: ".section.hvt-text-container:last-of-type", style: null, blocks: [], defaultContent: ["strong", "p"] }
    ]
  };
  var transformers = [transform, transform2];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
  var import_service_page_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
    }
  };
  return __toCommonJS(import_service_page_exports);
})();
