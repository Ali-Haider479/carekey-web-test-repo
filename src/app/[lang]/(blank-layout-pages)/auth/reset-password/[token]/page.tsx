// Component Imports
import ResetPassword from '@/views/pages/auth/ResetPassword'

export default function ResetPasswordPage({ params }: { params: { lang: string; token: string } }) {
  const { lang, token } = params // Extract lang and token from route params

  return <ResetPassword token={token} lang={lang} />
}
