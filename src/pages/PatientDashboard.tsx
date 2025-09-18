import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";

const PatientDashboard = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto bg-gradient-primary p-3 rounded-full w-fit mb-4">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <CardTitle>Patient Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Welcome to your healthcare portal. Dashboard features coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;