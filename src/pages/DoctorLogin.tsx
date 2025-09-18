import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const DoctorLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>
        <Card className="shadow-strong">
          <CardHeader className="text-center">
            <div className="mx-auto bg-gradient-secondary p-3 rounded-full w-fit mb-4">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Doctor Login</CardTitle>
            <CardDescription>Access your medical practice portal</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Enter your password" />
              </div>
              <Button type="submit" className="w-full">Sign In to Doctor Portal</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorLogin;