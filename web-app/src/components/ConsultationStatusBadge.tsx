
import { Badge } from '@/components/ui/badge';
import { Clock, Play, CheckCircle, XCircle } from 'lucide-react';

interface ConsultationStatusBadgeProps {
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  className?: string;
}

const ConsultationStatusBadge = ({ status, className }: ConsultationStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          variant: 'secondary' as const,
          icon: Clock,
          label: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
        };
      case 'in_progress':
        return {
          variant: 'default' as const,
          icon: Play,
          label: 'In Progress',
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
        };
      case 'completed':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          label: 'Completed',
          className: 'bg-green-100 text-green-800 hover:bg-green-200'
        };
      case 'cancelled':
        return {
          variant: 'destructive' as const,
          icon: XCircle,
          label: 'Cancelled',
          className: 'bg-red-100 text-red-800 hover:bg-red-200'
        };
      default:
        return {
          variant: 'secondary' as const,
          icon: Clock,
          label: 'Unknown',
          className: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={`flex items-center space-x-1 ${config.className} ${className}`}
    >
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
};

export default ConsultationStatusBadge;
