/* eslint-disable import/no-cycle */
import { initializers } from '@dropins/tools/initializer.js';
import { initialize } from '@dropins/storefront-auth/api.js';
import { initializeDropin } from './index.js';
import { fetchPlaceholders } from '../aem.js';

await initializeDropin(async () => {
  const labels = await fetchPlaceholders();

  const langDefinitions = {
    default: {
      ...labels,
      Auth: {
        PasswordValidationMessage: {
          messageLengthPassword:
            'Your password must be a minimum of 10 characters containing at least one uppercase letter [A-Z], one lowercase letter [a-z], one numeric character [0-9], and one special character [!, $, #, etc.]',
        },
        ResetPasswordForm: {
          title: 'Recover Password',
          buttonPrimary: 'Submit',
          buttonSecondary: 'Cancel',
        },
        SignInForm: {
          title: 'Sign In or Create an Account',
          buttonPrimary: 'Sign in',
          buttonSecondary: 'Create an Account',
          buttonTertiary: 'Forgot password?',
        },
        SignUpForm: {
          title: 'Create an Account',
          buttonPrimary: 'Create account',
          buttonSecondary: 'Already have an account? Sign In',
          privacyPolicyDefaultText: 'I’ve read and accept the Terms of Use and Privacy Policy.',
          subscribedDefaultText: 'I would like to receive Havertys emails',
          keepMeLoggedText: 'Keep me logged in after account creation',
          failedCreateCustomerAddress: 'Failed to create customer addresses:',
          confirmPassword: {
            placeholder: 'Retype password',
            floatingLabel: 'Retype password',
            passwordMismatch: 'Passwords do not match. Please make sure both password fields are identical.',
          },
        },
        UpdatePasswordForm: {
          title: 'Update password',
          buttonPrimary: 'Update password',
        },
        FormText: {
          requiredFieldError: 'This is a required field.',
          numericError: 'Only numeric values are allowed.',
          alphaNumWithSpacesError: 'Only alphanumeric characters and spaces are allowed.',
          alphaNumericError: 'Only alphanumeric characters are allowed.',
          alphaError: 'Only alphabetic characters are allowed.',
          emailError: 'Please enter a valid email address.',
          dateError: 'Please enter a valid date.',
          dateLengthError: 'Date must be between {min} and {max}.',
          dateMaxError: 'Date must be less than or equal to {max}.',
          dateMinError: 'Date must be greater than or equal to {min}.',
          urlError: 'Please enter a valid URL, e.g., https://www.website.com.',
          lengthTextError: 'Invalid zip code',
        },
        EmailConfirmationForm: {
          title: 'Verify your email address',
          subtitle: 'We`ve sent an email to',
          mainText:
            'Check your inbox and click on the link we just send you to confirm your email address and activate your account.',
          buttonSecondary: 'Resend email',
          buttonPrimary: 'Close',
          accountConfirmMessage: 'Account confirmed',
          accountConfirmationEmailSuccessMessage:
            'Congratulations! Your account at {email} email has been successfully confirmed.',
        },
        Notification: {
          errorNotification:
            'Your password update failed due to validation errors. Please check your information and try again.',
          updatePasswordMessage: 'The password has been updated.',
          updatePasswordActionMessage: 'Sign in',
          successPasswordResetEmailNotification:
            'If there is an account associated with {email} you will receive an email with a link to reset your password.',
          resendEmailNotification: {
            informationText: 'This account is not confirmed.',
            buttonText: 'Resend confirmation email',
          },
          emailConfirmationMessage: 'Please check your email for confirmation link.',
          technicalErrors: {
            technicalErrorSendEmail:
              'A technical error occurred while trying to send the email. Please try again later.',
          },
        },
        SuccessNotification: {
          headingText: 'Welcome!',
          messageText: 'We are glad to see you!',
          primaryButtonText: 'Continue shopping',
          secondaryButtonText: 'Logout',
        },
        Api: {
          customerTokenErrorMessage:
            'Unable to log in. Please try again later or contact support if the issue persists.',
        },
        InputPassword: {
          placeholder: 'Password',
          floatingLabel: 'Password',
        },
      },
    },
  };

  return initializers.mountImmediately(initialize, { langDefinitions });
})();
