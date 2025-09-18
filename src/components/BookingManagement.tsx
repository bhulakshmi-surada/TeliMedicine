import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Video, MessageCircle, User, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface BookingRequest {
  id: string;
  patient_id: string;
  symptoms: string;
  consultation_type: string;
  status: string;
  created_at: string;
  request_message: string;
  type?: 'consultation' | 'prescription_confirmed';
  scheduled_time?: string;
  patient: {
    full_name: string;
    emergency_contact: string;
    phone?: string;
  };
}

interface BookingManagementProps {
  consultationType: 'video' | 'chat';
  doctorId: string;
  onClose: () => void;
}

const BookingManagement = ({ consultationType, doctorId, onClose }: BookingManagementProps) => {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmationType, setConfirmationType] = useState<'accept' | 'reject'>('accept');
  const [responseMessage, setResponseMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [doctorId, consultationType]);

  const fetchBookings = async () => {
    try {
      // First fetch regular bookings from consultation_requests
      const { data: consultationData, error: consultationError } = await supabase
        .from('consultation_requests')
        .select(`
          *,
          patient:patients(full_name, emergency_contact, phone)
        `)
        .eq('doctor_id', doctorId)
        .eq('consultation_type', consultationType)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (consultationError) {
        console.error('Error fetching consultation bookings:', consultationError);
      }

      // Then fetch confirmed prescriptions (patients who clicked OK)
      const { data: prescriptionData, error: prescriptionError } = await supabase
        .from('prescriptions')
        .select(`
          *,
          consultation_request:consultation_requests!inner(
            consultation_type,
            patient:patients(full_name, emergency_contact, phone)
          )
        `)
        .eq('doctor_id', doctorId)
        .eq('consultation_request.consultation_type', consultationType)
        .eq('consultation_status', 'confirmed')
        .order('created_at', { ascending: false });

      if (prescriptionError) {
        console.error('Error fetching prescription confirmations:', prescriptionError);
      }

      // Combine and format both types of bookings
      const allBookings = [];
      
      // Add consultation bookings
      if (consultationData) {
        allBookings.push(...consultationData.map(booking => ({
          ...booking,
          type: 'consultation'
        })));
      }

      // Add confirmed prescription bookings
      if (prescriptionData) {
        allBookings.push(...prescriptionData.map(prescription => ({
          id: prescription.id,
          patient_id: prescription.patient_id,
          symptoms: `Follow-up consultation from prescription`,
          consultation_type: prescription.consultation_request.consultation_type,
          status: 'confirmed',
          created_at: prescription.created_at,
          scheduled_time: prescription.selected_consultation_date && prescription.selected_consultation_time 
            ? `${prescription.selected_consultation_date} ${prescription.selected_consultation_time}`
            : null,
          request_message: `Patient confirmed ${consultationType} consultation from prescription`,
          patient: prescription.consultation_request.patient,
          type: 'prescription_confirmed'
        })));
      }

      // Sort by created_at
      allBookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setBookings(allBookings);
    } catch (error) {
      console.error('Error in fetchBookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive",
      });
    }
  };

  const handleConfirmation = (booking: BookingRequest, type: 'accept' | 'reject') => {
    setSelectedBooking(booking);
    setConfirmationType(type);
    setResponseMessage(
      type === 'accept' 
        ? `Confirmed! I'm ready to start the ${consultationType} consultation. Please be available.`
        : `Sorry, I need to reschedule this ${consultationType} consultation. Please contact me to arrange a new time.`
    );
    setShowConfirmDialog(true);
  };

  const handleSendConfirmation = async () => {
    if (!selectedBooking) return;

    setLoading(true);
    try {
      const newStatus = confirmationType === 'accept' ? 'confirmed' : 'rescheduled';
      
      const { error } = await supabase
        .from('consultation_requests')
        .update({
          status: newStatus,
          doctor_response: responseMessage
        })
        .eq('id', selectedBooking.id);

      if (error) throw error;

      toast({
        title: "Confirmation Sent",
        description: `${consultationType} consultation ${confirmationType === 'accept' ? 'confirmed' : 'rescheduled'} successfully.`,
      });

      setShowConfirmDialog(false);
      setSelectedBooking(null);
      setResponseMessage('');
      fetchBookings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send confirmation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getConsultationIcon = () => {
    return consultationType === 'video' ? Video : MessageCircle;
  };

  const ConsultationIcon = getConsultationIcon();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${consultationType === 'video' ? 'bg-blue-100' : 'bg-green-100'}`}>
            <ConsultationIcon className={`h-5 w-5 ${consultationType === 'video' ? 'text-blue-600' : 'text-green-600'}`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {consultationType === 'video' ? 'Video Call' : 'Chat'} Bookings
            </h2>
            <p className="text-muted-foreground">
              Manage your {consultationType} consultation confirmations
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={onClose}>
          Back to Dashboard
        </Button>
      </div>

      <div className="grid gap-4">
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ConsultationIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Bookings Found</h3>
              <p className="text-muted-foreground text-center">
                No {consultationType} consultation bookings at the moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          bookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{booking.patient.full_name}</CardTitle>
                      <CardDescription>
                        Emergency Contact: {booking.patient.emergency_contact}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      booking.status === 'confirmed' ? 'default' : 
                      booking.type === 'prescription_confirmed' ? 'default' : 
                      'secondary'
                    }
                    className={
                      booking.type === 'prescription_confirmed' ? 'bg-green-500 text-white' :
                      booking.status === 'confirmed' ? 'bg-green-500 text-white' : 
                      booking.status === 'rescheduled' ? 'bg-yellow-500 text-white' : 
                      'bg-blue-500 text-white'
                    }
                  >
                    {booking.type === 'prescription_confirmed' ? 'Ready from Prescription' : booking.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Requested: {new Date(booking.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Time: {new Date(booking.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Consultation Type:</strong> {booking.consultation_type}</p>
                  {booking.type === 'prescription_confirmed' ? (
                    <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                        ✓ Patient confirmed consultation from prescription
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm"><strong>Symptoms:</strong> {booking.symptoms}</p>
                  )}
                  {booking.scheduled_time && (
                    <p className="text-sm"><strong>Scheduled:</strong> {new Date(booking.scheduled_time).toLocaleString()}</p>
                  )}
                </div>
                </div>
                
                {booking.request_message && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm"><strong>Patient Message:</strong></p>
                    <p className="text-sm mt-1">{booking.request_message}</p>
                  </div>
                )}

                {booking.type === 'prescription_confirmed' ? (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <ConsultationIcon className="h-4 w-4 mr-2" />
                      Start {consultationType === 'video' ? 'Video Call' : 'Chat'}
                    </Button>
                  </div>
                ) : booking.status === 'accepted' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => handleConfirmation(booking, 'accept')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm {consultationType === 'video' ? 'Video Call' : 'Chat'}
                    </Button>
                    <Button
                      onClick={() => handleConfirmation(booking, 'reject')}
                      variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reschedule
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmationType === 'accept' ? 'Confirm' : 'Reschedule'} {consultationType === 'video' ? 'Video Call' : 'Chat'}
            </DialogTitle>
            <DialogDescription>
              Send a confirmation message to {selectedBooking?.patient.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="response">Message</Label>
              <Textarea
                id="response"
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Enter your message..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendConfirmation} 
              disabled={loading || !responseMessage.trim()}
              className={confirmationType === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}
            >
              {loading ? 'Sending...' : 'Send Confirmation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingManagement;