import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PatientBookingViewProps {
  onClose: () => void;
}

const PatientBookingView = ({ onClose }: PatientBookingViewProps) => {
  return (
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
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          Appointment booking functionality coming soon.
        </p>
      </CardContent>
    </Card>
  );
};

export default PatientBookingView;