import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ScheduleSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface DoctorAvailableSlotsProps {
  doctorId: string;
}

const DoctorAvailableSlots = ({ doctorId }: DoctorAvailableSlotsProps) => {
  const [availableSlots, setAvailableSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableSlots();
  }, [doctorId]);

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
        .limit(5);

      if (error) throw error;
      setAvailableSlots(data || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Doctor's Available Consultation Slots
        </h4>
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">Loading available slots...</p>
        </div>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div>
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Doctor's Available Consultation Slots
        </h4>
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">No available slots at the moment. Please contact the doctor directly.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" />
        Doctor's Available Consultation Slots
      </h4>
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground mb-3">
          You can book any of these available time slots for follow-up consultations:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {availableSlots.map((slot) => (
            <div key={slot.id} className="bg-white dark:bg-card p-3 rounded border">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-3 w-3 text-primary" />
                <span className="text-sm font-medium">
                  {new Date(slot.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{slot.start_time} - {slot.end_time}</span>
              </div>
              <Badge variant="secondary" className="mt-1 text-xs">
                Available
              </Badge>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 italic">
          Contact your doctor to book any of these available slots for your next consultation.
        </p>
      </div>
    </div>
  );
};

export default DoctorAvailableSlots;