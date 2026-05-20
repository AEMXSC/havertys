/* eslint-disable */

export function gtm(id, auth, preview, cookiesWin) {
  return (function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s),
      dl = l != 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    j.type = 'text/javascript';
    if (auth && preview && cookiesWin) {
      j.src += '&gtm_auth=' + auth + '&gtm_preview=' + preview + '&gtm_cookies_win=' + cookiesWin;
    }
    j.setAttribute('class', 'optanon-category-C0001');
    d.head.append(j);
  })(window, document, 'script', 'dataLayer', id);
}
