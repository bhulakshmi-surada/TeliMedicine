import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  available: boolean;
}

interface Appointment {
  id: string;
  doctor_id: string;
  patient_id: string;
  consultation_request_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  appointment_type: string;
  notes?: string;
  prescription_id?: string;
  created_at: string;
  updated_at: string;
  doctor: {
    full_name: string;
    specialization: string;
  };
}

interface PatientBookingViewProps {
  onClose: () => void;
}

const PatientBookingView = ({ onClose }: PatientBookingViewProps) => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("video");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDoctors();
      fetchAppointments();
    }
  }, [user]);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, full_name, specialization, available')
        .eq('available', true);

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (patientError) return;

      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientData.id)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      if (!appointmentsData?.length) {
        setAppointments([]);
        return;
      }

      // Fetch doctor details for each appointment
      const doctorIds = [...new Set(appointmentsData.map(a => a.doctor_id))];
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('id, full_name, specialization')
        .in('id', doctorIds);

      if (doctorsError) throw doctorsError;

      // Combine appointment and doctor data
      const appointmentsWithDoctors = appointmentsData.map(appointment => {
        const doctor = doctorsData?.find(d => d.id === appointment.doctor_id);
        return {
          ...appointment,
          doctor: doctor || { full_name: 'Unknown', specialization: 'Unknown' }
        };
      });

      setAppointments(appointmentsWithDoctors as Appointment[]);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a doctor, date, and time.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (patientError) throw patientError;

      const { error } = await supabase
        .from('appointments')
        .insert({
          doctor_id: selectedDoctor.id,
          patient_id: patientData.id,
          consultation_request_id: '00000000-0000-0000-0000-000000000000', // Placeholder UUID for direct bookings
          scheduled_date: selectedDate,
          scheduled_time: selectedTime,
          appointment_type: appointmentType,
          status: 'confirmed'
        });

      if (error) throw error;

      toast({
        title: "Appointment Booked",
        description: "Your appointment has been successfully scheduled.",
      });

      fetchAppointments();
      setSelectedDoctor(null);
      setSelectedDate("");
      setSelectedTime("");
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book appointment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Book Appointment</CardTitle>
            <Button variant="outline" onClick={onClose}>
              ← Back to Dashboard
            </Button>
          </div>
          <CardDescription>Schedule appointments with available doctors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Doctor Selection */}
          <div className="space-y-4">
            <h3 className="font-medium">Select Doctor</h3>
            <div className="grid gap-3">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedDoctor?.id === doctor.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{doctor.full_name}</h4>
                      <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                    </div>
                    <Badge variant="outline">Available</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-4">
            <h3 className="font-medium">Select Date</h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Time Selection */}
          <div className="space-y-4">
            <h3 className="font-medium">Select Time</h3>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>

          {/* Appointment Type */}
          <div className="space-y-4">
            <h3 className="font-medium">Appointment Type</h3>
            <div className="flex gap-2">
              <Button
                variant={appointmentType === "video" ? "default" : "outline"}
                onClick={() => setAppointmentType("video")}
              >
                <Video className="h-4 w-4 mr-2" />
                Video Call
              </Button>
              <Button
                variant={appointmentType === "phone" ? "default" : "outline"}
                onClick={() => setAppointmentType("phone")}
              >
                <Phone className="h-4 w-4 mr-2" />
                Phone Call
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleBookAppointment} 
            disabled={loading || !selectedDoctor || !selectedDate || !selectedTime}
            className="w-full"
          >
            {loading ? "Booking..." : "Book Appointment"}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Your Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No appointments scheduled</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{appointment.doctor.full_name}</h4>
                      <p className="text-sm text-muted-foreground">{appointment.doctor.specialization}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(appointment.scheduled_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {appointment.scheduled_time}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{appointment.status}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {appointment.appointment_type}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientBookingView;