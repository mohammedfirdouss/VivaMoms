
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const OfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');
      
      // Simulate sync process
      setTimeout(() => {
        setSyncStatus('success');
        toast({
          title: "Connected",
          description: "Data synchronized successfully",
        });
        setTimeout(() => setSyncStatus('idle'), 3000);
      }, 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('idle');
      toast({
        title: "Offline Mode",
        description: "Working offline. Data will sync when connected.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return isOnline ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      {getSyncIcon()}
      <span className={isOnline ? 'text-green-600' : 'text-gray-500'}>
        {isOnline ? (syncStatus === 'syncing' ? 'Syncing...' : 'Online') : 'Offline'}
      </span>
    </div>
  );
};

export default OfflineSync;
