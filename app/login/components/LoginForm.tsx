'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/providers/SupabaseAuthProvider'
import { Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const LoginForm = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const { signInWithEmail, user } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    try {
      const error = await signInWithEmail(email, password)
      if (error) {
        setError(error)
      }
    } catch (error) {
      console.log('Hubo un error!')
    }
  }

  // Check if there is a user
  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user])

  return (
    <div className='flex items-center justify-center w-full h-full px-8'>
      <div className='w-full max-w-lg'>
        {/* Text */}
        <div>
          <h1 className='text-4xl font-bold'>Iniciar Sesión</h1>
          <p className='mt-2 text-neutral-600'>
            Bienvenido a{' '}
            <strong className='font-semibold text-neutral-800'>Exa App</strong>.
            Ingresa tu dirección de correo y usuario.
          </p>
        </div>

        {/* Separator */}
        <div className='flex justify-center items-center my-8'>
          <Separator /> <span className='mx-6'>OR</span> <Separator />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Inputs container */}
          <div className='space-y-6'>
            <div className='space-y-2'>
              <Label>Correo</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className='space-y-2'>
              <Label>Contraseña</Label>
              <Input
                value={password}
                type='password'
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Error */}
          {error && <p className='mt-4 text-red-500'>{error}</p>}

          <Button className='flex items-center gap-2 mt-6 w-full'>
            Iniciar Sesión <Mail size={16} />
          </Button>
        </form>
      </div>
    </div>
  )
}

export default LoginForm
