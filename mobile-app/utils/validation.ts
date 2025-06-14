import { Platform } from 'react-native';   

// Validation utilities for form inputs

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Basic phone number validation (Nigerian format)
  const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateDate = (dateString: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

export const validateAge = (age: string): boolean => {
  const ageNum = parseInt(age, 10);
  return !isNaN(ageNum) && ageNum >= 0 && ageNum <= 150;
};

export const validateVitalSign = (type: string, value: string | object): boolean => {
  switch (type) {
    case 'temperature':
      const temp = parseFloat(value as string);
      return !isNaN(temp) && temp >= 30 && temp <= 45;
    
    case 'heartRate':
      const hr = parseInt(value as string, 10);
      return !isNaN(hr) && hr >= 30 && hr <= 250;
    
    case 'bloodOxygen':
      const spo2 = parseInt(value as string, 10);
      return !isNaN(spo2) && spo2 >= 70 && spo2 <= 100;
    
    case 'bloodSugar':
      const bs = parseFloat(value as string);
      return !isNaN(bs) && bs >= 20 && bs <= 600;
    
    case 'bloodPressure':
      if (typeof value === 'object' && value !== null) {
        const bp = value as { systolic: number; diastolic: number };
        return (
          !isNaN(bp.systolic) && !isNaN(bp.diastolic) &&
          bp.systolic >= 60 && bp.systolic <= 250 &&
          bp.diastolic >= 30 && bp.diastolic <= 150 &&
          bp.systolic > bp.diastolic
        );
      }
      return false;
    
    default:
      return false;
  }
};

export const sanitizeInput = (input: string): string => {
  // Remove potentially harmful characters
  return input.replace(/[<>\"']/g, '').trim();
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.trim().length >= minLength;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.trim().length <= maxLength;
};