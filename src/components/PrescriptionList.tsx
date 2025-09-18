import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Heart, AlertCircle, Check, X, Video, MessageCircle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Prescription {
  id: string;
  medications: string;
  dosage_instructions: string;
  health_tips: string;
  follow_up_date: string;
  notes: string;
  created_at: string;
  doctor_id: string;
  consultation_request_id: string;
  selected_consultation_date: string | null;
  selected_consultation_time: string | null;
  consultation_status: string;
  doctor: {
    full_name: string;
    specialization: string;
  };
  consultation_request: {
    consultation_type: string;
  };
}

const PrescriptionList = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPrescriptions();
    }
  }, [user]);

  const fetchPrescriptions = async () => {
    try {
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (patientError) {
        throw new Error('Patient profile not found');
      }

      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          doctor:doctors(full_name, specialization),
          consultation_request:consultation_requests(consultation_type)
        `)
        .eq('patient_id', patientData.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error('Failed to fetch prescriptions');
      }

      setPrescriptions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load prescriptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConsultationConfirmation = async (prescriptionId: string, confirm: boolean) => {
    try {
      const { error: prescriptionError } = await supabase
        .from('prescriptions')
        .update({ 
          consultation_status: confirm ? 'confirmed' : 'declined' 
        })
        .eq('id', prescriptionId);

      if (prescriptionError) {
        throw new Error('Failed to update consultation status');
      }

      toast({
        title: confirm ? "Consultation Confirmed" : "Consultation Declined",
        description: confirm 
          ? "Your consultation has been confirmed. The doctor will contact you at the scheduled time."
          : "Consultation declined. The doctor has been notified.",
      });

      // Refresh prescriptions
      fetchPrescriptions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update consultation status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading prescriptions...</div>;
  }

  if (prescriptions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Prescriptions Yet</h3>
          <p className="text-muted-foreground">
            Your prescriptions will appear here after consultations with doctors.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {prescriptions.map((prescription) => (
        <Card key={prescription.id} className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Prescription from {prescription.doctor.full_name}
            </CardTitle>
            <CardDescription>
              {prescription.doctor.specialization} • {new Date(prescription.created_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Medications & Dosage</h4>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm">{prescription.medications}</p>
              </div>
              <div className="mt-2 bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">{prescription.dosage_instructions}</p>
              </div>
            </div>

            {prescription.health_tips && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-green-600" />
                  Health Tips
                </h4>
                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">{prescription.health_tips}</p>
                </div>
              </div>
            )}

            {/* Selected Consultation Slot */}
            {prescription.selected_consultation_date && prescription.selected_consultation_time && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  {prescription.consultation_request.consultation_type === 'video' ? (
                    <Video className="h-4 w-4 text-blue-600" />
                  ) : (
                    <MessageCircle className="h-4 w-4 text-green-600" />
                  )}
                  Scheduled {prescription.consultation_request.consultation_type === 'video' ? 'Video Call' : 'Chat'} Consultation
                </h4>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {new Date(prescription.selected_consultation_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-200">
                        {new Date(`1970-01-01T${prescription.selected_consultation_time}`).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <Badge 
                        variant={
                          prescription.consultation_status === 'confirmed' ? 'default' :
                          prescription.consultation_status === 'declined' ? 'destructive' :
                          'secondary'
                        }
                        className="mt-2"
                      >
                        {prescription.consultation_status === 'confirmed' ? 'Confirmed' :
                         prescription.consultation_status === 'declined' ? 'Declined' :
                         'Pending Confirmation'}
                      </Badge>
                    </div>
                    {prescription.consultation_status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleConsultationConfirmation(prescription.id, true)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          OK
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleConsultationConfirmation(prescription.id, false)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          NO
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {prescription.follow_up_date && (
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Follow-up Date
                </h4>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {new Date(prescription.follow_up_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PrescriptionList;