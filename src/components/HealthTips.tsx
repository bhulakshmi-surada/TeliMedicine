import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Brain, Shield, Activity } from "lucide-react";

interface HealthTipsProps {
  symptoms?: string;
  category?: string;
}

const HealthTips = ({ symptoms = "", category = "" }: HealthTipsProps) => {
  const getHealthTipsForSymptoms = (symptoms: string, category: string) => {
    const symptomsLower = symptoms.toLowerCase();
    const categoryLower = category.toLowerCase();

    // Mental health tips
    if (symptomsLower.includes('anxiety') || symptomsLower.includes('stress') || symptomsLower.includes('mental') || categoryLower.includes('mental')) {
      return [
        {
          icon: Brain,
          title: "Anxiety Management",
          description: "Practice deep breathing exercises for 5-10 minutes daily",
          color: "bg-purple-50 dark:bg-purple-950/20",
          titleColor: "text-purple-800 dark:text-purple-200",
          textColor: "text-purple-700 dark:text-purple-300"
        },
        {
          icon: Heart,
          title: "Stress Reduction",
          description: "Try meditation apps or mindfulness techniques before sleep",
          color: "bg-blue-50 dark:bg-blue-950/20",
          titleColor: "text-blue-800 dark:text-blue-200",
          textColor: "text-blue-700 dark:text-blue-300"
        },
        {
          icon: Activity,
          title: "Physical Activity",
          description: "Light exercise like walking can significantly reduce anxiety levels",
          color: "bg-green-50 dark:bg-green-950/20",
          titleColor: "text-green-800 dark:text-green-200",
          textColor: "text-green-700 dark:text-green-300"
        }
      ];
    }

    // Heart/chest related tips
    if (symptomsLower.includes('heart') || symptomsLower.includes('chest') || symptomsLower.includes('pain')) {
      return [
        {
          icon: Heart,
          title: "Heart Health",
          description: "Monitor your blood pressure and avoid excessive caffeine",
          color: "bg-red-50 dark:bg-red-950/20",
          titleColor: "text-red-800 dark:text-red-200",
          textColor: "text-red-700 dark:text-red-300"
        },
        {
          icon: Activity,
          title: "Gentle Exercise",
          description: "Light walking is beneficial, but avoid strenuous activities until cleared by doctor",
          color: "bg-green-50 dark:bg-green-950/20",
          titleColor: "text-green-800 dark:text-green-200",
          textColor: "text-green-700 dark:text-green-300"
        },
        {
          icon: Shield,
          title: "Emergency Signs",
          description: "Seek immediate help if you experience severe chest pain, shortness of breath, or dizziness",
          color: "bg-orange-50 dark:bg-orange-950/20",
          titleColor: "text-orange-800 dark:text-orange-200",
          textColor: "text-orange-700 dark:text-orange-300"
        }
      ];
    }

    // Fever/cold symptoms
    if (symptomsLower.includes('fever') || symptomsLower.includes('cough') || symptomsLower.includes('cold')) {
      return [
        {
          icon: Shield,
          title: "Rest & Recovery",
          description: "Get plenty of rest and sleep to help your body fight the infection",
          color: "bg-blue-50 dark:bg-blue-950/20",
          titleColor: "text-blue-800 dark:text-blue-200",
          textColor: "text-blue-700 dark:text-blue-300"
        },
        {
          icon: Activity,
          title: "Hydration",
          description: "Drink warm liquids like herbal tea, soup, or warm water with honey",
          color: "bg-green-50 dark:bg-green-950/20",
          titleColor: "text-green-800 dark:text-green-200",
          textColor: "text-green-700 dark:text-green-300"
        },
        {
          icon: Heart,
          title: "Symptom Monitoring",
          description: "Monitor temperature and contact doctor if fever exceeds 101°F (38.3°C)",
          color: "bg-purple-50 dark:bg-purple-950/20",
          titleColor: "text-purple-800 dark:text-purple-200",
          textColor: "text-purple-700 dark:text-purple-300"
        }
      ];
    }

    // General health tips
    return [
      {
        icon: Heart,
        title: "Stay Hydrated",
        description: "Drink at least 8 glasses of water daily to maintain optimal health",
        color: "bg-blue-50 dark:bg-blue-950/20",
        titleColor: "text-blue-800 dark:text-blue-200",
        textColor: "text-blue-700 dark:text-blue-300"
      },
      {
        icon: Activity,
        title: "Regular Exercise",
        description: "Aim for 30 minutes of moderate exercise daily to boost immunity",
        color: "bg-green-50 dark:bg-green-950/20",
        titleColor: "text-green-800 dark:text-green-200",
        textColor: "text-green-700 dark:text-green-300"
      },
      {
        icon: Brain,
        title: "Quality Sleep",
        description: "Get 7-9 hours of quality sleep each night for better health",
        color: "bg-purple-50 dark:bg-purple-950/20",
        titleColor: "text-purple-800 dark:text-purple-200",
        textColor: "text-purple-700 dark:text-purple-300"
      }
    ];
  };

  const healthTips = getHealthTipsForSymptoms(symptoms, category);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Personalized Health Tips</h3>
        {symptoms && (
          <Badge variant="secondary" className="ml-2">
            Based on your symptoms
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {healthTips.map((tip, index) => (
          <div key={index} className={`p-4 rounded-lg ${tip.color}`}>
            <div className="flex items-start gap-3">
              <tip.icon className={`h-5 w-5 mt-1 ${tip.titleColor}`} />
              <div>
                <h4 className={`font-medium mb-2 ${tip.titleColor}`}>{tip.title}</h4>
                <p className={`text-sm ${tip.textColor}`}>{tip.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {symptoms && (
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 mt-1 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Important Note</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                These tips are general guidance only. Please consult with a healthcare professional for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthTips;