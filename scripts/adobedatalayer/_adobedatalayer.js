import('./adobedatalayer-methods.js').then(({ default: AdobeDataLayerJS }) => {
  if (!window.havertysProductListingLoaded) {
    document.addEventListener('havertys.productlisting.loaded', () => {
      if (window.location.href.includes('/search')) {
        AdobeDataLayerJS.searchResults();
      }
    });
  } else if (window.location.href.includes('/search')) {
    AdobeDataLayerJS.searchResults();
  }

  document.addEventListener('havertys.productlisting.filterClick', (event) => {
    AdobeDataLayerJS.filterClick(event.detail);
  });

  document.addEventListener('click', (event) => {
    let clickedEl = event.target;
    const linkTypes = ['a', 'button', '[role="button"]', '[role="tab"]'];
    // some() emulates foreach() with short-circuit
    linkTypes.some((linkType) => {
      if (clickedEl.closest(linkType)) {
        clickedEl = clickedEl.closest(linkType);
        AdobeDataLayerJS.clickedLink(clickedEl);
        return true;
      }
      return false;
    });

    // Non button elements - image swatches / image thumbnails
    if (clickedEl.closest('.product-details') && clickedEl.tagName === 'INPUT') {
      const ele =
        clickedEl.parentElement.closest('label')?.querySelector('input[type="radio"]') ||
        clickedEl.parentElement?.querySelector('input[type="radio"]');
      if (ele) {
        if (ele.classList.contains('dropin-image-swatch') || ele.classList.contains('dropin-text-swatch')) {
          let attrVal = ele.getAttribute('aria-label');
          if (attrVal.substring(attrVal.lastIndexOf(' ')).indexOf('selected') !== -1) {
            attrVal = attrVal.substring(0, attrVal.lastIndexOf(' '));
          }
          if (attrVal.substring(attrVal.lastIndexOf(' ')).indexOf('swatch') !== -1) {
            attrVal = attrVal.substring(0, attrVal.lastIndexOf(' '));
          }
          ele.setAttribute('aria-label', attrVal?.trim());
          clickedEl = ele;
        }

        // Use thumbnail img tag with correct attributes instead of input attributes.
        if (ele?.classList?.contains('pdp-carousel__thumbnail')) {
          clickedEl = ele?.closest('.pdp-carousel__thumbnail__container')?.querySelector('img') || clickedEl;
        }

        AdobeDataLayerJS.clickedLink(clickedEl);
      }
    }

    // if the "Add to cart" link is clicked
    if (clickedEl.closest('.product-details__buttons') && clickedEl.closest('.add-to-cart')) {
      const productData = clickedEl.closest('.product-details').getAttribute('data-product');

      if (productData) {
        document.addEventListener(
          'havertys.cif.add-to-cart-complete',
          () => {
            AdobeDataLayerJS.addToCart(productData);
          },
          { once: true },
        );
      } else {
        console.error(
          'This ADD TO CART button does not have sufficient productData for the adobeDataLayer:',
          clickedEl,
        );
      }
    }
    // If a quick suggestion is clicked in the search box
    else if (clickedEl.matches('.quick-suggestion-link')) {
      sessionStorage.setItem('searchRecommendationClick', 'true');
    }
    // If a search result is clicked
    else if (clickedEl.matches('.ds-sdk-product-item a')) {
      AdobeDataLayerJS.searchResultsClick(clickedEl);
    } else {
      return false;
    }

    return null;
  });

  document.addEventListener('change', (event) => {
    if (event.target.tagName === 'SELECT') {
      AdobeDataLayerJS.clickSelect(event);
    }
  });
});
