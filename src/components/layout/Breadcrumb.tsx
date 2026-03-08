import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { BreadcrumbItem } from '../../types';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  if (!items || items.length === 0) return null;
  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const Icon = item.icon;
        return (
          <Fragment key={i}>
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-text-tertiary" />}
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors"
              >
                {Icon && <Icon size={16} />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className={`flex items-center gap-1.5 ${isLast ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
                {Icon && <Icon size={16} />}
                <span>{item.label}</span>
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
