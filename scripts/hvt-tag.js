import { getConfigValue } from './configs.js';

/**
 * sends a beacon to Hvt internal tagging
 * @param {Number} tagId - an integer
 * @param {String} info - a string
 */
export default async function sendHvtTag(tagId, info, productId) {
  const sendTag = async () => {
    if (!tagId || !Number.isInteger(tagId)) {
      console.error('hvt tag skipped. tagId must be integer.');
      return;
    }
    if (!info || typeof info !== 'string') {
      console.error('hvt tag skipped. info must be a string.');
      return;
    }
    try {
      const url = await getConfigValue('hvt-tag-url');
      window.navigator.sendBeacon(url, JSON.stringify({ tagId, info, productId }));
    } catch (error) {
      console.error(error);
    }
  };

  // Send tag only when document is actually visible.
  if (document.prerendering) {
    document.addEventListener('prerenderingchange', sendTag, { once: true });
  } else {
    sendTag();
  }
}
