import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Camera,
  Shield,
  Eye,
  Heart,
  BarChart3,
  Smile,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { useLocation } from "wouter";

export default function FacialRecognition() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [cameraActive, setCameraActive] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

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

  const handleRequestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
      setCameraActive(true);
      toast({
        title: "Camera Access Granted",
        description: "You can now start the emotion analysis session.",
      });
      // Stop the stream for now - in a real app, this would be used for analysis
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to use this feature.",
        variant: "destructive",
      });
    }
  };

  const handleStartSession = () => {
    if (!hasPermission) {
      toast({
        title: "Camera Permission Required",
        description: "Please enable camera access first.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Feature Coming Soon",
      description: "AI emotion analysis will be available in a future update.",
    });
  };

  const handleSkip = () => {
    navigate("/questionnaire");
  };

  if (isLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;
  }

  const sampleQuestions = [
    "How do you feel about your current work-life balance?",
    "Describe your stress levels over the past week.",
    "What brings you the most joy in your daily life?"
  ];

  const analysisFeatures = [
    { icon: Eye, label: "Facial expression tracking" },
    { icon: Heart, label: "Stress indicator detection" },
    { icon: Smile, label: "Emotion classification" },
    { icon: BarChart3, label: "Real-time analysis" }
  ];

  return (
    <MobileLayout>
      <div className="max-w-lg mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-6 text-white">
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
              <h2 className="text-xl font-bold">AI Emotion Check</h2>
              <p className="text-pink-100 text-sm">Optional mood analysis</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Consent Section */}
          <Card className="mb-6 bg-pink-50 border-pink-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="text-pink-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-pink-900 mb-2">Privacy & Consent</h3>
                  <p className="text-sm text-pink-800 mb-4">
                    This feature uses your camera to analyze facial expressions and detect emotional states. Your privacy is protected:
                  </p>
                  <ul className="text-sm text-pink-700 space-y-1">
                    <li className="flex items-center">
                      <CheckCircle2 className="text-pink-600 mr-2 flex-shrink-0" size={16} />
                      Images are processed locally on your device
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="text-pink-600 mr-2 flex-shrink-0" size={16} />
                      No photos are stored or transmitted
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="text-pink-600 mr-2 flex-shrink-0" size={16} />
                      You can stop anytime
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Camera Preview Area */}
          <Card className="mb-6 bg-gray-100">
            <CardContent className="p-8 text-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Camera className="text-gray-500" size={48} />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">
                {cameraActive ? "Camera Active" : "Camera Not Active"}
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                {hasPermission 
                  ? "Camera access granted - ready for analysis" 
                  : "Allow camera access to start emotion analysis"
                }
              </p>
              {!hasPermission ? (
                <Button
                  onClick={handleRequestCamera}
                  className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
                >
                  <Camera className="mr-2" size={16} />
                  Enable Camera
                </Button>
              ) : (
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle2 size={16} />
                  <span className="text-sm font-medium">Camera Ready</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sample Questions */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Sample Questions</h3>
            <p className="text-sm text-gray-600 mb-4">
              During the session, you'll answer questions while our AI monitors your emotional responses:
            </p>
            <div className="space-y-3">
              {sampleQuestions.map((question, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-gray-900">"{question}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* AI Analysis Explanation */}
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-900 mb-2">How AI Analysis Works</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {analysisFeatures.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <IconComponent className="text-blue-600 flex-shrink-0" size={16} />
                      <span className="text-blue-800">{feature.label}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Start Session Button */}
          <Button
            onClick={handleStartSession}
            className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 mb-4"
          >
            Start Emotion Analysis Session
          </Button>

          {/* Skip Option */}
          <div className="text-center">
            <Button
              onClick={handleSkip}
              variant="link"
              className="text-gray-600 hover:text-gray-700 text-sm font-medium"
            >
              Skip and continue with standard questionnaire
            </Button>
          </div>

          {/* Important Notice */}
          <Card className="mt-6 bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-medium text-yellow-900 mb-1">Important Notice</h4>
                  <p className="text-sm text-yellow-800">
                    This feature is optional and experimental. It should not be used as a substitute for professional medical advice or diagnosis.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
}
