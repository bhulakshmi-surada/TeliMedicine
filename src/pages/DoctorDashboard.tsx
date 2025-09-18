import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope } from "lucide-react";

const DoctorDashboard = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto bg-gradient-secondary p-3 rounded-full w-fit mb-4">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <CardTitle>Doctor Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Welcome to your medical practice portal. Dashboard features coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorDashboard;