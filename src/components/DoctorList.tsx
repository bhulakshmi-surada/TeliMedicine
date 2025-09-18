import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { User, Clock, Star, Send, Video, MessageCircle, ArrowLeft, Filter, Award, BookOpen } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  experience_years: number;
  bio: string;
  available: boolean;
}

interface DoctorListProps {
  onClose: () => void;
  symptoms?: string;
  category?: string;
  onBack?: () => void;
}

interface DoctorWithMatch extends Doctor {
  matchScore: number;
  matchReason: string[];
}

const DoctorList = ({ onClose, symptoms: userSymptoms = "", category = "", onBack }: DoctorListProps) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorWithMatch[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [symptoms, setSymptoms] = useState(userSymptoms);
  const [consultationType, setConsultationType] = useState('video');
  const [requestMessage, setRequestMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchDoctors();
  }, [userSymptoms, category]);

  const fetchDoctors = async () => {
    const { data, error } = await supabase
      .from('doctors')
      .select('id, full_name, specialization, bio, experience_years, available, created_at')
      .eq('available', true)
      .order('full_name');

    if (error) {
      console.error('Error fetching doctors:', error);
      toast({
        title: "Error",
        description: "Failed to load doctors. Please try again.",
        variant: "destructive",
      });
    } else {
      setDoctors(data || []);
      filterDoctorsBySymptoms(data || []);
    }
  };

  const filterDoctorsBySymptoms = (doctorsList: Doctor[]) => {
    if (!userSymptoms || !category) {
      setFilteredDoctors(doctorsList.map(doctor => ({
        ...doctor,
        matchScore: 1,
        matchReason: [`Available ${doctor.specialization} specialist`]
      })));
      return;
    }

    // Symptom to specialization mapping
    const symptomSpecializationMap: { [key: string]: string[] } = {
      'mental health': ['Psychiatry', 'Psychology'],
      'anxiety': ['Psychiatry', 'Psychology'],
      'depression': ['Psychiatry', 'Psychology'],
      'heart': ['Cardiology', 'Internal Medicine'],
      'chest pain': ['Cardiology', 'Emergency Medicine'],
      'headache': ['Neurology', 'Internal Medicine'],
      'skin': ['Dermatology'],
      'fever': ['Internal Medicine', 'Family Medicine'],
      'cough': ['Pulmonology', 'Internal Medicine'],
      'stomach': ['Gastroenterology', 'Internal Medicine'],
      'back pain': ['Orthopedics', 'Physical Medicine'],
      'eye': ['Ophthalmology'],
      'ear': ['ENT', 'Otolaryngology'],
    };

    const matchedDoctors = doctorsList.map(doctor => {
      let matchScore = 0.5; // Base score
      const matchReasons: string[] = [];

      // Check category match
      if (category && doctor.specialization.toLowerCase().includes(category.toLowerCase())) {
        matchScore += 0.5;
        matchReasons.push(`Specializes in ${category}`);
      }

      // Check symptom keywords
      const symptomsLower = userSymptoms.toLowerCase();
      for (const [symptom, specializations] of Object.entries(symptomSpecializationMap)) {
        if (symptomsLower.includes(symptom)) {
          if (specializations.some(spec => doctor.specialization.includes(spec))) {
            matchScore += 0.3;
            matchReasons.push(`Expert in ${symptom}-related conditions`);
          }
        }
      }

      // Experience bonus
      if (doctor.experience_years > 5) {
        matchScore += 0.1;
        matchReasons.push(`${doctor.experience_years} years of experience`);
      }

      if (matchReasons.length === 0) {
        matchReasons.push(`Available ${doctor.specialization} specialist`);
      }

      return {
        ...doctor,
        matchScore,
        matchReason: matchReasons
      };
    });

    // Sort by match score (highest first)
    matchedDoctors.sort((a, b) => b.matchScore - a.matchScore);
    setFilteredDoctors(matchedDoctors);
  };

  const handleSendRequest = async () => {
    if (!selectedDoctor || !user || !symptoms) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // First, ensure patient record exists
      let patientData;
      const { data: existingPatient, error: patientSelectError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (patientSelectError) {
        // Create patient record if it doesn't exist
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, email, phone')
          .eq('user_id', user.id)
          .single();

        const { data: newPatient, error: createError } = await supabase
          .from('patients')
          .insert({
            user_id: user.id,
            full_name: profileData?.full_name || 'Unknown Patient',
            email: profileData?.email || user.email || '',
            phone: profileData?.phone
          })
          .select('id')
          .single();

        if (createError) {
          throw new Error('Failed to create patient record');
        }
        patientData = newPatient;
      } else {
        patientData = existingPatient;
      }

      const { error: requestError } = await supabase
        .from('consultation_requests')
        .insert({
          patient_id: patientData.id,
          doctor_id: selectedDoctor.id,
          symptoms,
          consultation_type: consultationType,
          request_message: requestMessage,
        });

      if (requestError) {
        throw new Error('Failed to send consultation request');
      }

      toast({
        title: "Success",
        description: "Consultation request sent successfully!",
      });

      setShowRequestDialog(false);
      setSelectedDoctor(null);
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="card-enhanced hover:shadow-glow transition-spring hover-scale">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto bg-gradient-medical p-3 rounded-full w-fit mb-3 shadow-glow">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg text-foreground">{doctor.full_name}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="bg-gradient-secondary text-white border-0 shadow-soft">{doctor.specialization}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{doctor.experience_years}+ years</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-success" />
                      <span className="text-success font-medium">{Math.round(doctor.matchScore * 100)}% match</span>
                    </div>
                  </div>
                  {doctor.matchReason.length > 0 && (
                   <div className="space-y-2">
                     <div className="flex items-center gap-1 mb-2">
                       <BookOpen className="h-3 w-3 text-info" />
                       <span className="text-xs font-medium text-info">Why this doctor matches:</span>
                     </div>
                       {doctor.matchReason.slice(0, 2).map((reason, idx) => (
                         <Badge key={idx} variant="outline" className="mr-1 mb-1 text-xs border-primary/30 text-primary bg-primary/5">
                           {reason}
                         </Badge>
                       ))}
                     </div>
                  )}
                  <div className="bg-soft-gray/50 dark:bg-muted/20 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground line-clamp-3">{doctor.bio || "Experienced healthcare professional dedicated to providing quality medical care."}</p>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setShowRequestDialog(true);
                    }}
                    className="w-full btn-medical-primary shadow-soft hover:shadow-medium transition-spring"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Request
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Consultation Request</DialogTitle>
            <DialogDescription>
              Request a consultation with {selectedDoctor?.full_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="symptoms">Symptoms *</Label>
              <Textarea
                id="symptoms"
                placeholder="Describe your symptoms..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Consultation Type</Label>
              <RadioGroup value={consultationType} onValueChange={setConsultationType}>
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                  <RadioGroupItem value="video" id="video" />
                  <Video className="h-4 w-4 text-primary" />
                  <Label htmlFor="video" className="cursor-pointer">Video Call</Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                  <RadioGroupItem value="chat" id="chat" />
                  <MessageCircle className="h-4 w-4 text-accent" />
                  <Label htmlFor="chat" className="cursor-pointer">Chat</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendRequest} disabled={loading || !symptoms}>
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DoctorList;