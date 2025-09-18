import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ScheduleSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  patient_id: string | null;
  consultation_request_id: string | null;
  notes: string | null;
}

interface DoctorScheduleManagerProps {
  onClose: () => void;
}

const DoctorScheduleManager = ({ onClose }: DoctorScheduleManagerProps) => {
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [newSlot, setNewSlot] = useState({
    date: "",
    start_time: "",
    end_time: "",
  });
  const [loading, setLoading] = useState(false);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctorId();
  }, []);

  useEffect(() => {
    if (doctorId) {
      fetchScheduleSlots();
    }
  }, [doctorId]);

  const fetchDoctorId = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setDoctorId(data.id);
    } catch (error) {
      console.error('Error fetching doctor ID:', error);
    }
  };

  const fetchScheduleSlots = async () => {
    if (!doctorId) return;

    try {
      const { data, error } = await supabase
        .from('doctor_schedule')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setScheduleSlots(data || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast({
        title: "Error",
        description: "Failed to load schedule",
        variant: "destructive",
      });
    }
  };

  const handleAddSlot = async () => {
    if (!doctorId || !newSlot.date || !newSlot.start_time || !newSlot.end_time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (newSlot.start_time >= newSlot.end_time) {
      toast({
        title: "Invalid Time",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('doctor_schedule')
        .insert({
          doctor_id: doctorId,
          date: newSlot.date,
          start_time: newSlot.start_time,
          end_time: newSlot.end_time,
          status: 'available'
        });

      if (error) throw error;

      toast({
        title: "Slot Added",
        description: "Schedule slot has been added successfully",
      });

      setNewSlot({ date: "", start_time: "", end_time: "" });
      fetchScheduleSlots();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add schedule slot",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('doctor_schedule')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      toast({
        title: "Slot Deleted",
        description: "Schedule slot has been removed",
      });

      fetchScheduleSlots();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete schedule slot",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'booked': return 'secondary';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Manage Schedule</CardTitle>
            <Button variant="outline" onClick={onClose}>
              ← Back to Dashboard
            </Button>
          </div>
          <CardDescription>Set your availability and time slots</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Slot */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Time Slot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newSlot.date}
                    onChange={(e) => setNewSlot({...newSlot, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={newSlot.start_time}
                    onChange={(e) => setNewSlot({...newSlot, start_time: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={newSlot.end_time}
                    onChange={(e) => setNewSlot({...newSlot, end_time: e.target.value})}
                  />
                </div>
              </div>
              <Button 
                onClick={handleAddSlot} 
                disabled={loading}
                className="w-full md:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                {loading ? "Adding..." : "Add Time Slot"}
              </Button>
            </CardContent>
          </Card>

          {/* Current Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {scheduleSlots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No schedule slots available</p>
                  <p className="text-sm">Add your first time slot above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduleSlots.map((slot) => (
                    <div key={slot.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="h-4 w-4" />
                              <span className="font-medium">
                                {new Date(slot.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{slot.start_time} - {slot.end_time}</span>
                            </div>
                            {slot.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{slot.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(slot.status)}>
                            {slot.status}
                          </Badge>
                          {slot.status === 'available' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteSlot(slot.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorScheduleManager;