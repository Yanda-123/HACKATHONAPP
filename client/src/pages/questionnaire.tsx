import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import MobileLayout from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2,
  Brain,
  AlertTriangle
} from "lucide-react";
import { useLocation } from "wouter";

interface Question {
  id: string;
  category: string;
  text: string;
  type: 'radio' | 'checkbox' | 'input' | 'textarea' | 'select' | 'number';
  options?: { value: string; label: string; score?: number }[];
  required?: boolean;
}

const questions: Question[] = [
  // Section 1: Personal Information
  {
    id: "fullName",
    category: "personal",
    text: "Full Name",
    type: "input",
    required: true
  },
  {
    id: "age",
    category: "personal",
    text: "Age",
    type: "number",
    required: true
  },
  {
    id: "gender",
    category: "personal",
    text: "Gender / Pronouns",
    type: "input",
    required: true
  },
  {
    id: "occupation",
    category: "personal",
    text: "Occupation",
    type: "input"
  },
  {
    id: "livingSituation",
    category: "personal",
    text: "Living Situation",
    type: "radio",
    options: [
      { value: "alone", label: "Alone" },
      { value: "family", label: "With Family" },
      { value: "roommates", label: "With Roommates" },
      { value: "other", label: "Other" }
    ]
  },
  {
    id: "supportSystem",
    category: "personal",
    text: "Support System (select all that apply)",
    type: "checkbox",
    options: [
      { value: "friends", label: "Friends" },
      { value: "family", label: "Family" },
      { value: "community", label: "Community" },
      { value: "none", label: "None" }
    ]
  },
  // Section 2: Presenting Concerns
  {
    id: "presentingConcerns",
    category: "concerns",
    text: "What brings you here today? (select all that apply)",
    type: "checkbox",
    options: [
      { value: "mood", label: "Mood changes", score: 2 },
      { value: "anxiety", label: "Anxiety / Stress", score: 2 },
      { value: "sleep", label: "Sleep problems", score: 2 },
      { value: "relationships", label: "Relationship issues", score: 1 },
      { value: "other", label: "Other" }
    ]
  },
  {
    id: "issueDuration",
    category: "concerns",
    text: "How long have you been experiencing these issues?",
    type: "radio",
    options: [
      { value: "month", label: "Less than a month", score: 1 },
      { value: "1-3months", label: "1–3 months", score: 2 },
      { value: "3-6months", label: "3–6 months", score: 3 },
      { value: "6+months", label: "More than 6 months", score: 4 }
    ]
  },
  {
    id: "dailyLifeImpact",
    category: "concerns",
    text: "How are these issues affecting your daily life? (select all that apply)",
    type: "checkbox",
    options: [
      { value: "work", label: "Work", score: 2 },
      { value: "school", label: "School", score: 2 },
      { value: "relationships", label: "Relationships", score: 2 },
      { value: "physical", label: "Physical Health", score: 3 },
      { value: "other", label: "Other" }
    ]
  },
  // Section 3: Mood & Emotions
  {
    id: "currentMood",
    category: "mood",
    text: "Rate your current mood (0 = very low, 10 = very high)",
    type: "number",
    required: true
  },
  {
    id: "frequentFeelings",
    category: "mood",
    text: "Do you often feel: (select all that apply)",
    type: "checkbox",
    options: [
      { value: "hopeless", label: "Hopeless", score: 4 },
      { value: "empty", label: "Empty", score: 3 },
      { value: "overwhelmed", label: "Overwhelmed", score: 3 },
      { value: "irritable", label: "Irritable", score: 2 },
      { value: "none", label: "None of these", score: 0 }
    ]
  },
  {
    id: "appetiteChanges",
    category: "mood",
    text: "Recent changes in appetite:",
    type: "radio",
    options: [
      { value: "increase", label: "Increase", score: 1 },
      { value: "decrease", label: "Decrease", score: 2 },
      { value: "none", label: "None", score: 0 }
    ]
  },
  {
    id: "sleepChanges",
    category: "mood",
    text: "Recent changes in sleep:",
    type: "radio",
    options: [
      { value: "difficulty", label: "Difficulty falling asleep", score: 2 },
      { value: "oversleeping", label: "Oversleeping", score: 2 },
      { value: "none", label: "None", score: 0 }
    ]
  },
  {
    id: "energyChanges",
    category: "mood",
    text: "Recent changes in energy:",
    type: "radio",
    options: [
      { value: "low", label: "Low", score: 3 },
      { value: "high", label: "High", score: 1 },
      { value: "normal", label: "Normal", score: 0 }
    ]
  },
  {
    id: "lostInterest",
    category: "mood",
    text: "Have you lost interest in activities you usually enjoy?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 }
    ]
  },
  // Section 4: Anxiety & Stress
  {
    id: "nervousOnEdge",
    category: "anxiety",
    text: "Do you often feel nervous or on edge?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 }
    ]
  },
  {
    id: "panicAttacks",
    category: "anxiety",
    text: "Do you experience panic attacks or sudden intense fear?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes", score: 4 },
      { value: "no", label: "No", score: 0 }
    ]
  },
  {
    id: "anxietyTriggers",
    category: "anxiety",
    text: "Specific triggers for your anxiety (optional)",
    type: "textarea"
  },
  {
    id: "stressCoping",
    category: "anxiety",
    text: "How do you usually cope with stress?",
    type: "textarea"
  },
  // Section 5: Trauma & Past Experiences
  {
    id: "traumaHistory",
    category: "trauma",
    text: "Have you experienced trauma (physical, emotional, sexual)?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes", score: 4 },
      { value: "no", label: "No", score: 0 }
    ]
  },
  {
    id: "significantEvents",
    category: "trauma",
    text: "Significant life events affecting your mental health",
    type: "textarea"
  },
  {
    id: "familyHistory",
    category: "trauma",
    text: "Family history of mental illness",
    type: "radio",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 }
    ]
  },
  // Section 6: Substance Use & Habits
  {
    id: "substanceUse",
    category: "substance",
    text: "Do you use alcohol, tobacco, or recreational drugs?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 }
    ]
  },
  {
    id: "substanceFrequency",
    category: "substance",
    text: "Frequency / Quantity (if applicable)",
    type: "textarea"
  },
  {
    id: "reductionAttempts",
    category: "substance",
    text: "Have you tried to reduce or stop using them?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" }
    ]
  },
  // Section 7: Cognitive & Behavioral Symptoms
  {
    id: "concentrationIssues",
    category: "cognitive",
    text: "Difficulty concentrating or memory issues?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 }
    ]
  },
  {
    id: "impulsiveBehavior",
    category: "cognitive",
    text: "Impulsive or risky behaviors?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 }
    ]
  },
  {
    id: "repetitiveBehavior",
    category: "cognitive",
    text: "Repetitive or compulsive behaviors?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "no", label: "No", score: 0 }
    ]
  },
  // Section 8: Suicidal or Self-Harm Thoughts
  {
    id: "selfHarmThoughts",
    category: "safety",
    text: "Have you ever had thoughts of self-harm or suicide?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes", score: 5 },
      { value: "no", label: "No", score: 0 }
    ]
  },
  {
    id: "selfHarmAttempts",
    category: "safety",
    text: "Have you ever attempted self-harm or suicide?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes", score: 5 },
      { value: "no", label: "No", score: 0 }
    ]
  },
  {
    id: "currentSafety",
    category: "safety",
    text: "Do you currently feel unsafe with your thoughts or actions?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes", score: 5 },
      { value: "no", label: "No", score: 0 }
    ]
  },
  // Section 9: Goals & Expectations
  {
    id: "consultationGoals",
    category: "goals",
    text: "What do you hope to achieve from this consultation?",
    type: "textarea",
    required: true
  },
  {
    id: "specificIssues",
    category: "goals",
    text: "Any specific issues you want help with first?",
    type: "textarea"
  }
];

export default function Questionnaire() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: latestResult } = useQuery({
    queryKey: ["/api/questionnaire/latest"],
    retry: false,
  });

  const submitQuestionnaireMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/questionnaire", data);
      return response.json();
    },
    onSuccess: (result) => {
      setIsCompleted(true);
      toast({
        title: "Assessment Complete",
        description: `Your wellness score: ${((100 - result.riskScore) / 10).toFixed(1)}/10`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerChange = (value: any) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleCheckboxChange = (value: string, checked: boolean) => {
    const currentValues = answers[currentQuestion.id] || [];
    if (checked) {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: [...currentValues, value] }));
    } else {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: currentValues.filter((v: string) => v !== value) }));
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Submit questionnaire
      const responses = {};
      questions.forEach(q => {
        if (answers[q.id] !== undefined) {
          let answer, score = 0;
          
          if (q.type === 'checkbox') {
            const selectedValues = answers[q.id] || [];
            answer = selectedValues.map((val: string) => 
              q.options?.find(opt => opt.value === val)?.label || val
            ).join(', ');
            score = selectedValues.reduce((total: number, val: string) => {
              const option = q.options?.find(opt => opt.value === val);
              return total + (option?.score || 0);
            }, 0);
          } else if (q.type === 'radio' || q.type === 'select') {
            const option = q.options?.find(opt => opt.value === answers[q.id]);
            answer = option?.label || answers[q.id];
            score = option?.score || 0;
          } else {
            answer = answers[q.id];
            if (q.id === 'currentMood') {
              const moodValue = parseInt(answers[q.id]);
              score = moodValue <= 3 ? 4 : moodValue <= 6 ? 2 : 0;
            }
          }
          
          responses[q.id] = {
            question: q.text,
            answer,
            category: q.category,
            score,
          };
        }
      });

      submitQuestionnaireMutation.mutate({
        responses,
        category: "general",
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const canProceed = currentQuestion?.required ? 
    (answers[currentQuestion?.id] !== undefined && answers[currentQuestion?.id] !== '') : 
    true;

  if (isLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;
  }

  if (isCompleted) {
    return (
      <MobileLayout>
        <div className="max-w-lg mx-auto bg-white min-h-screen">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-6 text-white">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="p-2 -ml-2 hover:bg-white hover:bg-opacity-20 rounded-lg text-white hover:text-white"
              >
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h2 className="text-xl font-bold">Assessment Complete</h2>
                <p className="text-purple-100 text-sm">Your results are ready</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <Card className="mb-6 bg-green-50 border-green-200">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="text-green-600 mx-auto mb-4" size={48} />
                <h3 className="text-lg font-bold text-green-900 mb-2">Assessment Complete!</h3>
                <p className="text-green-700 mb-4">Thank you for taking the time to assess your wellness.</p>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Your Wellness Score</p>
                  <p className="text-2xl font-bold text-green-600">
                    {latestResult ? ((100 - latestResult.riskScore) / 10).toFixed(1) : "8.5"}/10
                  </p>
                </div>
              </CardContent>
            </Card>

            {latestResult?.recommendations && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Brain className="mr-2 text-purple-600" size={20} />
                    Personalized Recommendations
                  </h3>
                  <div className="space-y-3">
                    {latestResult.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                        <p className="text-sm text-gray-700">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <Button
                onClick={() => navigate("/video-consultation")}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-6 rounded-xl font-medium"
              >
                Book Video Consultation
              </Button>
              <Button
                onClick={() => navigate("/reminders")}
                variant="outline"
                className="w-full py-3 px-6 rounded-xl font-medium"
              >
                Explore Meditation Sessions
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="w-full py-3 px-6 rounded-xl font-medium"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="max-w-lg mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-6 text-white">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="p-2 -ml-2 hover:bg-white hover:bg-opacity-20 rounded-lg text-white hover:text-white"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h2 className="text-xl font-bold">AI Health Assessment</h2>
              <p className="text-purple-100 text-sm">Quick wellness check</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">
                {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
            <Progress value={progress} className="w-full h-2" />
          </div>

          {/* Current Question */}
          <Card className="mb-6 bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-6">
                {currentQuestion?.text}
              </h3>
              
              {/* Answer Options */}
              {currentQuestion?.type === 'radio' && (
                <RadioGroup
                  value={answers[currentQuestion?.id] || ""}
                  onValueChange={handleAnswerChange}
                  className="space-y-3"
                >
                  {currentQuestion?.options?.map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-4 bg-white border border-purple-200 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label 
                        htmlFor={option.value} 
                        className="flex-1 text-gray-900 cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              
              {currentQuestion?.type === 'checkbox' && (
                <div className="space-y-3">
                  {currentQuestion?.options?.map((option) => (
                    <div key={option.value} className="flex items-center space-x-3 p-4 bg-white border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors">
                      <Checkbox 
                        id={option.value}
                        checked={(answers[currentQuestion?.id] || []).includes(option.value)}
                        onCheckedChange={(checked) => handleCheckboxChange(option.value, checked as boolean)}
                      />
                      <Label 
                        htmlFor={option.value} 
                        className="flex-1 text-gray-900 cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              
              {currentQuestion?.type === 'input' && (
                <Input
                  value={answers[currentQuestion?.id] || ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Enter your answer"
                  className="w-full p-4 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}
              
              {currentQuestion?.type === 'number' && (
                <Input
                  type="number"
                  value={answers[currentQuestion?.id] || ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder={currentQuestion?.id === 'currentMood' ? '0-10' : 'Enter number'}
                  min={currentQuestion?.id === 'currentMood' ? 0 : undefined}
                  max={currentQuestion?.id === 'currentMood' ? 10 : undefined}
                  className="w-full p-4 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}
              
              {currentQuestion?.type === 'textarea' && (
                <Textarea
                  value={answers[currentQuestion?.id] || ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Please provide details..."
                  rows={4}
                  className="w-full p-4 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              )}
              
              {currentQuestion?.type === 'select' && (
                <Select value={answers[currentQuestion?.id] || ""} onValueChange={handleAnswerChange}>
                  <SelectTrigger className="w-full p-4 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentQuestion?.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {/* Emergency Alert for Safety Questions */}
              {currentQuestion?.category === 'safety' && answers[currentQuestion?.id] === 'yes' && (
                <Card className="mt-4 bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900 mb-2">Immediate Support Available</h4>
                        <p className="text-sm text-red-800 mb-3">
                          If you're having thoughts of self-harm, please reach out for help immediately:
                        </p>
                        <div className="space-y-2 text-sm">
                          <p className="text-red-800"><strong>South Africa Crisis Line:</strong> 0800 567 567</p>
                          <p className="text-red-800"><strong>Emergency Services:</strong> 10111</p>
                          <p className="text-red-800"><strong>SMS Crisis Line:</strong> 31393</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="px-6 py-3 rounded-xl font-medium"
            >
              <ArrowLeft size={16} className="mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed || submitQuestionnaireMutation.isPending}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium"
            >
              {submitQuestionnaireMutation.isPending ? (
                "Submitting..."
              ) : currentQuestionIndex === questions.length - 1 ? (
                "Complete Assessment"
              ) : (
                <>
                  Next
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Question Categories */}
          <Card className="mt-8 bg-gray-50">
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">Assessment Areas</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {["Personal Info", "Concerns", "Mood & Emotions", "Anxiety & Stress", "Trauma History", "Substance Use", "Cognitive", "Safety", "Goals"].map((area, index) => (
                  <div key={area} className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      index <= currentQuestionIndex ? 'bg-purple-500' : 'bg-gray-300'
                    }`}></div>
                    <span className={index <= currentQuestionIndex ? 'text-gray-600' : 'text-gray-400'}>
                      {area}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Crisis Support Info */}
          <Card className="mt-6 bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="text-orange-600 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <h4 className="font-medium text-orange-900">Need immediate support?</h4>
                  <p className="text-sm text-orange-700 mb-2">If you're experiencing thoughts of self-harm, please contact emergency services or a crisis hotline immediately.</p>
                  <div className="text-xs space-y-1">
                    <p className="text-orange-700">South Africa: 0800 567 567 | Emergency: 10111</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
}
