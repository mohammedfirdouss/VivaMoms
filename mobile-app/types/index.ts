export type Patient = {
    id: string;
    name: string;
    village: string;
    age?: number;
    dateOfBirth?: string;
    lastMenstrualPeriod?: string;
    estimatedDeliveryDate?: string;
    contactInfo?: string;
    emergencyContact?: string;
    medicalHistory?: string;
    previousPregnancies?: string;
    createdAt: string;
    updatedAt: string;
    syncStatus: 'pending' | 'synced' | 'error';
  };
  
  export type VitalSign = {
    id: string;
    encounterId: string;
    patientId: string;
    type: 'temperature' | 'bloodPressure' | 'heartRate' | 'bloodOxygen' | 'bloodSugar';
    value: string | { systolic: number; diastolic: number };
    timestamp: string;
    syncStatus: 'pending' | 'synced' | 'error';
  };
  
  export type TestResult = {
    id: string;
    encounterId: string;
    patientId: string;
    type: 'malaria' | 'uti' | 'other';
    result: 'positive' | 'negative' | 'indeterminate';
    notes?: string;
    timestamp: string;
    syncStatus: 'pending' | 'synced' | 'error';
  };
  
  export type Encounter = {
    id: string;
    patientId: string;
    date: string;
    notes?: string;
    vitalSigns: VitalSign[];
    testResults: TestResult[];
    consultationRequested: boolean;
    syncStatus: 'pending' | 'synced' | 'error';
  };
  
  export type Message = {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: string;
    status: 'sent' | 'delivered' | 'read' | 'error';
    relatedEncounterId?: string;
    syncStatus: 'pending' | 'synced' | 'error';
  };
  
  export type User = {
    id: string;
    name: string;
    role: 'chw' | 'doctor' | 'admin';
    village?: string;
    contactInfo?: string;
  };