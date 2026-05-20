/* GraphQL Error Codes and Messages */
export const ErrorCodes = {
  ACCOUNT_BLOCKED_AND_NEEDS_VERIFICATION_IN_STORE: 'ACCOUNT_BLOCKED_AND_NEEDS_VERIFICATION_IN_STORE',
  ACCOUNT_NOT_AVAILABLE_FOR_USE: 'ACCOUNT_NOT_AVAILABLE_FOR_USE',
  ACCOUNT_ZIPCODE_MISMATCH: 'ACCOUNT_ZIPCODE_MISMATCH',
  ADDRESS_NOT_FOUND: 'ADDRESS_NOT_FOUND',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  BEDDING_WARRANTY_ITEM_REQUIRED: 'BEDDING_WARRANTY_ITEM_REQUIRED',
  BILLING_ADDRESS_DOES_NOT_MATCH_SUPPLIED_BILLING_ADDRESS: 'BILLING_ADDRESS_DOES_NOT_MATCH_SUPPLIED_BILLING_ADDRESS',
  BILLING_ADDRESS_DOES_NOT_MATCH_SUPPLIED_DELIVERY_ADDRESS: 'BILLING_ADDRESS_DOES_NOT_MATCH_SUPPLIED_DELIVERY_ADDRESS',
  CART_ITEMS_NOT_FOUND: 'CART_ITEMS_NOT_FOUND',
  CANNOT_ADD_LOCKED_WORKSHEET: 'CANNOT_ADD_LOCKED_WORKSHEET',
  CANNOT_DELETE_LOCKED_ITEM: 'CANNOT_DELETE_LOCKED_ITEM',
  CANNOT_DELIVER_TO_ZIP_CODE: 'CANNOT_DELIVER_TO_ZIP_CODE',
  CID_NOT_FOUND: 'CID_NOT_FOUND',
  CREDIT_ACCOUNT_NOT_FOUND: 'CREDIT_ACCOUNT_NOT_FOUND',
  CREDIT_ACCOUNT_NUMBER_INVALID: 'CREDIT_ACCOUNT_NUMBER_INVALID',
  CREDIT_CARD_DECLINED: 'CREDIT_CARD_DECLINED',
  CREDIT_CARD_DECLINED_SPLIT: 'CREDIT_CARD_DECLINED_SPLIT',
  CREDIT_CARD_NOT_PROCESSED: 'CREDIT_CARD_NOT_PROCESSED',
  CUSTOMER_INFORMATION_ON_WORKSHEET_MUST_MATCH_TO_CART: 'CUSTOMER_INFORMATION_ON_WORKSHEET_MUST_MATCH_TO_CART',
  DEFAULT: 'DEFAULT',
  DEFAULT_PROTECTION: 'DEFAULT_PROTECTION',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  DUPLICATE_EMAIL_FOR_CID: 'DUPLICATE_EMAIL_FOR_CID',
  DUPLICATE_EMAIL_ON_SECONDARY: 'DUPLICATE_EMAIL_ON_SECONDARY',
  DELIVERY_ADDRESS_NOT_FOUND: 'DELIVERY_ADDRESS_NOT_FOUND',
  DELIVERY_DATE_IS_NO_LONGER_AVAILABLE: 'DELIVERY_DATE_IS_NO_LONGER_AVAILABLE',
  DELIVERY_NAME_NOT_FOUND: 'DELIVERY_NAME_NOT_FOUND',
  EMAIL_EXISTS_FOR_DIFFERENT_CID: 'EMAIL_EXISTS_FOR_DIFFERENT_CID',
  EMAIL_EXISTS_FOR_SAME_CID: 'EMAIL_EXISTS_FOR_SAME_CID',
  EMAIL_NOT_FOUND: 'EMAIL_NOT_FOUND',
  EMAIL_NOT_THERE_TO_UPDATE: 'EMAIL_NOT_THERE_TO_UPDATE',
  FAILED_TO_ADD_ITEM: 'FAILED_TO_ADD_ITEM',
  FAILED_TO_ADD_TO_CART: 'FAILED_TO_ADD_TO_CART',
  FAILED_TO_DELETE_ITEM: 'FAILED_TO_DELETE_ITEM',
  FAILED_TO_UPDATE_ITEM: 'FAILED_TO_UPDATE_ITEM',
  FAILED_TO_UPDATE_PROTECTION: 'FAILED_TO_UPDATE_PROTECTION',
  FLOOR_SAMPLE_NOT_AVAILABLE: 'FLOOR_SAMPLE_NOT_AVAILABLE',
  FLOOR_SAMPLE_NOT_AVAILABLE_FOR_DELIVERY_AT_LOCATION: 'FLOOR_SAMPLE_NOT_AVAILABLE_FOR_DELIVERY_AT_LOCATION',
  FLOOR_SAMPLE_NOT_AVAILABLE_FOR_PICKUP_AT_LOCATION: 'FLOOR_SAMPLE_NOT_AVAILABLE_FOR_PICKUP_AT_LOCATION',
  HVT_BACKEND_EXCEPTION: 'BACKEND_EXCEPTION',
  INPUT_ERROR: 'INPUT_ERROR',
  INVALID_CARD_TOKEN: 'INVALID_CARD_TOKEN',
  INVALID_CART_ID: 'INVALID_CART_ID',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_CHARGE_AMOUNT: 'INVALID_CHARGE_AMOUNT',
  INVALID_CVV: 'INVALID_CVV',
  INVALID_FAVORITES_ID: 'INVALID_FAVORITES_ID',
  INVALID_ITEM_SEQUENCE: 'INVALID_ITEM_SEQUENCE',
  INVALID_PAY_TOKEN: 'INVALID_PAY_TOKEN',
  INVALID_QUANTITY: 'INVALID_QUANTITY',
  INVALID_SEQUENCE_NUMBER: 'INVALID_SEQUENCE_NUMBER',
  INVALID_SKU: 'INVALID_SKU',
  INVALID_WORKSHEET_ID: 'INVALID_WORKSHEET_ID',
  INVALID_ZIP_CODE: 'INVALID_ZIP_CODE',
  ITEMS_ALREADY_IN_CART: 'ITEMS_ALREADY_IN_CART',
  ITEM_NOT_AVAILABLE: 'ITEM_NOT_AVAILABLE',
  ITEM_NOT_AVAILABLE_FOR_SHIPPING: 'ITEM_NOT_AVAILABLE_FOR_SHIPPING',
  ITEM_NOT_ELIGIBLE_FOR_PROTECTION: 'ITEM_NOT_ELIGIBLE_FOR_PROTECTION',
  ITEM_NOT_ELIGIBLE_FOR_WARRANTY: 'ITEM_NOT_ELIGIBLE_FOR_WARRANTY',
  ITEM_NOT_FOUND: 'ITEM_NOT_FOUND',
  ITEM_NOT_STOCKED: 'ITEM_NOT_STOCKED',
  MAX_ITEMS_EXCEEDED: 'MAX_ITEMS_EXCEEDED',
  MISSING_WARRANTY_ITEM_SKU: 'MISSING_WARRANTY_ITEM_SKU',
  NO_SUCH_ENTITY: 'NO_SUCH_ENTITY',
  NOT_ENOUGH_INVENTORY_FOR_QTY: 'NOT_ENOUGH_INVENTORY_FOR_QTY',
  PAY_AMT_NOT_EQUAL_TO_SALE_AMT: 'PAY_AMT_NOT_EQUAL_TO_SALE_AMT',
  PROMOTION_CODE_DELIVERY_TYPE: 'PROMOTION_CODE_DELIVERY_TYPE',
  PROMOTION_CODE_DOES_NOT_APPLY_ITEMS: 'PROMOTION_CODE_DOES_NOT_APPLY_ITEMS',
  PROMOTION_CODE_EXPIRED: 'PROMOTION_CODE_EXPIRED',
  PROMOTION_CODE_INVALID: 'PROMOTION_CODE_INVALID',
  PROMOTION_CODE_MINIMUM_DOLLARS: 'PROMOTION_CODE_MINIMUM_DOLLARS',
  PROMOTION_CODE_MINIMUM_QUANTITY: 'PROMOTION_CODE_MINIMUM_QUANTITY',
  PROMOTION_CODE_MINIMUM_REQUIREMENTS: 'PROMOTION_CODE_MINIMUM_REQUIREMENTS',
  SALE_ALREADY_CREATED: 'SALE_ALREADY_CREATED',
  SALES_TAX_NOT_CALCULATED_FOR_ADDRESS: 'SALES_TAX_NOT_CALCULATED_FOR_ADDRESS',
  SYNCHRONY_ADDRESS_INVALID: 'SYNCHRONY_ADDRESS_INVALID',
  SYNCHRONY_DECLINED: 'SYNCHRONY_DECLINED',
  SYNCHRONY_MINIMUM_DOWN_PAYMENT_AMOUNT_NOT_MET: 'SYNCHRONY_MINIMUM_DOWN_PAYMENT_AMOUNT_NOT_MET',
  SYNCHRONY_MINIMUM_SALE_AMOUNT_NOT_MET: 'SYNCHRONY_MINIMUM_SALE_AMOUNT_NOT_MET',
  TIMED_OUT: 'TIMED_OUT',
  UNABLE_TO_FIND_ITEM: 'UNABLE_TO_FIND_ITEM',
  UNABLE_TO_FIND_SKU: 'UNABLE_TO_FIND_SKU',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  UNKNOWN_GRAPHQL_ERROR: 'UNKNOWN_GRAPHQL_ERROR',
  WARRANTY_PROTECTION_DOLLAR_LIMIT_EXCEEDED: 'WARRANTY_PROTECTION_DOLLAR_LIMIT_EXCEEDED',
  WORKSHEET_IS_UNLOCKED: 'WORKSHEET_IS_UNLOCKED',
  WORKSHEET_TYPE_INVALID_FOR_ADDING_TO_CART: 'WORKSHEET_TYPE_INVALID_FOR_ADDING_TO_CART',
  WRONG_TYPE_OF_PROTECTION: 'WRONG_TYPE_OF_PROTECTION',
  ZIP_CODE_INVALID: 'ZIP_CODE_INVALID',
};

export const ErrorMessages = {
  [ErrorCodes.ACCOUNT_BLOCKED_AND_NEEDS_VERIFICATION_IN_STORE]: 'Account blocked and needs verification in store',
  [ErrorCodes.ACCOUNT_NOT_AVAILABLE_FOR_USE]: 'Account not available for use',
  [ErrorCodes.ACCOUNT_ZIPCODE_MISMATCH]: 'Account zipcode mismatch',
  [ErrorCodes.ADDRESS_NOT_FOUND]: 'Address not found',
  [ErrorCodes.AUTHORIZATION_ERROR]: 'Authorization error occurred.',
  [ErrorCodes.BEDDING_WARRANTY_ITEM_REQUIRED]: 'An item on your cart requires a bedding warranty to be selected.',
  [ErrorCodes.BILLING_ADDRESS_DOES_NOT_MATCH_SUPPLIED_BILLING_ADDRESS]:
    'Billing address does not match supplied billing address',
  [ErrorCodes.BILLING_ADDRESS_DOES_NOT_MATCH_SUPPLIED_DELIVERY_ADDRESS]:
    'Billing address does not match supplied delivery address',
  [ErrorCodes.CART_ITEMS_NOT_FOUND]: 'Cart items not found',
  [ErrorCodes.CANNOT_ADD_LOCKED_WORKSHEET]: 'Cannot add locked worksheet',
  [ErrorCodes.CANNOT_DELETE_LOCKED_ITEM]: 'Cannot delete locked item',
  [ErrorCodes.CANNOT_DELIVER_TO_ZIP_CODE]: 'We are unable to deliver to the selected zip code area.',
  [ErrorCodes.CID_NOT_FOUND]: 'CID not found',
  [ErrorCodes.CREDIT_ACCOUNT_NOT_FOUND]:
    'Credit account not found. Please verify your payment information and try again.',
  [ErrorCodes.CREDIT_ACCOUNT_NUMBER_INVALID]:
    'Credit account information was not valid. Please verify your payment information and try again.',
  [ErrorCodes.CREDIT_CARD_DECLINED]:
    'Payment declined. This may be due to a security limit set by your card provider often triggered by a major purchase. We recommend you reach out to them to discuss or try another payment method.',
  [ErrorCodes.CREDIT_CARD_DECLINED_SPLIT]: 'The credit card payment was declined.',
  [ErrorCodes.CREDIT_CARD_NOT_PROCESSED]: 'The credit card payment was unable to be processed.',
  [ErrorCodes.CUSTOMER_INFORMATION_ON_WORKSHEET_MUST_MATCH_TO_CART]:
    'Customer information on worksheet must match to cart',
  [ErrorCodes.DEFAULT]: 'There was a problem with your request. Please try again another time.',
  [ErrorCodes.DEFAULT_PROTECTION]:
    'We have encountered an error submitting your changes. Please try again another time.',
  [ErrorCodes.DUPLICATE_EMAIL]: 'The email you entered already exists.',
  [ErrorCodes.DUPLICATE_EMAIL_FOR_CID]: 'The email you entered already exists for this account.',
  [ErrorCodes.DUPLICATE_EMAIL_ON_SECONDARY]: 'The email you entered already exists.',
  [ErrorCodes.DELIVERY_ADDRESS_NOT_FOUND]: 'Delivery address not found',
  [ErrorCodes.DELIVERY_DATE_IS_NO_LONGER_AVAILABLE]:
    'Your selected delivery date is no longer available. Please select another delivery date.',
  [ErrorCodes.DELIVERY_NAME_NOT_FOUND]: 'Delivery name not found',
  [ErrorCodes.EMAIL_EXISTS_FOR_DIFFERENT_CID]: 'The email you entered already exists.',
  [ErrorCodes.EMAIL_EXISTS_FOR_SAME_CID]: 'The email you entered already exists for this account.',
  [ErrorCodes.EMAIL_NOT_FOUND]: 'The email you entered was not found in our system.',
  [ErrorCodes.EMAIL_NOT_THERE_TO_UPDATE]: 'The email you are trying to edit does not exist.',
  [ErrorCodes.FAILED_TO_ADD_ITEM]: 'Failed to add item',
  [ErrorCodes.FAILED_TO_ADD_TO_CART]: 'Failed to add to cart',
  [ErrorCodes.FAILED_TO_DELETE_ITEM]: 'Failed to delete item',
  [ErrorCodes.FAILED_TO_UPDATE_ITEM]: 'Failed to update item',
  [ErrorCodes.FAILED_TO_UPDATE_PROTECTION]: "We're sorry, we were unable to add protection. Please try again.",
  [ErrorCodes.FLOOR_SAMPLE_NOT_AVAILABLE]:
    'One or more of your floor sample items are no longer available for purchase. Please contact the store for assistance.',
  [ErrorCodes.FLOOR_SAMPLE_NOT_AVAILABLE_FOR_DELIVERY_AT_LOCATION]:
    'The floor sample item on your cart is not available for delivery at your location.',
  [ErrorCodes.FLOOR_SAMPLE_NOT_AVAILABLE_FOR_PICKUP_AT_LOCATION]:
    'One or more of your floor sample items cannot be picked up at the location you selected.',
  [ErrorCodes.HVT_BACKEND_EXCEPTION]: 'Backend exception occurred.',
  [ErrorCodes.INPUT_ERROR]: 'Input error occurred.',
  [ErrorCodes.INVALID_CARD_TOKEN]: 'Invalid card token',
  [ErrorCodes.INVALID_CART_ID]: 'Invalid cart ID',
  [ErrorCodes.INVALID_EMAIL]: 'The email you entered is not valid.',
  [ErrorCodes.INVALID_CHARGE_AMOUNT]: 'Invalid charge amount',
  [ErrorCodes.INVALID_CVV]: 'Invalid CVV',
  [ErrorCodes.INVALID_FAVORITES_ID]: 'Invalid favorites ID',
  [ErrorCodes.INVALID_ITEM_SEQUENCE]: 'Invalid item sequence',
  [ErrorCodes.INVALID_PAY_TOKEN]: 'Invalid pay token',
  [ErrorCodes.INVALID_QUANTITY]: 'Invalid quantity',
  [ErrorCodes.INVALID_SEQUENCE_NUMBER]: 'Invalid sequence number',
  [ErrorCodes.INVALID_SKU]: 'Invalid SKU',
  [ErrorCodes.INVALID_WORKSHEET_ID]: 'Invalid worksheet ID',
  [ErrorCodes.INVALID_ZIP_CODE]: 'You are attempting to use an invalid zip code.',
  [ErrorCodes.ITEMS_ALREADY_IN_CART]: 'Items already in cart',
  [ErrorCodes.ITEM_NOT_AVAILABLE]: 'An item on your cart is not stocked and unavailable for purchase.',
  [ErrorCodes.ITEM_NOT_AVAILABLE_FOR_SHIPPING]:
    'An item on your cart is unavailable for shipping. Please select another delivery method.',
  [ErrorCodes.ITEM_NOT_ELIGIBLE_FOR_PROTECTION]: 'Item not eligible for protection.',
  [ErrorCodes.ITEM_NOT_ELIGIBLE_FOR_WARRANTY]: 'An item on your cart is not eligible for the selected warranty.',
  [ErrorCodes.ITEM_NOT_FOUND]: 'Item not found',
  [ErrorCodes.ITEM_NOT_STOCKED]: 'An item on your cart is not stocked and unavailable for purchase.',
  [ErrorCodes.MAX_ITEMS_EXCEEDED]: 'Your cart has exceeded the maximum number of allowable items.',
  [ErrorCodes.MISSING_WARRANTY_ITEM_SKU]: 'Missing warranty item SKU',
  [ErrorCodes.NO_SUCH_ENTITY]: 'No such entity',
  [ErrorCodes.NOT_ENOUGH_INVENTORY_FOR_QTY]: 'The quantity entered exceeds the quantity available.',
  [ErrorCodes.PAY_AMT_NOT_EQUAL_TO_SALE_AMT]:
    "There's been an update to your order total. Please refresh the page to continue.",
  [ErrorCodes.PROMOTION_CODE_DELIVERY_TYPE]:
    'The selected delivery method for the selected promotion code is unavailable.',
  [ErrorCodes.PROMOTION_CODE_DOES_NOT_APPLY_ITEMS]: 'The selected promotion code does not apply to items on the cart.',
  [ErrorCodes.PROMOTION_CODE_EXPIRED]: 'The selected promotion code has expired.',
  [ErrorCodes.PROMOTION_CODE_INVALID]: 'The selected promotion code is invalid.',
  [ErrorCodes.PROMOTION_CODE_MINIMUM_DOLLARS]: 'The selected promotion code requires a minimum purchase amount.',
  [ErrorCodes.PROMOTION_CODE_MINIMUM_QUANTITY]: 'The selected promotion code requires a minimum purchase quantity.',
  [ErrorCodes.PROMOTION_CODE_MINIMUM_REQUIREMENTS]: 'Minimum requirements for the selected promotion code are not met.',
  [ErrorCodes.SALE_ALREADY_CREATED]:
    'Your purchase has been completed. Please check your email for confirmation or contact customer service for assistance.',
  [ErrorCodes.SALES_TAX_NOT_CALCULATED_FOR_ADDRESS]:
    'Unable to calculate sales tax for this address. Please verify your information and try again.',
  [ErrorCodes.SYNCHRONY_ADDRESS_INVALID]: 'The billing address must match what is on file at Synchrony.',
  [ErrorCodes.SYNCHRONY_DECLINED]:
    'Your transaction was not successful, please call Synchrony Bank Customer service at 1-866-396-8254.',
  [ErrorCodes.SYNCHRONY_MINIMUM_DOWN_PAYMENT_AMOUNT_NOT_MET]:
    'The selected finance special offer requires a minimum credit card down payment.',
  [ErrorCodes.SYNCHRONY_MINIMUM_SALE_AMOUNT_NOT_MET]:
    'The minimum sale amount for this Synchrony finance promotion has not been met.',
  [ErrorCodes.TIMED_OUT]: 'Your request timed out. Please try your submission again.',
  [ErrorCodes.UNABLE_TO_FIND_ITEM]: 'Unable to find item',
  [ErrorCodes.UNABLE_TO_FIND_SKU]: 'Unable to find SKU',
  [ErrorCodes.UNKNOWN_ERROR]: 'An unknown error occurred.',
  [ErrorCodes.UNKNOWN_GRAPHQL_ERROR]: 'Unable to connect to server. Please try again later.',
  [ErrorCodes.WARRANTY_PROTECTION_DOLLAR_LIMIT_EXCEEDED]:
    'The amount of warranty protection available for purchase has been exceeded.',
  [ErrorCodes.WORKSHEET_IS_UNLOCKED]: 'Worksheet is unlocked',
  [ErrorCodes.WORKSHEET_TYPE_INVALID_FOR_ADDING_TO_CART]: 'Worksheet type invalid for adding to cart',
  [ErrorCodes.WRONG_TYPE_OF_PROTECTION]: 'Wrong type of protection.',
  [ErrorCodes.ZIP_CODE_INVALID]: 'You are attempting to use an invalid zip code.',
};

/* Get Error Message based on error message in error passed */
export const getErrorMessage = (error) => ErrorMessages?.[error.message];

/* Normalize & Throw GraphQL Errors */
export const handleErrors = (errors, defaultMessage = ErrorMessages[ErrorCodes.DEFAULT]) => {
  if (!errors) {
    return;
  }

  errors.forEach((error) => {
    const category = error?.extensions?.category;
    const { message } = error;
    const e = new Error(message);
    e.originalMessage = message;

    switch (category) {
      case 'graphql-no-such-entity':
        e.code = ErrorCodes.NO_SUCH_ENTITY;
        e.message = ErrorCodes.NO_SUCH_ENTITY;
        break;
      case 'graphql-authorization':
        e.code = ErrorCodes.AUTHORIZATION_ERROR;
        e.message = ErrorCodes.AUTHORIZATION_ERROR;
        break;
      case 'graphql-input':
        e.code = ErrorCodes.INPUT_ERROR;
        e.message = ErrorCodes.INPUT_ERROR;
        break;
      case 'havertys-backend-exception':
        e.code = ErrorCodes.HVT_BACKEND_EXCEPTION;
        break;
      default:
        e.code = ErrorCodes.UNKNOWN_GRAPHQL_ERROR;
        e.message = ErrorCodes.UNKNOWN_GRAPHQL_ERROR;
    }

    e.message = getErrorMessage(e) || defaultMessage;

    throw e;
  });
};
