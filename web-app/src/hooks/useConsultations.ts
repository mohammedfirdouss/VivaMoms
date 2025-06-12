import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { withRetry, handleError } from '@/utils/errorHandling';
import { measureApiCall } from '@/utils/performance';

export interface Consultation {
  id: string;
  patient_id: string;
  doctor_id: string;
  chw_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority_level: number;
  chief_complaint: string;
  doctor_notes?: string;
  diagnosis?: string;
  treatment_plan?: string;
  created_at: string;
  patients: {
    id: string;
    patient_id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    phone?: string;
  };
  profiles: {
    first_name: string;
    last_name: string;
    location?: string;
  };
}

// Helper function to validate UUID format
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const useConsultations = (doctorId?: string) => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConsultations = async () => {
    if (!doctorId) {
      console.log('No doctorId provided');
      setLoading(false);
      return;
    }

    // Check if doctorId is a valid UUID before making the database call
    if (!isValidUUID(doctorId)) {
      console.log('Invalid UUID format for doctorId:', doctorId);
      setConsultations([]);
      setLoading(false);
      return;
    }

    try {
      await measureApiCall('fetch_consultations', async () => {
        await withRetry(async () => {
          const { data, error } = await supabase
            .from('consultations')
            .select(`
              *,
              patients:patient_id (
                id,
                patient_id,
                first_name,
                last_name,
                date_of_birth,
                phone
              ),
              profiles:chw_id (
                first_name,
                last_name,
                location
              )
            `)
            .eq('doctor_id', doctorId)
            .order('created_at', { ascending: false });

          if (error) {
            throw handleError(error, 'fetchConsultations');
          }

          // Type the data properly and filter out invalid entries
          const rawData = data as any[];
          const validConsultations = rawData.filter(consultation => {
            return consultation.patients && 
                   consultation.profiles && 
                   typeof consultation.patients === 'object' &&
                   typeof consultation.profiles === 'object' &&
                   !consultation.patients.error &&
                   !consultation.profiles.error;
          });
          
          setConsultations(validConsultations as Consultation[]);
        });
      });
    } catch (error) {
      const apiError = handleError(error, 'fetchConsultations');
      toast({
        title: "Error",
        description: apiError.message,
        variant: "destructive",
      });
      console.error('Error fetching consultations:', apiError);
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  const updateConsultationStatus = async (
    consultationId: string, 
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled',
    doctorNotes?: string,
    diagnosis?: string,
    treatmentPlan?: string
  ) => {
    try {
      await measureApiCall('update_consultation_status', async () => {
        await withRetry(async () => {
          const updateData: any = { 
            status,
            updated_at: new Date().toISOString()
          };

          if (status === 'in_progress') {
            updateData.started_at = new Date().toISOString();
          } else if (status === 'completed') {
            updateData.completed_at = new Date().toISOString();
            if (doctorNotes) updateData.doctor_notes = doctorNotes;
            if (diagnosis) updateData.diagnosis = diagnosis;
            if (treatmentPlan) updateData.treatment_plan = treatmentPlan;
          }

          const { error } = await supabase
            .from('consultations')
            .update(updateData)
            .eq('id', consultationId);

          if (error) {
            throw handleError(error, 'updateConsultationStatus');
          }
        });
      });

      toast({
        title: "Success",
        description: "Consultation updated successfully",
      });
      fetchConsultations(); // Refresh the list
    } catch (error) {
      const apiError = handleError(error, 'updateConsultationStatus');
      toast({
        title: "Error",
        description: apiError.message,
        variant: "destructive",
      });
      console.error('Error updating consultation:', apiError);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, [doctorId]);

  return {
    consultations,
    loading,
    refetch: fetchConsultations,
    updateConsultationStatus
  };
};
