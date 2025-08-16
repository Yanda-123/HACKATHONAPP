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
  options: { value: string; label: string; score: number }[];
}

const questions: Question[] = [
  {
    id: "sleep1",
    category: "sleep",
    text: "How has your sleep been over the past week?",
    options: [
      { value: "excellent", label: "Excellent - I sleep well most nights", score: 0 },
      { value: "good", label: "Good - Generally sleep well", score: 1 },
      { value: "fair", label: "Fair - Some difficulty sleeping", score: 2 },
      { value: "poor", label: "Poor - Frequent sleep problems", score: 3 },
    ]
  },
  {
    id: "mood1", 
    category: "mood",
    text: "How would you describe your mood over the past two weeks?",
    options: [
      { value: "very_positive", label: "Very positive and happy", score: 0 },
      { value: "mostly_positive", label: "Mostly positive", score: 1 },
      { value: "mixed", label: "Mixed - some good days, some bad", score: 2 },
      { value: "mostly_low", label: "Mostly low or sad", score: 3 },
    ]
  },
  {
    id: "stress1",
    category: "stress", 
    text: "How often do you feel overwhelmed or stressed?",
    options: [
      { value: "rarely", label: "Rarely or never", score: 0 },
      { value: "sometimes", label: "Sometimes", score: 1 },
      { value: "often", label: "Often", score: 2 },
      { value: "constantly", label: "Almost constantly", score: 3 },
    ]
  },
  {
    id: "energy1",
    category: "energy",
    text: "How are your energy levels throughout the day?",
    options: [
      { value: "high", label: "High energy most of the day", score: 0 },
      { value: "moderate", label: "Moderate energy", score: 1 },
      { value: "low", label: "Low energy but manageable", score: 2 },
      { value: "very_low", label: "Very low energy, hard to function", score: 3 },
    ]
  },
  {
    id: "social1",
    category: "social",
    text: "How do you feel about your relationships and social connections?",
    options: [
      { value: "strong", label: "Strong and supportive", score: 0 },
      { value: "good", label: "Generally good", score: 1 },
      { value: "mixed", label: "Some good, some challenging", score: 2 },
      { value: "isolated", label: "Feel isolated or disconnected", score: 3 },
    ]
  },
  {
    id: "anxiety1",
    category: "anxiety",
    text: "How often do you experience anxiety or worry?",
    options: [
      { value: "rarely", label: "Rarely", score: 0 },
      { value: "occasionally", label: "Occasionally", score: 1 },
      { value: "frequently", label: "Frequently", score: 2 },
      { value: "constantly", label: "Almost constantly", score: 3 },
    ]
  },
  {
    id: "coping1",
    category: "coping",
    text: "How well do you feel you're coping with daily challenges?",
    options: [
      { value: "very_well", label: "Very well - I handle things easily", score: 0 },
      { value: "well", label: "Well - I manage most things", score: 1 },
      { value: "struggling", label: "Struggling but getting by", score: 2 },
      { value: "overwhelmed", label: "Feeling overwhelmed and unable to cope", score: 3 },
    ]
  },
  {
    id: "hope1",
    category: "mood",
    text: "How hopeful do you feel about the future?",
    options: [
      { value: "very_hopeful", label: "Very hopeful and optimistic", score: 0 },
      { value: "hopeful", label: "Generally hopeful", score: 1 },
      { value: "uncertain", label: "Uncertain about the future", score: 2 },
      { value: "hopeless", label: "Feeling hopeless or pessimistic", score: 3 },
    ]
  }
];

export default function Questionnaire() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
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

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Submit questionnaire
      const responses = {};
      questions.forEach(q => {
        if (answers[q.id]) {
          responses[q.id] = {
            question: q.text,
            answer: q.options.find(opt => opt.value === answers[q.id])?.label,
            category: q.category,
            score: q.options.find(opt => opt.value === answers[q.id])?.score || 0,
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

  const canProceed = answers[currentQuestion?.id] !== undefined;

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
              <RadioGroup
                value={answers[currentQuestion?.id] || ""}
                onValueChange={handleAnswerChange}
                className="space-y-3"
              >
                {currentQuestion?.options.map((option) => (
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
                {["Sleep Quality", "Mood", "Stress Level", "Energy", "Social", "Anxiety", "Coping", "Hope"].map((area, index) => (
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
                  <p className="text-sm text-orange-700">If you're experiencing thoughts of self-harm, please contact emergency services or a crisis hotline immediately.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
}
