import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Phone, MapPin, AlertTriangle, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SOSEmergencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emergencyContact?: string;
}

const SOSEmergencyDialog = ({ open, onOpenChange, emergencyContact }: SOSEmergencyDialogProps) => {
  const [callingEmergency, setCallingEmergency] = useState(false);
  const [callingAmbulance, setCallingAmbulance] = useState(false);

  const handleEmergencyCall = () => {
    if (emergencyContact) {
      setCallingEmergency(true);
      window.location.href = `tel:${emergencyContact}`;
      toast({
        title: "Calling Emergency Contact",
        description: `Calling ${emergencyContact}`,
      });
      setTimeout(() => setCallingEmergency(false), 2000);
    } else {
      toast({
        title: "No Emergency Contact",
        description: "Please set up an emergency contact in your profile.",
        variant: "destructive",
      });
    }
  };

  const handleAmbulanceCall = () => {
    setCallingAmbulance(true);
    window.location.href = "tel:911";
    toast({
      title: "Calling 911",
      description: "Connecting to emergency services...",
    });
    setTimeout(() => setCallingAmbulance(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Emergency Services
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <h4 className="font-medium text-destructive">Medical Emergency</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              If this is a life-threatening emergency, call 911 immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* 911 Emergency */}
            <Card className="border-destructive/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5 text-destructive" />
                  Call 911
                </CardTitle>
                <CardDescription>
                  Emergency medical services, police, fire department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleAmbulanceCall}
                  disabled={callingAmbulance}
                >
                  {callingAmbulance ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Calling...
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4 mr-2" />
                      Call Emergency Services
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Personal Emergency Contact */}
            {emergencyContact && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Your Emergency Contact
                  </CardTitle>
                  <CardDescription>
                    {emergencyContact}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleEmergencyCall}
                    disabled={callingEmergency}
                  >
                    {callingEmergency ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Calling...
                      </>
                    ) : (
                      <>
                        <Phone className="h-4 w-4 mr-2" />
                        Call Emergency Contact
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Location Services */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Services
                </CardTitle>
                <CardDescription>
                  Share your location with emergency services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const { latitude, longitude } = position.coords;
                          toast({
                            title: "Location Shared",
                            description: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
                          });
                        },
                        (error) => {
                          toast({
                            title: "Location Error",
                            description: "Unable to access location services",
                            variant: "destructive",
                          });
                        }
                      );
                    } else {
                      toast({
                        title: "Not Supported",
                        description: "Location services not available",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Share Current Location
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SOSEmergencyDialog;