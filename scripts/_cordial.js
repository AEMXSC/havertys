import { events } from '@dropins/tools/event-bus.js';

/* eslint-disable */
var Cordial_jsUrl;
var Cordial_trackUrl;
var Cordial_connectUrl;
var Cordial_cookieDomain;
var crdlAccountKey;

if (!window?.isProd) {
  Cordial_jsUrl = '//track.cordial.io/track.v2.js';
  Cordial_trackUrl = '//track.cordial.io';
  Cordial_connectUrl = '//track.cordial.io';
  Cordial_cookieDomain = 'cordial.io';
  crdlAccountKey = 'havertys-sandbox';
} else {
  Cordial_jsUrl = '//d.e.havertys.com/track.v2.js';
  Cordial_trackUrl = '//se.e.havertys.com';
  Cordial_connectUrl = '//d.e.havertys.com';
  Cordial_cookieDomain = 'havertys.com';
  crdlAccountKey = 'havertys';
}

(function (C, O, R, D, I, A, L) {
  (C.CordialObject = I),
    (C[I] =
      C[I] ||
      function () {
        (C[I].q = C[I].q || []).push(arguments);
      });
  (C[I].l = 1 * new Date()), (C[I].q = []), (A = O.createElement(R));
  (L = O.getElementsByTagName(R)[0]),
    (A.async = 1),
    (A.src = D),
    (A.type = 'text/plain'),
    A.classList.add('optanon-category-C0004'),
    L.parentNode.insertBefore(A, L);
})(window, document, 'script', Cordial_jsUrl, 'crdl');

crdl('connect', crdlAccountKey, {
  trackUrl: Cordial_trackUrl,
  connectUrl: Cordial_connectUrl,
  cookieDomain: Cordial_cookieDomain,
  cookieLife: 365,
});

crdl('identityplus', 'aa', {});

window.CordialJS = {
  addToCordialCart: function (cartItems) {
    var cart_data = [];
    for (var i = 0; i < cartItems.length; i++) {
      const thisItem = cartItems[i];
      const cartItem = {
        productID: JSON.stringify(thisItem.product.id),
        sku: thisItem.product.sku,
        category: 'Unknown',
        name: thisItem.product.name,
        images: [thisItem.product.thumbnail.url],
        qty: thisItem.quantity,
        itemPrice: thisItem.prices.price.value,
        url:
          'https://www.havertys.com/products/product-page/' +
          thisItem.product.url_key.substring(0, thisItem.product.url_key.indexOf('-' + thisItem.product.sku)) +
          '#' +
          thisItem.product.sku,
      };
      cart_data.push(cartItem);
    }
    crdl([
      ['cart', 'clear'],
      ['cartitem', 'add', cart_data],
      ['event', 'cart'],
    ]);
  },

  clearCordialCart: function () {
    crdl([
      ['cart', 'clear'],
      ['event', 'cart'],
    ]);
  },

  trackEmail: function (crdlEmail) {
    crdl('contact', { email: crdlEmail }, {});
  },

  browseProduct: function (title, categoryName) {
    var properties = {
      category: categoryName,
      product: title,
    };

    crdl('event', 'browse', properties);
  },

  unsubscribe: function (crdlEmail) {
    crdl(
      'contact',
      { email: crdlEmail },
      { 'channels.email.subscribeStatus': 'unsubscribed' },
      { forceSubscribe: { email: true }, upsert: true },
    );
  },
};

events.emit('hvt/cordial', true);
