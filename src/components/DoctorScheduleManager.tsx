import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DoctorScheduleManagerProps {
  onClose: () => void;
}

const DoctorScheduleManager = ({ onClose }: DoctorScheduleManagerProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Manage Schedule</CardTitle>
            <Button variant="outline" onClick={onClose}>
              ← Back to Dashboard
            </Button>
          </div>
          <CardDescription>Set your availability and time slots</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Schedule management functionality coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorScheduleManager;