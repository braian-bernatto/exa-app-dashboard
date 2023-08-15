'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

const MainNav = ({
  className,
  ...props
}: React.HtmlHTMLAttributes<HTMLElement>) => {
  const pathname = usePathname()
  const params = useParams()
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
        'flex flex-wrap items-center space-x-4 lg:space-x-6',
        className
      )}
    >
      {routes.map(route => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            route.active
              ? 'text-black dark:text-white'
              : 'text-muted-foreground'
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  )
}

export default MainNav
