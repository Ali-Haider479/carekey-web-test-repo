import ResetPassword from '@/views/pages/auth/ResetPassword'

// Define the params type
interface ResetPasswordPageParams {
  lang: string
  token: string
}

// Handle params as a Promise (if needed)
export default async function ResetPasswordPage({ params }: { params: Promise<ResetPasswordPageParams> }) {
  const resolvedParams = await params // Resolve the Promise
  const { lang, token } = resolvedParams

  return <ResetPassword token={token} lang={lang} />
}
