import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck } from "lucide-react";

const SupportLogin = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center">
      <Card className="max-w-md mx-auto shadow-strong">
        <CardHeader className="text-center">
          <div className="mx-auto bg-gradient-primary p-3 rounded-full w-fit mb-4">
            <UserCheck className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Support Staff Login</CardTitle>
          <CardDescription>Access restricted to authorized personnel</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">This portal is for internal support staff only.</p>
          <Button variant="outline" className="w-full">Contact Administrator</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportLogin;