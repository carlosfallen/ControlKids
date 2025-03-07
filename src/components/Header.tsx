import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface HeaderProps {
  icon: LucideIcon;
  title: string;
}

export function Header({ icon: Icon, title }: HeaderProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 backdrop-blur-lg">
      <div className="border-b border-gray-200 bg-white/75 px-4 dark:border-gray-800 dark:bg-gray-900/75">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}