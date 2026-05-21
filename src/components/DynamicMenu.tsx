import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useMenuItems } from '@/hooks/useMenuItems';

interface DynamicMenuProps {
  type?: 'main' | 'footer' | 'social';
  className?: string;
  itemClassName?: string;
  subMenuClassName?: string;
}

export function DynamicMenu({
  type = 'main',
  className = '',
  itemClassName = '',
  subMenuClassName = ''
}: DynamicMenuProps) {
  const { data: allMenuItems = [], isLoading } = useMenuItems();

  // Organiser les menus par parent
  const menuTree = useMemo(() => {
    const menuItems = allMenuItems.filter(
      (item: unknown) => item.is_active && item.menu_type === type
    );

    // Obtenir les menus racine (sans parent)
    const rootItems = menuItems.filter((item: unknown) => !item.parent_id);

    // Associer les enfants à leurs parents
    return rootItems.map((item: unknown) => ({
      ...item,
      children: menuItems.filter((child: unknown) => child.parent_id === item.id)
    })).sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0));
  }, [allMenuItems, type]);

  if (isLoading) {
    return <div>Chargement du menu...</div>;
  }

  if (menuTree.length === 0) {
    return null;
  }

  const renderLink = (item: unknown) => {
    const linkClass = itemClassName || 'px-3 py-2 hover:bg-gray-100 rounded block';

    if (item.url?.startsWith('/')) {
      return (
        <Link to={item.url} target={item.target} className={linkClass}>
          {item.icon && <span className="mr-2">{item.icon}</span>}
          {item.label || item.title}
        </Link>);

    } else {
      return (
        <a href={item.url} target={item.target} className={linkClass}>
          {item.icon && <span className="mr-2">{item.icon}</span>}
          {item.label || item.title}
        </a>);

    }
  };

  return (
    <nav className={className}>
      <ul className="flex flex-col gap-0">
        {menuTree.map((item: unknown) =>
        <li key={item.id} className="relative group">
            {renderLink(item)}
            
            {/* Sous-menus */}
            {item.children && item.children.length > 0 &&
          <ul className={`${subMenuClassName || 'hidden group-hover:block absolute left-0 top-full mt-0 bg-white border border-gray-200 rounded shadow-lg min-w-max'}`}>
                {item.children.
            sort((a: unknown, b: unknown) => (a.menu_order || 0) - (b.menu_order || 0)).
            map((child: unknown) =>
            <li key={child.id}>
                      {renderLink(child)}
                    </li>
            )}
              </ul>
          }
          </li>
        )}
      </ul>
    </nav>);

}