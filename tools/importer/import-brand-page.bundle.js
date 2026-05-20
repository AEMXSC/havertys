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

  // tools/importer/import-brand-page.js
  var import_brand_page_exports = {};
  __export(import_brand_page_exports, {
    default: () => import_brand_page_default
  });

  // tools/importer/parsers/commerce-teaser-featured.js
  function parse(element, { document }) {
    const wrapper = element.closest(".commerce-teaser-wrapper");
    if (!wrapper || !wrapper.classList.contains("featured-right") && !wrapper.classList.contains("featured-left")) {
      element.replaceWith(document.createComment(""));
      return;
    }
    const cells = [];
    const img = element.querySelector(".image-container img, img");
    const imgCell = document.createDocumentFragment();
    if (img) {
      imgCell.appendChild(document.createComment(" field:image "));
      imgCell.appendChild(img.cloneNode(true));
    }
    const contentCell = document.createDocumentFragment();
    contentCell.appendChild(document.createComment(" field:content "));
    const heading = element.querySelector(".titles h3, .titles h2, .titles h4, .content-container h3, .content-container h2");
    if (heading) {
      contentCell.appendChild(heading.cloneNode(true));
    }
    const description = element.querySelector(".para.description p, .description p, .content-container p");
    if (description) {
      contentCell.appendChild(description.cloneNode(true));
    }
    const ctaLinks = element.querySelectorAll(".button-container a.button, .button-container a.cta, a.button.cta");
    ctaLinks.forEach((link) => {
      const p = document.createElement("p");
      p.appendChild(link.cloneNode(true));
      contentCell.appendChild(p);
    });
    cells.push([imgCell, contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "commerce-teaser-featured", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-linked-image.js
  function parse2(element, { document }) {
    const cardWrapper = element.closest(".commerce-teaser-wrapper");
    const gridWrapper = element.closest(".grid-wrapper");
    if (!gridWrapper) {
      const cells2 = [];
      const row = buildCardRow(element, document);
      if (row) cells2.push(row);
      const block2 = WebImporter.Blocks.createBlock(document, { name: "cards-linked-image", cells: cells2 });
      element.replaceWith(block2);
      return;
    }
    if (gridWrapper.dataset.cardsProcessed === "true") {
      element.replaceWith(document.createComment(""));
      return;
    }
    gridWrapper.dataset.cardsProcessed = "true";
    const allTeasers = gridWrapper.querySelectorAll(".commerce-teaser.block");
    const cells = [];
    allTeasers.forEach((teaser) => {
      const row = buildCardRow(teaser, document);
      if (row) cells.push(row);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-linked-image", cells });
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
    const heading = teaser.querySelector(".titles h4, h4.linked-title, h4");
    if (heading) {
      const bodyCell = document.createDocumentFragment();
      bodyCell.appendChild(document.createComment(" field:title "));
      bodyCell.appendChild(heading.cloneNode(true));
      row.push(bodyCell);
    } else {
      const linkEl = teaser.querySelector(".titles a, a.button");
      if (linkEl) {
        const bodyCell = document.createDocumentFragment();
        bodyCell.appendChild(document.createComment(" field:title "));
        bodyCell.appendChild(linkEl.cloneNode(true));
        row.push(bodyCell);
      } else {
        row.push("");
      }
    }
    return row;
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

  // tools/importer/import-brand-page.js
  var parsers = {
    "commerce-teaser-featured": parse,
    "cards-linked-image": parse2
  };
  var PAGE_TEMPLATE = {
    name: "brand-page",
    description: "Brand messaging page with service highlights, content grids, and guarantee information",
    urls: ["https://main--hvt-eds--havertys-furniture.aem.live/rfg"],
    blocks: [
      { name: "commerce-teaser-featured", instances: [".commerce-teaser-container .commerce-teaser.block"] },
      { name: "cards-linked-image", instances: [".grid-container.commerce-teaser-container .commerce-teaser.block"] }
    ],
    sections: [
      { id: "section-1-intro", name: "Page Introduction", selector: ".section.hvt-text-container:first-of-type", style: null, blocks: [], defaultContent: ["h1", "p"] },
      { id: "section-2-beyond", name: "Beyond the Furniture", selector: ".section.commerce-teaser-container:not(.grid-container):nth-of-type(1)", style: null, blocks: ["commerce-teaser-featured"], defaultContent: [] },
      { id: "section-3-delivery-cards", name: "Delivery & Planning Cards", selector: ".section.grid-container.commerce-teaser-container:nth-of-type(1)", style: null, blocks: ["cards-linked-image"], defaultContent: [] },
      { id: "section-4-inspiration", name: "Design & Inspiration", selector: ".section.commerce-teaser-container:not(.grid-container):nth-of-type(2)", style: null, blocks: ["commerce-teaser-featured"], defaultContent: [] },
      { id: "section-5-service-cards", name: "Service & Care Cards", selector: ".section.grid-container.commerce-teaser-container:nth-of-type(2)", style: null, blocks: ["cards-linked-image"], defaultContent: [] },
      { id: "section-6-guarantee", name: "Guarantee Statement", selector: ".section.hvt-text-container:last-of-type", style: null, blocks: [], defaultContent: ["strong", "p"] }
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
  var import_brand_page_default = {
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
  return __toCommonJS(import_brand_page_exports);
})();
