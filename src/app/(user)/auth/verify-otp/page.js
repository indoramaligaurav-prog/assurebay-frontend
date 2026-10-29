import React from 'react';

// guard
import AuthGuard from 'src/guards/auth';

//  components
import OTPMain from 'src/components/_main/auth/otp';

// Meta information
export const metadata = {
  title: 'Verify Your Email with wreeo | Confirm Your Account for Secure Shopping',
  description:
    'Complete the email verification process at wreeo to ensure a secure and personalized shopping experience. Confirm your account and gain access to exclusive features. Shop confidently with a verified email. Verify now!',
  applicationName: 'wreeo',
  authors: 'wreeo',
  keywords: 'ecommerce, wreeo, Commerce, VerifyEmail wreeo, VerifyEmail Page wreeo'
};
export default async function VerifyOTP() {
  return (
    <AuthGuard>
      <OTPMain />
    </AuthGuard>
  );
}
