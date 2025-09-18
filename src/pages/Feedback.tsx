import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Star, Heart, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Feedback = () => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userType: '',
    category: '',
    title: '',
    feedback: '',
    improvements: '',
    recommendation: ''
  });
  const [loading, setLoading] = useState(false);

  const feedbackCategories = [
    { value: "general", label: "General Feedback" },
    { value: "technical", label: "Technical Issues" },
    { value: "doctor", label: "Doctor Experience" },
    { value: "platform", label: "Platform Usability" },
    { value: "billing", label: "Billing & Payment" },
    { value: "suggestion", label: "Feature Suggestion" }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitFeedback = async () => {
    if (!rating || !formData.category || !formData.feedback) {
      toast({
        title: "Missing Information",
        description: "Please provide a rating, category, and feedback message.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit feedback.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          user_type: formData.userType || 'patient',
          rating,
          feedback_text: `${formData.title ? formData.title + '\n\n' : ''}${formData.feedback}${formData.improvements ? '\n\nImprovements: ' + formData.improvements : ''}${formData.recommendation ? '\n\nRecommendation: ' + formData.recommendation : ''}`,
          category: formData.category
        });

      if (error) {
        throw new Error('Failed to submit feedback');
      }

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We appreciate your input.",
      });

      // Reset form
      setRating(0);
      setFormData({
        name: '',
        email: '',
        userType: '',
        category: '',
        title: '',
        feedback: '',
        improvements: '',
        recommendation: ''
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mx-auto bg-gradient-primary p-4 rounded-full w-fit mb-6">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Share Your Feedback</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your feedback helps us improve TeleMed and provide better healthcare experiences for everyone.
          </p>
        </div>

        {/* Feedback Form */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-primary" />
              <span>Tell Us About Your Experience</span>
            </CardTitle>
            <CardDescription>
              We value your opinion and use your feedback to continuously improve our services.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="Your full name" 
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your.email@example.com" 
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userType">You are a...</Label>
              <Select value={formData.userType} onValueChange={(value) => handleInputChange('userType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="support">Support Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Feedback Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="What is this feedback about?" />
                </SelectTrigger>
                <SelectContent>
                  {feedbackCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Overall Rating</Label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300 hover:text-yellow-300"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-3 text-sm text-muted-foreground">
                    {rating} out of 5 stars
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Feedback Title</Label>
              <Input 
                id="title" 
                placeholder="Brief summary of your feedback"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Your Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Please share your detailed feedback, suggestions, or concerns..."
                className="min-h-[150px]"
                value={formData.feedback}
                onChange={(e) => handleInputChange('feedback', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="improvements">What could we improve?</Label>
              <Textarea
                id="improvements"
                placeholder="Any specific suggestions for how we can make TeleMed better?"
                className="min-h-[100px]"
                value={formData.improvements}
                onChange={(e) => handleInputChange('improvements', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendation">Would you recommend TeleMed to others?</Label>
              <Select value={formData.recommendation} onValueChange={(value) => handleInputChange('recommendation', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your likelihood to recommend" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="definitely">Definitely - I would highly recommend</SelectItem>
                  <SelectItem value="probably">Probably - I would likely recommend</SelectItem>
                  <SelectItem value="maybe">Maybe - I'm not sure</SelectItem>
                  <SelectItem value="unlikely">Unlikely - I probably wouldn't recommend</SelectItem>
                  <SelectItem value="definitely-not">Definitely not - I would not recommend</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="bg-muted/30 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground mb-1">Privacy Notice</p>
                    <p className="text-muted-foreground">
                      Your feedback will be kept confidential and used solely for improving our services. 
                      We may contact you for follow-up questions if you provide your email address.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-4">
              <Button 
                className="flex-1" 
                onClick={handleSubmitFeedback}
                disabled={loading || !rating || !formData.category || !formData.feedback}
              >
                {loading ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Thank You Message */}
        <Card className="mt-8 shadow-soft bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-6 text-center">
            <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Thank You for Your Feedback!</h3>
            <p className="text-muted-foreground">
              Every piece of feedback helps us create a better healthcare experience. 
              We read every submission and use your insights to guide our improvements.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Feedback;