/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Havertys site-wide cleanup.
 * Removes non-authorable content from all page templates.
 * Selectors validated against migration-work/cleaned.html.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove cookie consent banner (OneTrust) - found: <div id="onetrust-consent-sdk">
    // Remove chat widget (Gladly) - found: <div id="gladlyChat_container">
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#gladlyChat_container',
    ]);
  }
  if (hookName === H.after) {
    // Remove site header - found: <header class="header-wrapper">
    // Remove site footer - found: <footer class="footer-wrapper">
    // Remove skip navigation links - found: <a class="skip-to-chat skip-to-link">, <a class="skip-to-main skip-to-link">
    // Remove tracking iframes - found: multiple <iframe> elements (onetrust, TTD pixels, clinch, liadm)
    // Remove link elements
    WebImporter.DOMUtils.remove(element, [
      'header.header-wrapper',
      'footer.footer-wrapper',
      '.skip-to-link',
      'iframe',
      'link',
      'noscript',
    ]);

    // Remove tracking pixels (img elements with tracking src outside main content)
    const trackingImgs = element.querySelectorAll('img[src*="arttrk.com"], img[src*="rfihub.com"]');
    trackingImgs.forEach((img) => img.remove());

    // Remove data-tracking attributes if present
    element.querySelectorAll('[onclick], [data-track]').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-track');
    });
  }
}
