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
import { Github, LifeBuoy, LogOut, User } from 'lucide-react'

const Navbar = () => {
  const { user, signOut } = useAuth()
  return (
    <nav className='w-full border-b border-neutral-100'>
      {/* Container */}
      <div className='flex items-center justify-between w-full py-6 mx-auto max-w-7xl'>
        {/* Logo */}
        <div className='text-lg font-bold'>EXA APP</div>

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
              <AvatarFallback>{user?.username}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
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
              <Github className='w-4 h-4 mr-2' />
              <span>GitHub</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LifeBuoy className='w-4 h-4 mr-2' />
              <span>Soporte</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut}>
              <LogOut className='w-4 h-4 mr-2' />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}

export default Navbar
