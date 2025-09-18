import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PendingRequestsViewProps {
  onClose: () => void;
  doctorId: string;
}

const PendingRequestsView = ({ onClose, doctorId }: PendingRequestsViewProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pending Requests</CardTitle>
          <Button variant="outline" onClick={onClose}>
            ← Back to Dashboard
          </Button>
        </div>
        <CardDescription>Review and respond to patient consultation requests</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          Pending requests view functionality coming soon.
        </p>
      </CardContent>
    </Card>
  );
};

export default PendingRequestsView;