import { Platform } from 'react-native';

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Format date to a readable string
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format time to a readable string
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format date and time to a readable string
export const formatDateTime = (dateString: string): string => {
  return `${formatDate(dateString)} ${formatTime(dateString)}`;
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth: string): number => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Calculate estimated delivery date from last menstrual period
export const calculateEDD = (lmpString: string): string => {
  const lmp = new Date(lmpString);
  const edd = new Date(lmp);
  edd.setDate(lmp.getDate() + 280); // 40 weeks
  
  return edd.toISOString().split('T')[0];
};

// Check if the app is running on web
export const isWeb = Platform.OS === 'web';

// Format blood pressure value for display
export const formatBloodPressure = (value: any): string => {
  if (typeof value === 'object' && value.systolic && value.diastolic) {
    return `${value.systolic}/${value.diastolic}`;
  }
  return 'N/A';
};

// Format temperature value for display
export const formatTemperature = (value: string | number): string => {
  if (typeof value === 'string') {
    return `${value}°C`;
  } else if (typeof value === 'number') {
    return `${value.toFixed(1)}°C`;
  }
  return 'N/A';
};

// Format heart rate value for display
export const formatHeartRate = (value: string | number): string => {
  if (typeof value === 'string' || typeof value === 'number') {
    return `${value} bpm`;
  }
  return 'N/A';
};

// Format blood oxygen value for display
export const formatBloodOxygen = (value: string | number): string => {
  if (typeof value === 'string' || typeof value === 'number') {
    return `${value}%`;
  }
  return 'N/A';
};

// Format blood sugar value for display
export const formatBloodSugar = (value: string | number): string => {
  if (typeof value === 'string' || typeof value === 'number') {
    return `${value} mg/dL`;
  }
  return 'N/A';
};

// Format test result for display
export const formatTestResult = (result: string): string => {
  switch (result) {
    case 'positive':
      return 'Positive';
    case 'negative':
      return 'Negative';
    case 'indeterminate':
      return 'Indeterminate';
    default:
      return 'N/A';
  }
};