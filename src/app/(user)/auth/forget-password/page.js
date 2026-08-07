// guard
import GuestGuard from '@/guards/guest';
//  components
import ForgetPasswordMain from '@/components/_main/auth/forget-password';

// Meta information
export const metadata = {
  title: 'Forgot Password | assuredbay - Reset Your Password and Regain Access',
  description:
    'Forgot your password? Reset it with assuredbay for seamless access to your account. Regain control and enjoy hassle-free browsing, secure transactions, and personalized experiences. Get back on track with assuredbay now!',
  applicationName: 'assuredbay',
  authors: 'assuredbay',
  keywords:
    'forgot password, assuredbay, reset password, assuredbay password recovery, password reset, password recovery, account access, regain access, secure login, secure access, hassle-free login, personalized login, password recovery tool, forgotten password'
};

export default function ForgetPassword() {
  return (
    <GuestGuard>
      <ForgetPasswordMain />
    </GuestGuard>
  );
}
