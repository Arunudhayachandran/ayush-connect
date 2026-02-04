import { cn } from "@/lib/utils";
import { AYUSH_SERVICES, type AyushServiceType } from "@/lib/constants";

interface ServiceBadgeProps {
  serviceType: AyushServiceType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function ServiceBadge({ 
  serviceType, 
  size = 'md', 
  showIcon = true,
  className 
}: ServiceBadgeProps) {
  const service = AYUSH_SERVICES.find(s => s.id === serviceType);
  if (!service) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors",
        `badge-${serviceType}`,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <span className="text-base">{service.icon}</span>}
      <span>{service.name}</span>
    </span>
  );
}
