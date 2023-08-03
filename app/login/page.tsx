import LoginForm from '@/app/login/components/LoginForm'

const LoginPage = () => {
  return (
    <div className='grid sm:grid-cols-2 w-full h-screen'>
      <LoginForm />
      <div className='bg-gradient-to-r from-emerald-300 to-emerald-700 border-l-2 border-emerald-500'></div>
    </div>
  )
}

export default LoginPage
