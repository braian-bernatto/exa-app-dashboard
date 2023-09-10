'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const MainNav = ({
  className,
  ...props
}: React.HtmlHTMLAttributes<HTMLElement>) => {
  const pathname = usePathname()
  const routes = [
    {
      href: `/exas`,
      label: 'Exas',
      active: pathname === `/exas`
    },
    {
      href: `/torneos`,
      label: 'Torneos',
      active: pathname === `/torneos`
    },
    {
      href: `/equipos`,
      label: 'Equipos',
      active: pathname === `/equipos`
    },
    {
      href: `/jugadores`,
      label: 'Jugadores',
      active: pathname === `/jugadores`
    },
    {
      href: `/fixtures`,
      label: 'Fixtures',
      active: pathname === `/fixtures`
    }
  ]
  return (
    <nav
      className={cn(
        'flex items-center gap-4 w-[400px] sm:w-auto overflow-y-auto px-2',
        className
      )}>
      {routes.map(route => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            route.active
              ? 'text-black dark:text-white'
              : 'text-muted-foreground'
          )}>
          {route.label}
        </Link>
      ))}
    </nav>
  )
}

export default MainNav
