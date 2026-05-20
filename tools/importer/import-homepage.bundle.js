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

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-video-sale.js
  function parse(element, { document }) {
    const cells = [];
    const video = element.querySelector(".hero-video-wrapper video.hero-video, .hero-video-wrapper video, video");
    const mediaCell = document.createDocumentFragment();
    mediaCell.appendChild(document.createComment(" field:backgroundMedia "));
    if (video) {
      mediaCell.appendChild(video.cloneNode(true));
    }
    cells.push([mediaCell]);
    const contentCell = document.createDocumentFragment();
    contentCell.appendChild(document.createComment(" field:content "));
    const eyebrow = element.querySelector(".hero-text-content h4, .hero-hero-gradient-layout h4, .para h4");
    if (eyebrow) {
      contentCell.appendChild(eyebrow.cloneNode(true));
    }
    const heading = element.querySelector(".hero-text-content h1, .hero-hero-gradient-layout h1, .para h1, .para h2");
    if (heading) {
      contentCell.appendChild(heading.cloneNode(true));
    }
    const featureText = element.querySelector(".feature-product-text p, .feature-product-text");
    if (featureText) {
      const featurePara = featureText.tagName === "P" ? featureText : featureText.querySelector("p");
      if (featurePara) {
        contentCell.appendChild(featurePara.cloneNode(true));
      }
    }
    const ctaLinks = element.querySelectorAll(
      ".hero-button-wrapper a.button, .hero-button-wrapper a, .button-container a.button"
    );
    ctaLinks.forEach((link) => {
      const p = document.createElement("p");
      p.appendChild(link.cloneNode(true));
      contentCell.appendChild(p);
    });
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-video-sale", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/call-to-action-promo.js
  function parse2(element, { document }) {
    const textContainer = element.querySelector(".call-to-action-text > div, .call-to-action-text");
    const ctaLinks = Array.from(
      element.querySelectorAll(".call-to-action-cta a.button, .call-to-action-cta a")
    );
    const container = document.createElement("div");
    container.appendChild(document.createComment(" field:content "));
    if (textContainer) {
      const contentElements = textContainer.querySelectorAll("h1, h2, h3, h4, h5, h6, p");
      contentElements.forEach((el) => {
        container.appendChild(el);
      });
    }
    ctaLinks.forEach((link) => {
      const p = document.createElement("p");
      p.appendChild(link.cloneNode(true));
      container.appendChild(p);
    });
    const cells = [[container]];
    const block = WebImporter.Blocks.createBlock(document, { name: "call-to-action-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-category.js
  function parse3(element, { document }) {
    const slides = element.querySelectorAll(".carousel-slide-container, .swiper-slide");
    const cells = [];
    slides.forEach((slide) => {
      const img = slide.querySelector(".dynamic-media-image img, img");
      const imgLink = slide.querySelector(".dynamic-media-image a[href], .dynamic-media-image-wrapper a[href]");
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      if (img) {
        if (imgLink) {
          const link = imgLink.cloneNode(false);
          link.appendChild(img.cloneNode(true));
          imageCell.appendChild(link);
        } else {
          imageCell.appendChild(img.cloneNode(true));
        }
      }
      const heading = slide.querySelector(".carousel-text h4, .carousel-text h3, .carousel-text h2, h4, h3");
      const contentCell = document.createDocumentFragment();
      contentCell.appendChild(document.createComment(" field:title "));
      if (heading) {
        contentCell.appendChild(heading.cloneNode(true));
      } else {
        const textLink = slide.querySelector(".carousel-text a, .carousel-text-wrapper a");
        if (textLink) {
          contentCell.appendChild(textLink.cloneNode(true));
        }
      }
      cells.push([imageCell, contentCell]);
    });
    if (cells.length === 0) {
      const rows = element.querySelectorAll(":scope > div");
      rows.forEach((row) => {
        const columns = row.querySelectorAll(":scope > div");
        if (columns.length >= 2) {
          const imgEl = columns[0].querySelector("img");
          const headingEl = columns[1].querySelector("h4, h3, h2, a");
          const imageCell = document.createDocumentFragment();
          imageCell.appendChild(document.createComment(" field:image "));
          if (imgEl) {
            imageCell.appendChild(imgEl.cloneNode(true));
          }
          const contentCell = document.createDocumentFragment();
          contentCell.appendChild(document.createComment(" field:title "));
          if (headingEl) {
            contentCell.appendChild(headingEl.cloneNode(true));
          }
          cells.push([imageCell, contentCell]);
        }
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-category", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/commerce-teaser-split.js
  function parse4(element, { document }) {
    const cells = [];
    const mediaCell = document.createDocumentFragment();
    mediaCell.appendChild(document.createComment(" field:image "));
    const img = element.querySelector(".image-container img, .scene7-image img, img");
    const video = element.querySelector(".video-container video, video");
    if (img) {
      mediaCell.appendChild(img.cloneNode(true));
    } else if (video) {
      mediaCell.appendChild(video.cloneNode(true));
    }
    const contentCell = document.createDocumentFragment();
    contentCell.appendChild(document.createComment(" field:content "));
    const pretitleDiv = element.querySelector('[data-prop-name="pretitle"], .titles > div:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6)');
    if (pretitleDiv) {
      const pretitleP = pretitleDiv.querySelector("p");
      if (pretitleP && pretitleP.textContent.trim()) {
        contentCell.appendChild(pretitleP.cloneNode(true));
      }
    }
    const heading = element.querySelector(".titles h2, .titles h3, .titles h4, .content-container h2, .content-container h3");
    if (heading) {
      contentCell.appendChild(heading.cloneNode(true));
    }
    const descContainer = element.querySelector('[data-prop-name="description"], .para.description, .description');
    if (descContainer) {
      const descP = descContainer.querySelector("p");
      if (descP && descP.textContent.trim()) {
        contentCell.appendChild(descP.cloneNode(true));
      }
    }
    const buttonContainers = element.querySelectorAll(".button-container");
    buttonContainers.forEach((container) => {
      const link = container.querySelector("a.button, a.cta, a");
      if (link && link.textContent.trim()) {
        const p = document.createElement("p");
        p.appendChild(link.cloneNode(true));
        contentCell.appendChild(p);
      }
    });
    cells.push([mediaCell, contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "commerce-teaser-split", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/fragment.js
  function parse5(element, { document }) {
    const link = element.querySelector('a[href*="/fragments/"]') || element.querySelector(":scope > div > div > a[href]") || element.querySelector("a[href]");
    if (link) {
      const container2 = document.createElement("div");
      container2.appendChild(document.createComment(" field:reference "));
      container2.appendChild(link.cloneNode(true));
      const cells2 = [[container2]];
      const block2 = WebImporter.Blocks.createBlock(document, { name: "fragment", cells: cells2 });
      element.replaceWith(block2);
      return;
    }
    const loadedSection = element.querySelector(".section[data-section-status]");
    if (loadedSection) {
      const parentContainer = element.closest(".fragment-container");
      const nearbyFragmentLink = parentContainer ? parentContainer.querySelector('a[href*="/fragments/"]') : null;
      const container2 = document.createElement("div");
      container2.appendChild(document.createComment(" field:reference "));
      if (nearbyFragmentLink) {
        container2.appendChild(nearbyFragmentLink.cloneNode(true));
      } else {
        const placeholderLink2 = document.createElement("a");
        placeholderLink2.href = "/fragments/placeholder";
        placeholderLink2.textContent = "/fragments/placeholder";
        container2.appendChild(placeholderLink2);
      }
      const cells2 = [[container2]];
      const block2 = WebImporter.Blocks.createBlock(document, { name: "fragment", cells: cells2 });
      element.replaceWith(block2);
      return;
    }
    const container = document.createElement("div");
    container.appendChild(document.createComment(" field:reference "));
    const placeholderLink = document.createElement("a");
    placeholderLink.href = "/fragments/placeholder";
    placeholderLink.textContent = "/fragments/placeholder";
    container.appendChild(placeholderLink);
    const cells = [[container]];
    const block = WebImporter.Blocks.createBlock(document, { name: "fragment", cells });
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

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-video-sale": parse,
    "call-to-action-promo": parse2,
    "carousel-category": parse3,
    "commerce-teaser-split": parse4,
    "fragment": parse5
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Main landing page with hero carousel, promotional banners, and featured collections",
    urls: ["https://main--hvt-eds--havertys-furniture.aem.live/"],
    blocks: [
      { name: "hero-video-sale", instances: [".hero-container .hero.block"] },
      { name: "call-to-action-promo", instances: [".call-to-action-container .call-to-action.block"] },
      { name: "carousel-category", instances: [".carousel-container .carousel.vertical-image.block"] },
      { name: "commerce-teaser-split", instances: [".commerce-teaser-container .commerce-teaser.block"] },
      { name: "fragment", instances: [".fragment-container .fragment.block"] }
    ],
    sections: [
      { id: "section-1-hero", name: "Hero Section", selector: ".section.hero-container", style: null, blocks: ["hero-video-sale"], defaultContent: [] },
      { id: "section-2-cta", name: "Financing CTA", selector: ".section.call-to-action-container:nth-of-type(1)", style: null, blocks: ["call-to-action-promo"], defaultContent: [] },
      { id: "section-3-carousel", name: "Category Carousel", selector: ".section.carousel-container", style: null, blocks: ["carousel-category"], defaultContent: [] },
      { id: "section-4-lookbook", name: "Spring Lookbook CTA", selector: ".section.bg-image.call-to-action-container", style: "bg-image", blocks: ["call-to-action-promo"], defaultContent: [] },
      { id: "section-5-design", name: "Design Service Teaser", selector: [".section.bg-image.commerce-teaser-container:nth-of-type(1)"], style: "bg-image", blocks: ["commerce-teaser-split"], defaultContent: [] },
      { id: "section-6-brand", name: "Brand Story Teaser", selector: [".section.bg-image.commerce-teaser-container:nth-of-type(2)"], style: "bg-image", blocks: ["commerce-teaser-split"], defaultContent: [] },
      { id: "section-7-signup", name: "Newsletter Signup", selector: ".section.call-to-action-container:last-of-type", style: null, blocks: ["call-to-action-promo"], defaultContent: [] },
      { id: "section-8-legal", name: "Legal Disclaimers", selector: ".section.read-more-container.fragment-container", style: null, blocks: ["fragment"], defaultContent: [] }
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
  var import_homepage_default = {
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
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
