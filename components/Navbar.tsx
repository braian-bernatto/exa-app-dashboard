'use client'

import { useAuth } from '@/providers/SupabaseAuthProvider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LifeBuoy, LogOut, Trophy, User } from 'lucide-react'
import Link from 'next/link'
import MainNav from './MainNav'

const Navbar = () => {
  const { user, signOut } = useAuth()
  return (
    <div className='w-full border-b border-neutral-100'>
      {/* Container */}
      <div className='flex items-center justify-between w-full py-6 mx-auto max-w-7xl'>
        {/* Logo */}
        <Link href={'/'}>
          <div className='flex gap-2 items-center'>
            <span className='bg-gradient-to-r from-emerald-300 to-emerald-700 rounded-full p-2 flex items-center justify-center'>
              <Trophy className='text-white' size={30} />
            </span>
            <h1 className='hidden sm:flex text-xl font-semibold  items-center gap-2'>
              Exa App
            </h1>
          </div>
        </Link>

        {/* Links */}
        <MainNav className='mx-6' />

        {/* Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar>
              <AvatarImage
                src={
                  user?.avatar_url
                    ? user.avatar_url
                    : 'https://github.com/shadcn.png'
                }
              />
              <AvatarFallback className='w-full h-full flex justify-center items-center'>
                <User className='w-6 h-6' />
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel className='w-full flex flex-col items-center uppercase'>
              {user?.username}
              <span className='text-neutral-400 text-xs capitalize'>
                Mi cuenta
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className='w-4 h-4 mr-2' />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LifeBuoy className='w-4 h-4 mr-2' />
              <a
                href='https://wa.me/595983709234?text=Hola,%20tengo%20una%20consulta%20sobre%20ExaApp%E2%9A%BD'
                target='_blank'
              >
                Soporte
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut}>
              <LogOut className='w-4 h-4 mr-2' />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default Navbar
