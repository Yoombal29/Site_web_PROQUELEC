
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { menuItems, categories } from '../AdminSidebar';


interface AdminBreadcrumbsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminBreadcrumbs: React.FC<AdminBreadcrumbsProps> = ({ activeTab, onTabChange }) => {
  const currentItem = menuItems.find((item) => item.id === activeTab);

  if (!currentItem) return null;

  const categoryLabel = categories[currentItem.category];

  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center text-sm font-medium">
            <ol className="flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <button
            onClick={() => onTabChange('overview')}
            className="inline-flex items-center text-muted-foreground hover:text-proqblue transition-colors">
            
                        <Home className="mr-2 h-4 w-4" />
                        Admin
                    </button>
                </li>

                {categoryLabel && categoryLabel !== 'Principal' &&
        <li>
                        <div className="flex items-center">
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            <span className="ml-1 text-muted-foreground md:ml-2">
                                {categoryLabel}
                            </span>
                        </div>
                    </li>
        }

                {currentItem.id !== 'overview' &&
        <li aria-current="page">
                        <div className="flex items-center">
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            <span className="ml-1 text-proqblue font-bold md:ml-2">
                                {currentItem.label}
                            </span>
                        </div>
                    </li>
        }
            </ol>
        </nav>);

};