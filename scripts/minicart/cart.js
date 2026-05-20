/* Manage Cart Operations */
import { ErrorCodes } from 'scripts/errors.js';
import { mapProductAcdl, safeQuery } from '../commerce.js';
import { Cart } from './api.js';

const DEFAULT_EMPTY_CART = Cart.DEFAULT_EMPTY_CART;

/* Queries */
const ProductListingFragment = `
fragment ProductListingFragment on Cart {
  items {
    __typename
    uid
    id
    quantity
    locked
    worksheet_id
    worksheet_expiration_date

    prices {
      row_total {
        currency
        value
      }
      unit_discount_price {
        currency
        value
      }
      total_item_discount {
        currency
        value
      }
      price {
        currency
        value
      }
    }

    product {
        id
        uid
        name
        sku
        url_key
        canonical_url
        hvt_70

        thumbnail {
          label
          url
        }

        categories {
          url_path
          name
          url_key
        }
          
        price_range {
          minimum_price {
            regular_price {
              value
            }
            final_price {
              value
              currency
            }
          }
          maximum_price {
            regular_price {
              value
              currency
            }
            final_price {
              value
              currency
            }
            discount {
              amount_off
              percent_off
            }
          }
        }
    }

    ... on ConfigurableCartItem {
        parent_sku

        configurable_options {
            id
            value_id
            option_label
            value_label
        }
        configured_variant {
            thumbnail {
                url
            }
        }
    }

    eligible_for_warranty
    warranty_type
    warranty_selected
    warranty_item
    warranty_items {
      price
      sku
      description
    }

    error {
      code
    }
  }
}`;

const PriceSummaryFragment = `fragment PriceSummaryFragment on Cart {
  prices {
      discount {
        amount {
          currency
          value
        }
      }
      subtotal_excluding_tax {
        currency
        value
      }
      subtotal_with_discount_excluding_tax {
        currency
        value
      }
      subtotal_including_tax {
        currency
        value
      }
      warranty_cost {
        currency
        value
      }
  }
}`;

const cartQueryFragment = `fragment cartQuery on Cart {
  id
  total_quantity
  error {
    code
  }
  ...ProductListingFragment
  ...PriceSummaryFragment
}
${ProductListingFragment}
${PriceSummaryFragment}
`;

const getCartQuery = `query getCart($cartId: String!) {
  cart(cart_id: $cartId) {
      ...cartQuery
  }
}
${cartQueryFragment}`;

const createCartMutation = `mutation createCart {
  cartId: createEmptyCart
}`;

const mergeCartMutation = `mutation MergeCartsAfterSignIn(
  $sourceCartId: String!
  $destinationCartId: String!
) {
  mergeCarts(
      source_cart_id: $sourceCartId
      destination_cart_id: $destinationCartId
  ) {
      id
      items {
          id
          uid
      }
  }
}`;

const removeItemFromCartMutation = `mutation removeItemFromCart($cartId: String!, $uid: ID!) {
  removeItemFromCart(input: { cart_id: $cartId, cart_item_uid: $uid }) {
      cart {
          ...cartQuery
      }
  }
}
${cartQueryFragment}`;

const updateCartItemsMutation = `mutation updateCartItems($cartId: String!, $items: [CartItemUpdateInput!]!) {
  updateCartItems(input: { cart_id: $cartId, cart_items: $items }) {
      cart {
          ...cartQuery
      }
  }
}
${cartQueryFragment}`;

const addProductsToCartMutation = `mutation addProductsToCart($cartId: String!, $cartItems: [CartItemInput!]!) {
  addProductsToCart(cartId: $cartId, cartItems: $cartItems) {
      cart {
          ...cartQuery
      }
      user_errors {
          code
          message
      }
  }
}
${cartQueryFragment}`;

const addWorksheetItemToCartMutation = `mutation addWorksheetItemToCart($cartId: String! $worksheetId: ID! $itemId: ID!) {
  addWorksheetItemToCart(
    input: {
      cart_id: $cartId,
      worksheet_id: $worksheetId,
      item_id : $itemId
    }
  ) {
      cart {
          ...cartQuery
      }
  }
}
${cartQueryFragment}`;

const removeWorksheetFromCartMutation = `mutation removeWorksheetFromCart($cartId: String!, $worksheetId: ID!) {
    removeWorksheetFromCart(input: { cart_id: $cartId, worksheet_id: $worksheetId }){
      cart {
        ...cartQuery
      }
    }
}
${cartQueryFragment}
`;

const addWorksheetToCartMutation = `mutation addWorksheetToCart($cartId: String! $worksheetId: Int!) {
  addWorksheetToCart(
    input: {
      cart_id: $cartId,
      worksheet_id: $worksheetId
    }
  ) {
      cart {
          ...cartQuery
      }
  }
}
${cartQueryFragment}`;

const addWarrantyToCartItemsMutation = `
mutation addWarrantyToCartItems($cartId: ID! $itemSequenceNumber: Int! $warrantyItemSku: String! $warrantyType: WarrantyKind!) {
  addWarrantyToCartItems(
    input: {
      cart_id: $cartId
      protection: [{
          item_sequence_number: $itemSequenceNumber
          warranty_item_sku: $warrantyItemSku
          warranty_type: $warrantyType
      }]
    }
  ) {
      cart {
          ...cartQuery
      }
  }
}
${cartQueryFragment}
`;

const removeWarrantyFromCartItemsMutation = `
mutation removeWarrantyFromCartIte ($cartId: ID! $itemId: Int!){
    removeWarrantyFromCartItem(
      cart_id: $cartId
      item_id: $itemId
    ) {
        ...cartQuery
  }
}
${cartQueryFragment}
`;

export {
  getCartQuery,
  createCartMutation,
  mergeCartMutation,
  removeItemFromCartMutation,
  updateCartItemsMutation,
  addProductsToCartMutation,
  removeWarrantyFromCartItemsMutation,
  addWarrantyToCartItemsMutation,
};

/* GraphQL Methods */
export async function getCart(cartId) {
  const { result: cart, error } = await safeQuery({ query: getCartQuery, variables: { cartId }, responsePath: 'cart' });
  return { cart, error };
}

export async function createCart() {
  const { result: cartId, error } = await safeQuery({
    query: createCartMutation,
    variables: {},
    responsePath: 'cartId',
  });
  return { cartId, error };
}

export async function mergeCartsAfterSignIn(sourceCartId, destinationCartId) {
  const { result: cartId, error } = await safeQuery({
    query: mergeCartMutation,
    variables: { sourceCartId, destinationCartId },
    responsePath: 'mergeCarts.id',
  });
  return { cartId, error };
}

export async function getNonDummyCartId(cartId = null) {
  if (cartId && cartId !== DEFAULT_EMPTY_CART) return { cartId };
  return createCart();
}

export async function addToCart(sku, options, quantity, source, cartId) {
  try {
    const variables = {
      cartId,
      cartItems: [
        {
          sku,
          quantity,
          selected_options: options,
        },
      ],
    };

    const { result, error } = await safeQuery({
      query: addProductsToCartMutation,
      variables,
      responsePath: 'addProductsToCart',
    });
    if (error) return { error };

    const { cart, user_errors: userErrors } = result;

    if (userErrors && userErrors.length > 0) {
      const error = new Error(userErrors.map((e) => e.message).join('; '));
      err.code = ErrorCodes.INPUT_ERROR;
      throw error;
    }

    console.debug('Added items to cart', variables, cart);
    return { cart };
  } catch (error) {
    // Log sku specific cart error so track js can capture it.
    console.error(`Error adding ${source} ${sku} to cart:`, error);
    return { error };
  }
}

export async function addWorksheetItemToCart(worksheetId, sequence, source, cartId) {
  try {
    const variables = {
      cartId,
      worksheetId,
      itemId: sequence,
    };

    const { result, error } = await safeQuery({
      query: addWorksheetItemToCartMutation,
      variables,
      responsePath: 'addWorksheetItemToCart',
    });
    if (error) return { error };

    const { cart } = result;

    console.debug('Added worksheet item to cart', variables, cart);
    return { cart };
  } catch (error) {
    // Log sku specific cart error so track js can capture it.
    console.error(`Error adding ${source} ${worksheetId} ${sequence} to cart:`, error);
    return { error };
  }
}

export async function removeWorksheetFromCart(worksheetId, cartId) {
  try {
    const variables = {
      cartId,
      worksheetId,
    };

    const { result, error } = await safeQuery({
      query: removeWorksheetFromCartMutation,
      variables,
      responsePath: 'removeWorksheetFromCart',
    });
    if (error) return { error };

    const { cart } = result;

    console.debug('Removed worksheet from cart', variables, cart);
    return { cart };
  } catch (error) {
    // Log sku specific cart error so track js can capture it.
    console.error(`Error removing worksheet ${worksheetId} from cart:`, error);
    return { error };
  }
}

export async function addWorksheetToCart(worksheetId, source, cartId) {
  try {
    const variables = {
      cartId,
      worksheetId,
    };

    const { result, error } = await safeQuery({
      query: addWorksheetToCartMutation,
      variables,
      responsePath: 'addWorksheetToCart',
    });
    if (error) return { error };

    const { cart } = result;

    console.debug('Added worksheet to cart', variables, cart);
    return { cart };
  } catch (error) {
    // Log sku specific cart error so track js can capture it.
    console.error(`Error adding ${source} ${worksheetId} to cart:`, error);
    return { error };
  }
}

export async function removeItemFromCart(uid, cartId) {
  const { result: cart, error } = await safeQuery({
    query: removeItemFromCartMutation,
    variables: { cartId, uid },
    responsePath: 'removeItemFromCart.cart',
  });
  return { cart, error };
}

export async function updateQuantityOfCartItem(cartItemUid, quantity, cartId) {
  const { result: cart, error } = await safeQuery({
    query: updateCartItemsMutation,
    variables: {
      cartId,
      items: [
        {
          cart_item_uid: cartItemUid,
          quantity,
        },
      ],
    },
    responsePath: 'updateCartItems.cart',
  });
  return { cart, error };
}

export async function addWarrantyToCartItem(item, cartId) {
  const variables = {
    cartId,
    itemSequenceNumber: item.id,
    warrantyItemSku: item.product.sku,
    warrantyType: item.warranty_type,
  };

  const { result: cart, error } = await safeQuery({
    query: addWarrantyToCartItemsMutation,
    variables,
    responsePath: 'addWarrantyToCartItems.cart',
    defaultErrorMessage: ErrorCodes.DEFAULT_PROTECTION,
  });

  return { cart, error };
}

export async function removeWarrantyFromCartItem(item, cartId) {
  const { result: cart, error } = await safeQuery({
    query: removeWarrantyFromCartItemsMutation,
    variables: {
      cartId,
      itemId: item.id,
    },
    responsePath: 'removeWarrantyFromCartItem',
    defaultErrorMessage: ErrorCodes.DEFAULT_PROTECTION,
  });
  return { cart, error };
}

/* Methods */
export function mapCartItem(item) {
  const productCtx = mapProductAcdl({
    ...item.product,
    sku: item.parent_sku,
    variantSku: item.product.sku,
    productType: item.__typename,
    categories: item?.product?.hvt_70?.split(' / '),
  });

  const price = item.prices?.unit_discount_price || item.prices?.price;
  const priceFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency,
  });

  return {
    id: item.uid,
    formattedPrice: priceFormatter.format(price.value),
    canApplyMsrp: false,
    prices: {
      price: {
        value: price.value,
        currency: price.currency,
      },
    },
    product: productCtx,
    configurableOptions: item.configurable_options?.map((option) => ({
      id: option.id,
      optionLabel: option?.option_label,
      valueId: option?.value_id,
      valueLabel: option?.value_label,
    })),
    quantity: item.quantity,
  };
}

export function mapCartToMSE(cart, source) {
  // Calculation for live search.
  const subtotalWithDiscountIncludingTax = parseFloat(
    (cart.prices?.subtotal_including_tax?.value - (cart.prices?.discount?.amount?.value ?? 0)).toFixed(2),
  );

  return {
    id: cart.id,
    items: cart.items.map(mapCartItem),
    prices: {
      subtotalExcludingTax: {
        value: cart.prices?.subtotal_with_discount_excluding_tax?.value,
        currency: cart.prices?.subtotal_with_discount_excluding_tax?.currency,
      },
      subtotalIncludingTax: {
        value: subtotalWithDiscountIncludingTax,
        currency: cart.prices?.subtotal_including_tax?.currency,
      },
    },
    totalQuantity: cart.total_quantity,
    source,
  };
}

export const pushCartToAdobeDataLayer = (cart, source) => {
  if (!window.adobeDataLayer?.push) return;

  const mseCart = mapCartToMSE(cart, source);
  const mseChangedItems = cart.items.map(mapCartItem);

  window.adobeDataLayer.push((dl) => {
    dl.push({ shoppingCartContext: mseCart });
    dl.push({ changedProductsContext: { items: mseChangedItems } });
    dl.push({ event: 'add-to-cart', eventInfo: { ...dl.getState() } });
  });
};

export const sendAddToCartCompletedEvent = () => {
  const event = new Event('havertys.cif.add-to-cart-complete');
  document.dispatchEvent(event);
};
