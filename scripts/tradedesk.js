/* eslint-disable */

(function (url, ttdDomReadyCallback) {
  const script = document.createElement('script');
  script.src = url;
  script.onload = function () {
    if (ttdDomReadyCallback) ttdDomReadyCallback();
  };

  const f = document.getElementsByTagName('script')[0];
  if (f) {
    f.parentNode.insertBefore(script, f);
  }
})('https://js.adsrvr.org/up_loader.1.1.0.js', () => {
  if (typeof ttd_dom_ready === 'function')
    ttd_dom_ready(function () {
      if (typeof TTDUniversalPixelApi === 'function') {
        var universalPixelApi = new TTDUniversalPixelApi();
        universalPixelApi.init('qbmj8m9', ['91z5fr7'], 'https://insight.adsrvr.org/track/up');
      }
    });
});