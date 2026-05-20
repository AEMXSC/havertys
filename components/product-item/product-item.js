import { performCatalogServiceQuery, handleAddProductToCart, performPaginatedVariantsQuery } from 'scripts/commerce.js';
import { getDynamicMediaImage, setAuthorDataProps } from 'scripts/scripts.js';

const DEFAULT_IMAGE_ROLE = 'small_image';

export const priceFieldsFragment = `
fragment priceFields on ProductViewPrice {
  regular {
    amount {
      currency
      value
    }
  }
  final {
    amount {
      currency
      value
    }
  }
}`;

export const productItemFragment = `
  fragment productItemFragment on ProductView{
    sku
    urlKey
    name
    externalId
    addToCartAllowed
    __typename
    images (roles: []) {
      label
      url
      roles
    }
    attributes(roles: []) {
      name
      label
      value
      roles
    }
    ... on SimpleProductView {
      price {
        ...priceFields
      }
    }
    ... on ComplexProductView {
      priceRange {
        minimum {
          ...priceFields
        }
        maximum {
          ...priceFields
        }
      }
    }
  }`;

const productItemQuery = `query productItem($sku: [String]!) {
  products(skus: $sku) {
    ...productItemFragment
  }
}
${productItemFragment}
${priceFieldsFragment}`;

const refineProductVariantQuery = `query refineProduct($sku: String!, $optionIds: [String!]!) {
  refineProduct(
      sku: $sku
      optionIds: $optionIds
  ) {
      sku
      urlKey
      name
      externalId
      addToCartAllowed
      __typename
      images(roles: ["small_image"]) {
          label
          url
      }
      attributes(roles: []) {
          name
          label
          value
          roles
      }
      ... on SimpleProductView {
          price {
              ...priceFields
          }
      }
      ... on ComplexProductView {
          priceRange {
              minimum {
              ...priceFields
              }
              maximum {
              ...priceFields
              }
          }
      }
  }
}
fragment priceFields on ProductViewPrice {
  regular {
      amount {
      currency
      value
      }
  }
  final {
      amount {
      currency
      value
      }
  }
}`;

const handleImageError = (e) => {
  const imgElement = e.target;
  if (!imgElement) {
    return;
  }

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 500;

  if (!imgElement.dataset?.retryCount) {
    imgElement.setAttribute('data-retry-count', 1);
  }

  const retryCount = parseInt(imgElement.dataset.retryCount, 10);

  if (retryCount < MAX_RETRIES) {
    imgElement.dataset.retryCount = retryCount + 1;

    // Retry loading the image
    setTimeout(() => {
      // eslint-disable-next-line no-self-assign
      imgElement.src = imgElement.src;
    }, RETRY_DELAY);
  } else if (retryCount === MAX_RETRIES) {
    console.error('Image failed to load:', imgElement.src);
    // Set fallback image
    imgElement.src = 'https://havertys.scene7.com/is/image/HvtWeb2/image-not-available?fmt=webp-alpha';

    // Change source srcset to fallback image
    const source = imgElement.parentElement.querySelector('source');
    if (source) {
      source.srcset = 'https://havertys.scene7.com/is/image/HvtWeb2/image-not-available?fmt=webp-alpha';
    }

    // Make it stop retrying
    imgElement.dataset.retryCount = retryCount + 1;
  }
};

export const isSiloImage = (image) => {
  const regex = /\d-\d\d\d\d-\d\d\d\d/;
  return regex.test(image);
};

// Create aria label for screen readers.
export const createHiddenAriaSpan = (label) => {
  const hiddenAriaSpan = document.createElement('span');
  hiddenAriaSpan.textContent = label;
  hiddenAriaSpan.classList.add('hidden-text');
  return hiddenAriaSpan;
};
export const createProductItemName = (name, urlKey, options = {}) => {
  if (!name || !urlKey) {
    return null;
  }

  const nameLink = document.createElement('a');
  nameLink.title = name;
  nameLink.ariaLabel = name;
  nameLink.classList.add('product-name');
  nameLink.href = `/products/product-page/${urlKey}`;
  const productName = document.createElement('span');
  productName.innerHTML = name;

  if (options?.analytics && nameLink) {
    nameLink.dataset.layerLabel = options.analytics;
  }

  nameLink.append(productName);

  return nameLink;
};

export const createVariantItemPrice = (price) => {
  if (!price) {
    return null;
  }

  const regularPrice = price.regular.amount.value;
  const finalPrice = price.final.amount.value;

  const priceFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.final.amount.currency || 'USD',
  });

  const priceDiv = document.createElement('div');
  priceDiv.classList.add('product-prices');

  const hasDiscount = finalPrice < regularPrice;

  // regular price
  const regularPriceSpan = document.createElement('span');
  regularPriceSpan.classList.add(hasDiscount ? 'product-og-price' : 'product-price');
  regularPriceSpan.textContent = priceFormatter.format(regularPrice);
  const originalPriceLabel = createHiddenAriaSpan('Original price:');
  regularPriceSpan.prepend(originalPriceLabel);
  priceDiv.append(regularPriceSpan);

  // show discount price if available
  if (hasDiscount) {
    const discountPriceSpan = document.createElement('span');
    discountPriceSpan.classList.add('product-price');
    discountPriceSpan.textContent = priceFormatter.format(finalPrice);
    const discountPriceLabel = createHiddenAriaSpan('Special price:');
    discountPriceSpan.prepend(discountPriceLabel);
    priceDiv.append(discountPriceSpan);
  }

  return priceDiv;
};

export const createProductItemPrice = (priceRange) => {
  if (!priceRange) {
    return null;
  }
  const { maximum, minimum } = priceRange;

  if (!maximum || !minimum) {
    return null;
  }

  const priceFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: maximum?.final?.amount?.currency || 'USD',
  });

  const price = document.createElement('div');
  price.classList.add('product-prices');

  const hasDiscount =
    maximum.final.amount.value < maximum.regular.amount.value ||
    minimum.final.amount.value < minimum.regular.amount.value;

  // regular price
  const regularPrice = document.createElement('span');
  regularPrice.classList.add(hasDiscount ? 'product-og-price' : 'product-price');
  regularPrice.textContent =
    maximum.regular.amount.value === minimum.regular.amount.value
      ? `${priceFormatter.format(maximum.regular.amount.value)}`
      : `${priceFormatter.format(minimum.regular.amount.value)}-${priceFormatter.format(maximum.regular.amount.value)}`;

  const originalPriceLabel = createHiddenAriaSpan('Original price:');
  regularPrice.prepend(originalPriceLabel);
  price.append(regularPrice);

  // show discount price if available
  if (hasDiscount) {
    const discountPrice = document.createElement('span');
    discountPrice.classList.add('product-price');

    discountPrice.textContent =
      maximum.final.amount.value === minimum.final.amount.value
        ? `${priceFormatter.format(maximum.final.amount.value)}`
        : `${priceFormatter.format(minimum.final.amount.value)}-${priceFormatter.format(maximum.final.amount.value)}`;

    const discountPriceLabel = createHiddenAriaSpan('Special price:');
    discountPrice.prepend(discountPriceLabel);
    price.append(discountPrice);
  }

  return price;
};

export const createProductItemDetails = (product, options) => {
  const productItemDetails = document.createElement('div');
  productItemDetails.classList.add('product-item-details');

  const productItemName = createProductItemName(product?.name, product?.urlKey, options);

  let productItemPrice = null;
  if (product?.price) {
    // price for variants
    productItemPrice = createVariantItemPrice(product?.price);
  } else {
    productItemPrice = createProductItemPrice(product?.priceRange);
  }

  if (productItemName) {
    productItemName.onclick = () => options?.onClick?.(product);
    productItemDetails.append(productItemName);
  }

  if (productItemPrice) {
    productItemDetails.append(productItemPrice);
  }

  return productItemDetails;
};

const showErrorMessage = (errorElement, message) => {
  if (!errorElement || !message) {
    return;
  }
  errorElement.textContent = message;
  errorElement.classList.remove('hidden');
  errorElement.setAttribute('aria-hidden', false);
  errorElement.setAttribute('role', 'alert');
};

const hideErrorMessage = (errorElement) => {
  if (!errorElement) {
    return;
  }
  errorElement.classList.add('hidden');
  errorElement.setAttribute('aria-hidden', true);
  errorElement.removeAttribute('role');
};

export const createProductItemCartButton = (product, cta) => {
  if (!cta || !product) {
    return null;
  }

  const { text } = cta;
  const button = document.createElement('button');
  button.classList.add('button', 'secondary', 'small', 'pt-atc');
  button.textContent = text || 'Add to Cart';
  button.setAttribute('aria-label', `Add ${product.name} to cart`);
  const textColor = button.style.color;

  const errorElement = document.createElement('div');
  errorElement.id = 'add-to-cart-error';
  errorElement.textContent = 'Please select item options before adding to cart';
  errorElement.classList.add('error');

  hideErrorMessage(errorElement);

  if (!product.addToCartAllowed) {
    const message = `Add to cart not allowed for product: ${product.sku}`;
    console.error(message);
    showErrorMessage(errorElement, message);
    return { button, errorElement };
  }

  button.addEventListener('click', async () => {
    try {
      button.disabled = true;
      button.style.color = 'transparent';
      hideErrorMessage(errorElement);

      const { error } = await handleAddProductToCart({
        product,
        openCart: true,
        source: 'product-teaser',
      });

      if (error) {
        showErrorMessage(errorElement, error.message);
        console.error('Error adding product to cart');
      }
    } catch (error) {
      console.error('Error adding product to cart', error);
      showErrorMessage(errorElement, 'There was an error adding this item to your cart.');
    } finally {
      button.disabled = false;
      button.style.color = textColor;
    }
  });

  return { button, errorElement };
};
export const createProductItemDetailsButton = (product, cta) => {
  if (!product || !cta) {
    return null;
  }

  const { text } = cta;

  const button = document.createElement('a');
  button.href = `/products/product-page/${product.urlKey}`;
  button.classList.add('button', 'secondary', 'small');
  button.innerText = text || 'See more details';

  return button;
};

export const createProductItemCta = (product, options) => {
  if (!product || !options?.cta) {
    return null;
  }

  const { cta } = options;

  const productItemCta = document.createElement('div');
  productItemCta.classList.add('button-container');

  let button;
  let errorElement;

  switch (options.cta.type) {
    case 'cart-button': {
      ({ button, errorElement } = createProductItemCartButton(product, cta));
      break;
    }
    case 'details-button':
      button = createProductItemDetailsButton(product, cta);
      break;
    default:
      return null;
  }

  if (button && cta.openInNewWindow) {
    button.target = '_blank';
    button.rel = 'noopener noreferrer';
  }

  if (button) {
    productItemCta.append(button);
  }

  return { productItemCta, errorElement };
};

export const createProductItemDescription = (_, options) => {
  if (!options?.overrides?.descDiv) {
    return null;
  }

  // Handle description
  const style = options?.overrides?.descStyleDiv?.textContent?.trim();
  const descriptionText = options.overrides.descDiv.textContent.trim();
  options.overrides.descDiv.classList.add('product-description', style || 'para-sm');
  const descSpan = document.createElement('span');
  descSpan.textContent = descriptionText;
  options.overrides.descDiv.replaceChildren(descSpan);
  options?.overrides?.descStyleDiv?.remove();

  setAuthorDataProps(options.overrides.descDiv, 'Product Description', 'productOverrideDes', 'string');

  // Set text color of the description.
  if (options?.styles?.descriptionTextColor) {
    options.overrides.descDiv.setAttribute('data-text-color', options.styles.descriptionTextColor);
  }

  return options.overrides.descDiv;
};

export const createProductItemContent = (product, options = {}) => {
  const productItemContent = document.createElement('div');
  productItemContent.classList.add('product-item-content');

  const productItemDetails = createProductItemDetails(product, options);
  const { productItemCta, errorElement: ctaErrorElement } = createProductItemCta(product, options) || {};
  const productDescription = createProductItemDescription(product, options);

  if (productItemDetails) {
    productItemContent.append(productItemDetails);
  }

  if (productItemCta) {
    productItemContent.append(productItemCta);
  }

  if (productDescription) {
    productItemContent.append(productDescription);
  }

  if (ctaErrorElement) {
    productItemContent.append(ctaErrorElement);
  }

  return productItemContent;
};

export const getImageUrl = (imageUrl, isSilo) => {
  // This regex matches a pattern like "1-1234-5678", typically used to identify room scene images.
  let updatedImageURL = imageUrl;

  if (isSilo) {
    updatedImageURL += `${imageUrl.indexOf('?') === -1 ? '?' : '&'}wid=500&hei=500&extend=30,10,10,30&fmt=webp-alpha`;
  } else {
    updatedImageURL += `${imageUrl.indexOf('?') === -1 ? '?' : '&'}wid=400&hei=400&fit=constrain,1`;
  }
  return updatedImageURL;
};

export const createProductItemImage = (product, options = {}) => {
  if (!product) {
    return null;
  }

  const imageRole = options?.imageRole || DEFAULT_IMAGE_ROLE;
  const imageLink = document.createElement('a');
  imageLink.title = product.name;
  imageLink.ariaLabel = product.name;
  imageLink.classList.add('image-link-wrapper');
  imageLink.href = `/products/product-page/${product.urlKey}`;
  imageLink.onclick = () => options?.onClick?.(product);

  // Hide the image link from screen readers since product name handles linking. http://ncamftp.wgbh.org/sp/tests/links/redundantLinks.html
  imageLink.setAttribute('aria-hidden', 'true');
  imageLink.setAttribute('tabindex', '-1');
  imageLink.setAttribute('role', 'presentation');

  if (options?.analytics && imageLink) {
    imageLink.dataset.layerLabel = options.analytics;
  }

  // Handle main image
  let mainImage = options?.overrides?.imgDiv;
  if (!mainImage) {
    const url =
      product?.images?.filter((img) => img?.roles?.includes(imageRole))?.[0]?.url || product?.images?.[0]?.url;
    const isSilo = isSiloImage(url);

    mainImage = document.createElement('img');
    mainImage.src = getImageUrl(url, isSilo);
    mainImage.alt = product.name || 'Product Image';
    mainImage.loading = 'lazy';
    mainImage.classList.add(isSilo ? 'silo-image' : 'room-scene-image');
    mainImage.onerror = handleImageError;

    // Hide the image from screen readers since product name handles linking. http://ncamftp.wgbh.org/sp/tests/links/redundantLinks.html
    mainImage.setAttribute('role', 'presentation');
  } else {
    setAuthorDataProps(mainImage, 'Product Image', 'productImage', 'string');
    const img = mainImage?.querySelector('img');
    if (img) {
      img.alt = product.name || 'Product Image';
    }
    mainImage.classList.add('override');
  }
  mainImage.classList.add('image');

  // Hide the image from screen readers since product name handles linking. http://ncamftp.wgbh.org/sp/tests/links/redundantLinks.html
  mainImage.setAttribute('role', 'presentation');
  imageLink.append(mainImage);

  // Handle hover image
  if (options?.overrides?.hoverImgDiv) {
    imageLink.classList.add('has-hover-image');
    options.overrides.hoverImgDiv.classList.add('hover-image');
    const img = options.overrides.hoverImgDiv.querySelector('img');
    if (img) {
      img.alt = product.name || 'Product Image';
    }
    setAuthorDataProps(options.overrides.hoverImgDiv, 'Product Hover Image', 'productHoverImage', 'string');
    imageLink.append(options.overrides.hoverImgDiv);
  }

  return imageLink;
};

export const createProductItemPlaceholder = () => `
  <div class="product-item-placeholder product-item"><div><div class="image-link-wrapper"></div></div></div>
`;

export const createProductItem = (product, options = {}) => {
  if (!product) {
    return null;
  }

  if (options?.slide) {
    options.classList = [
      'swiper-slide',
      options?.active ? 'swiper-slide-active' : 'swiper-slide-inactive',
      ...(options?.classList || []),
    ];
  }

  const productItem = options?.overrides?.container || document.createElement('div');
  productItem.classList.add('product-item', ...(options?.classList || []));
  productItem.dataset.sku = product.sku;

  // Set global styles for product item.
  if (options?.styles) {
    const { overrideImageStyle, hoverImageStyle } = options.styles;
    productItem.classList.add(overrideImageStyle, hoverImageStyle);
  }

  const productItemImage = createProductItemImage(product, options);
  const productItemContent = createProductItemContent(product, options);

  productItem.innerHTML = '';
  if (productItemImage) {
    productItem.append(productItemImage);
  }
  if (productItemContent) {
    productItem.append(productItemContent);
  }

  return productItem;
};

// Helper function to process a single product item.
export const processProductItem = (productItem) => {
  const [skuDiv, descDiv, descStyleDiv, imgDiv, hoverImgDiv, styles] = productItem.children;
  const sku = skuDiv?.textContent?.trim().split('#')[1] || skuDiv?.textContent?.trim().split('#')[0];
  skuDiv?.remove();

  if (!sku) {
    return null;
  }

  // Handle image processing for override and hover images
  const processImageContainer = (imageContainer) => {
    if (imageContainer) {
      const imageAnchor = imageContainer.querySelector('a[href]');
      if (imageAnchor && imageAnchor.href.includes('delivery')) {
        const dynamicImage = getDynamicMediaImage(imageContainer, { width: 500, height: 500 });
        if (dynamicImage) {
          imageContainer.innerHTML = ''; // Clear existing content
          imageContainer.append(dynamicImage);
        }
      }
    }
  };

  processImageContainer(imgDiv);
  processImageContainer(hoverImgDiv);

  // Only include non-empty override divs
  const overrides = {};
  if (descDiv?.textContent.trim()) {
    overrides.descDiv = descDiv;
  } else {
    descStyleDiv.remove();
  }

  if (descStyleDiv?.textContent.trim()) {
    overrides.descStyleDiv = descStyleDiv;
  }
  if (imgDiv?.innerHTML.trim()) {
    overrides.imgDiv = imgDiv;
  }
  if (hoverImgDiv?.innerHTML.trim()) {
    overrides.hoverImgDiv = hoverImgDiv;
  }

  // Set global styles for product item and remove the divs.
  let stylesData;
  if (styles) {
    const [overrideImageStyleEl, hoverImageStyleEl, descriptionTextColorEl] = styles.children;
    const overrideImageStyle = overrideImageStyleEl?.textContent?.trim();
    const hoverImageStyle = hoverImageStyleEl?.textContent?.trim();
    const descriptionTextColor = descriptionTextColorEl?.textContent?.trim();

    stylesData = {
      overrideImageStyle,
      hoverImageStyle,
      descriptionTextColor,
    };

    overrideImageStyleEl?.remove?.();
    hoverImageStyleEl?.remove?.();
    descriptionTextColorEl?.remove?.();
  }

  return {
    sku,
    styles: stylesData,
    overrides: {
      container: productItem,
      ...overrides,
    },
  };
};

const noProductMessage = (sku) =>
  `<div class="error">Unable to retrieve product given the sku ${sku}. It may not be available. This message only shows in author mode</div> `;

export const decorateProductItems = async (productItems, options) => {
  if (!productItems || !productItems.length) {
    return null;
  }

  // Grab skus from productItems.
  const skus = productItems.map((productItem) => productItem?.children[0]?.textContent?.trim()).filter((item) => item);
  if (!skus.length) {
    return null;
  }

  const parentSkus = skus.map((sku) => sku.split('#')[0]);

  // Fetch product data for all SKUs
  const { products } = await performCatalogServiceQuery(productItemQuery, { sku: parentSkus });
  if (!products) {
    if (window.isAuthor) {
      productItems.forEach((item) => {
        const rawSku = item?.children[0]?.textContent?.trim();
        const parentSku = rawSku ? rawSku.split('#')[0] : '';
        item.innerHTML = noProductMessage(parentSku);
        item.classList.add('swiper-slide', 'product-item');
      });

      return productItems;
    }

    return null;
  }

  // Save products in map for access when looping over productItems.
  const productMap = new Map();
  products.forEach((product) => productMap.set(product.sku, product));

  // variant products
  await Promise.all(
    skus.map(async (sku) => {
      const parentSku = sku.split('#')[0];
      const variantSku = sku.split('#')[1];

      if (variantSku) {
        const variants = await performPaginatedVariantsQuery(parentSku);
        const matchedVariant = variants.find((variant) => variant.product.sku === variantSku);

        let refineProduct;
        if (matchedVariant?.selections) {
          refineProduct = (
            await performCatalogServiceQuery(refineProductVariantQuery, {
              sku: parentSku,
              optionIds: matchedVariant.selections,
            })
          )?.refineProduct;
        }

        if (refineProduct) {
          // fix urlKey for variant product
          refineProduct.urlKey = `${products.find((p) => p.sku === parentSku)?.urlKey}#${variantSku}`;

          // add variant sku to the product for cart addition
          refineProduct.variantSku = variantSku;

          productMap.set(refineProduct.sku, refineProduct);
        } else {
          // fall back to parent sku product
          productMap.set(
            variantSku,
            products.find((p) => p.sku === parentSku),
          );
        }
      }
    }),
  );

  // Loop each product item and create product from the product data associated with sku.
  return productItems.map((productItem, index) => {
    const processedItem = processProductItem(productItem);

    if (!processedItem?.sku) {
      if (window.isAuthor) {
        return productItem;
      }
      // Cleanup any residual product item container when sku is missing.
      productItem?.remove?.();
      return null;
    }

    const product = productMap.get(processedItem.sku);
    if (!product) {
      if (window.isAuthor) {
        productItem.innerHTML = noProductMessage(processedItem.sku);
        productItem.classList.add('swiper-slide', 'product-item');
        return productItem;
      }
      console.error(`Unable to retrieve product given the sku ${processedItem?.sku}`);

      // Cleanup any residual product item container.
      productItem?.remove?.();

      return null;
    }

    return createProductItem(product, {
      ...options,
      overrides: processedItem.overrides,
      styles: processedItem.styles,
      active: !index,
    });
  });
};
