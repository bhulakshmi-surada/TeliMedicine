import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Pill, FileText, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ConsultationRequest {
  id: string;
  patient_id: string;
  symptoms: string;
  patient: {
    full_name: string;
  };
}

interface ScheduleSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface PrescriptionWithScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultationRequest: ConsultationRequest | null;
  doctorId: string;
  onComplete: () => void;
}

const PrescriptionWithScheduleDialog = ({ 
  open, 
  onOpenChange, 
  consultationRequest, 
  doctorId,
  onComplete 
}: PrescriptionWithScheduleDialogProps) => {
  const [medications, setMedications] = useState('');
  const [dosageInstructions, setDosageInstructions] = useState('');
  const [notes, setNotes] = useState('');
  const [healthTips, setHealthTips] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<ScheduleSlot[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && doctorId) {
      fetchAvailableSlots();
    }
  }, [open, doctorId]);

  useEffect(() => {
    // Filter slots based on follow-up date selection
    if (followUpDate) {
      const filtered = availableSlots.filter(slot => slot.date === followUpDate);
      setFilteredSlots(filtered);
    } else {
      setFilteredSlots(availableSlots);
    }
  }, [followUpDate, availableSlots]);

  const fetchAvailableSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('doctor_schedule')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('status', 'available')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date')
        .order('start_time')
        .limit(10);

      if (error) throw error;
      setAvailableSlots(data || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
    }
  };

  const handleSubmitPrescription = async () => {
    if (!consultationRequest || !medications || !dosageInstructions) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Get selected slot information
    let selectedSlot = null;
    if (followUpDate) {
      const availableSlotsForDate = filteredSlots.length > 0 ? filteredSlots : availableSlots.filter(slot => slot.date === followUpDate);
      if (availableSlotsForDate.length === 0) {
        toast({
          title: "No Available Slots",
          description: "Please select a different follow-up date or remove the follow-up date.",
          variant: "destructive",
        });
        return;
      }
      // Select the first available slot for the selected date
      selectedSlot = availableSlotsForDate[0];
    }

    setLoading(true);

    try {
      // Create prescription
      const { error: prescriptionError } = await supabase
        .from('prescriptions')
        .insert({
          doctor_id: doctorId,
          patient_id: consultationRequest.patient_id,
          consultation_request_id: consultationRequest.id,
          medications,
          dosage_instructions: dosageInstructions,
          notes,
          health_tips: healthTips,
          follow_up_date: followUpDate || null,
          selected_consultation_date: selectedSlot?.date || null,
          selected_consultation_time: selectedSlot?.start_time || null,
          consultation_status: 'pending'
        });

      if (prescriptionError) throw prescriptionError;

      // Update consultation request status to completed
      const { error: updateError } = await supabase
        .from('consultation_requests')
        .update({
          status: 'completed',
          doctor_response: `Prescription provided${selectedSlot ? ` with consultation slot scheduled for ${selectedSlot.date} at ${selectedSlot.start_time}` : '. Available slots for follow-up consultations shown below.'}`
        })
        .eq('id', consultationRequest.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: `Prescription created successfully${selectedSlot ? ` with consultation slot scheduled for ${selectedSlot.date} at ${selectedSlot.start_time}` : ' with available consultation slots'}.`,
      });

      // Reset form
      setMedications('');
      setDosageInstructions('');
      setNotes('');
      setHealthTips('');
      setFollowUpDate('');
      
      onOpenChange(false);
      onComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create prescription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Prescription & Share Schedule
          </DialogTitle>
          <DialogDescription>
            For {consultationRequest?.patient.full_name} - {consultationRequest?.symptoms.substring(0, 50)}...
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Prescription Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Pill className="h-5 w-5" />
                Prescription Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="medications">Medications *</Label>
                <Textarea
                  id="medications"
                  placeholder="List medications with dosages (e.g., Paracetamol 500mg, Amoxicillin 250mg)"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="dosage">Dosage Instructions *</Label>
                <Textarea
                  id="dosage"
                  placeholder="Detailed instructions (e.g., Take 1 tablet twice daily after meals for 5 days)"
                  value={dosageInstructions}
                  onChange={(e) => setDosageInstructions(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Medical Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional medical notes or observations"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="healthTips">Health Tips</Label>
                <Textarea
                  id="healthTips"
                  placeholder="Lifestyle recommendations and health tips"
                  value={healthTips}
                  onChange={(e) => setHealthTips(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="followUp">Follow-up Date</Label>
                <Input
                  id="followUp"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Select a date to filter available time slots below
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Available Schedule Slots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Available Consultation Slots
              </CardTitle>
              <CardDescription>
                These slots will be shared with the patient for future consultations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {followUpDate && filteredSlots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No available slots for {new Date(followUpDate).toLocaleDateString()}</p>
                  <p className="text-sm">Try selecting a different date or add slots in your schedule manager</p>
                </div>
              ) : filteredSlots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No available slots found</p>
                  <p className="text-sm">Add slots in your schedule manager</p>
                </div>
              ) : (
                <div>
                  {followUpDate && (
                    <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-sm font-medium text-primary">
                        Showing slots for {new Date(followUpDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredSlots.map((slot) => (
                      <div key={slot.id} className="p-3 bg-muted/50 rounded-lg border hover:bg-muted/70 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {new Date(slot.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{slot.start_time} - {slot.end_time}</span>
                        </div>
                        <Badge variant="secondary" className="mt-1 text-xs bg-green-100 text-green-700">
                          Available
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitPrescription} 
            disabled={loading || !medications || !dosageInstructions}
          >
            {loading ? "Creating..." : "Create Prescription & Share Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionWithScheduleDialog;