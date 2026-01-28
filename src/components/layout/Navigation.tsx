import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  FileText,
  Clock,
  History,
  BarChart3,
  Menu,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from './theme-toggle';

const navItems = [
  { path: '/', label: 'Emissões', icon: FileText },
  { path: '/pendencias', label: 'Pendências', icon: Clock },
  { path: '/compliance', label: 'Compliance', icon: ShieldCheck },
  { path: '/historico', label: 'Histórico', icon: History },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
];

export function Navigation() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Linha de destaque brutalista */}
      <div className="h-0.5 bg-blue-600 dark:bg-blue-400" aria-hidden="true" />
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              Interface Estruturação
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 transition-colors hover:text-foreground/80',
                  isActive ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div className="hidden md:flex items-center">
          <ThemeToggle />
        </div>

        {/* Mobile Navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden ml-auto">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[240px] sm:w-[300px]">
            <div className="flex items-center justify-between mt-4 mb-8">
              <span className="font-semibold">Menu</span>
              <ThemeToggle />
            </div>
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
