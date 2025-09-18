import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Clock, User, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ConsultationRequest {
  id: string;
  patient_id: string;
  symptoms: string;
  consultation_type: string;
  status: string;
  created_at: string;
  request_message: string;
  doctor_response: string;
  patient: {
    full_name: string;
    emergency_contact: string;
  };
}

interface PendingRequestsViewProps {
  onClose: () => void;
  doctorId: string;
}

const PendingRequestsView = ({ onClose, doctorId }: PendingRequestsViewProps) => {
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ConsultationRequest | null>(null);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingRequests();
  }, [doctorId]);

  const fetchPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('consultation_requests')
        .select(`
          *,
          patient:patients(full_name, emergency_contact)
        `)
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      toast({
        title: "Error",
        description: "Failed to load consultation requests",
        variant: "destructive",
      });
    }
  };

  const handleAcceptRequest = async (request: ConsultationRequest) => {
    setSelectedRequest(request);
    const consultationType = request.consultation_type === 'video' ? 'video call' : 'chat';
    setResponseMessage(`Your consultation request has been accepted! I'm ready to provide a ${consultationType} consultation. Please be available at your preferred time. For video calls, ensure you have a stable internet connection and a working camera/microphone.`);
    setShowResponseDialog(true);
  };

  const handleDeclineRequest = async (request: ConsultationRequest) => {
    setSelectedRequest(request);
    setResponseMessage('Thank you for your consultation request. Unfortunately, I am not available at your preferred time. Please consider rescheduling or consulting with another available doctor.');
    setShowResponseDialog(true);
  };

  const handleSendResponse = async (accept: boolean) => {
    if (!selectedRequest) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('consultation_requests')
        .update({
          status: accept ? 'accepted' : 'rejected',
          doctor_response: responseMessage
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: "Response Sent",
        description: `Consultation request ${accept ? 'accepted' : 'declined'} successfully.`,
      });

      setShowResponseDialog(false);
      setSelectedRequest(null);
      setResponseMessage('');
      fetchPendingRequests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send response",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyVariant = (symptoms: string) => {
    const urgentKeywords = ['chest pain', 'breathing', 'emergency', 'severe', 'urgent'];
    const isUrgent = urgentKeywords.some(keyword =>
      symptoms.toLowerCase().includes(keyword)
    );
    return isUrgent ? 'destructive' : 'secondary';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Consultation Requests</CardTitle>
            <Button variant="outline" onClick={onClose}>
              ← Back to Dashboard
            </Button>
          </div>
          <CardDescription>Review and respond to patient consultation requests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No consultation requests found</p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{request.patient.full_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Emergency Contact: {request.patient.emergency_contact}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getUrgencyVariant(request.symptoms)}>
                      {getUrgencyVariant(request.symptoms) === 'destructive' ? 'Urgent' : 'Normal'}
                    </Badge>
                    <Badge variant={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div>
                    <strong className="text-sm">Symptoms:</strong>
                    <p className="text-sm text-muted-foreground mt-1">{request.symptoms}</p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span><strong>Type:</strong> {request.consultation_type}</span>
                    <span><strong>Requested:</strong> {new Date(request.created_at).toLocaleString()}</span>
                  </div>
                  {request.request_message && (
                    <div>
                      <strong className="text-sm">Message:</strong>
                      <p className="text-sm text-muted-foreground mt-1">{request.request_message}</p>
                    </div>
                  )}
                  {request.doctor_response && (
                    <div>
                      <strong className="text-sm">Your Response:</strong>
                      <p className="text-sm text-muted-foreground mt-1">{request.doctor_response}</p>
                    </div>
                  )}
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1"
                      onClick={() => handleAcceptRequest(request)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleDeclineRequest(request)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Response to Patient</DialogTitle>
            <DialogDescription>
              Patient: {selectedRequest?.patient.full_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="response">Response Message</Label>
              <Textarea
                id="response"
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Enter your response message..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResponseDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleSendResponse(responseMessage.includes('accepted'))}
              disabled={loading || !responseMessage}
            >
              {loading ? "Sending..." : "Send Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingRequestsView;