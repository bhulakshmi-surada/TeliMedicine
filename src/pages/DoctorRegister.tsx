import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const DoctorRegister = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>
        <Card className="shadow-strong">
          <CardHeader className="text-center">
            <div className="mx-auto bg-gradient-primary p-3 rounded-full w-fit mb-4">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Doctor Registration</CardTitle>
            <CardDescription>Join our network of healthcare professionals</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-6">
              Doctor registration is currently by invitation only. Please contact our team to join our network.
            </p>
            <Button className="w-full" asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorRegister;