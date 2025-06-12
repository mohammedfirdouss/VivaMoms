
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Patient {
  id: string;
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export const usePatients = (doctorId?: string) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPatients = async () => {
    if (!doctorId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPatient = async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([{ ...patientData, created_by: doctorId }])
        .select()
        .single();

      if (error) throw error;

      setPatients(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Patient created successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating patient:', error);
      toast({
        title: "Error",
        description: "Failed to create patient",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPatients(prev => prev.map(p => p.id === id ? data : p));
      toast({
        title: "Success",
        description: "Patient updated successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating patient:', error);
      toast({
        title: "Error",
        description: "Failed to update patient",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [doctorId]);

  return {
    patients,
    loading,
    createPatient,
    updatePatient,
    refetch: fetchPatients
  };
};
