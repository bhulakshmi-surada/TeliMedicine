import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ChevronRight, Stethoscope } from "lucide-react";

interface SymptomsFormProps {
  onSymptomsSubmit: (symptoms: string, category: string) => void;
  onBack: () => void;
}

const SymptomsForm = ({ onSymptomsSubmit, onBack }: SymptomsFormProps) => {
  const [symptoms, setSymptoms] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const symptomCategories = [
    { category: "General Medicine" },
    { category: "Cardiology" },
    { category: "Orthopedics" },
    { category: "Dermatology" },
    { category: "Neurology" },
    { category: "Gastroenterology" },
    { category: "Pediatrics" },
    { category: "Psychiatry" },
    { category: "ENT" },
    { category: "Ophthalmology" },
    { category: "Urology" },
    { category: "Gynecology" }
  ];

  const handleSubmit = () => {
    if (!symptoms.trim()) return;
    const category = selectedCategory || "General Medicine";
    onSymptomsSubmit(symptoms, category);
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto bg-gradient-primary p-3 rounded-full w-fit mb-3">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl">Describe Your Symptoms</CardTitle>
          <CardDescription>
            Tell us what you're experiencing so we can connect you with the right specialist
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="symptoms" className="text-sm font-medium">
              What symptoms are you experiencing?
            </Label>
            <Textarea
              id="symptoms"
              placeholder="Please describe your symptoms in detail..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Or select a category that best matches your concern:
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {symptomCategories.map((cat) => (
                <Badge
                  key={cat.category}
                  variant={selectedCategory === cat.category ? "default" : "outline"}
                  className="p-2 cursor-pointer hover:bg-primary/10 transition-colors text-center justify-center"
                  onClick={() => setSelectedCategory(cat.category)}
                >
                  {cat.category}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!symptoms.trim()}
              className="flex-1"
            >
              Find Doctors
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SymptomsForm;