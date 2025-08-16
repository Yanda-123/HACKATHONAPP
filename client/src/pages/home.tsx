import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import MobileLayout from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CalendarPlus, 
  MessageCircle, 
  ClipboardList, 
  Video, 
  Bell, 
  Smile,
  Check,
  Calendar,
  User,
  ChevronRight
} from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

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

  const { data: appointments } = useQuery({
    queryKey: ["/api/appointments"],
    retry: false,
  });

  const { data: progress } = useQuery({
    queryKey: ["/api/progress"],
    retry: false,
  });

  const { data: latestQuestionnaire } = useQuery({
    queryKey: ["/api/questionnaire/latest"],
    retry: false,
  });

  if (isLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;
  }

  const nextAppointment = appointments?.[0];
  const wellnessScore = latestQuestionnaire?.riskScore 
    ? ((100 - latestQuestionnaire.riskScore) / 10).toFixed(1)
    : "8.5";

  return (
    <MobileLayout>
      <div className="max-w-lg mx-auto bg-white min-h-screen">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-6 py-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">
                Hello, {user?.firstName || "there"}
              </h2>
              <p className="text-primary-100">How are you feeling today?</p>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="text-white" size={24} />
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white bg-opacity-20 rounded-xl p-4">
              <p className="text-primary-100 text-sm">Next Appointment</p>
              <p className="font-semibold">
                {nextAppointment 
                  ? new Date(nextAppointment.appointmentDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })
                  : "None scheduled"
                }
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-xl p-4">
              <p className="text-primary-100 text-sm">Wellness Score</p>
              <p className="font-semibold">{wellnessScore}/10</p>
            </div>
          </div>
        </div>

        {/* Main Features Grid */}
        <div className="p-6 space-y-6">
          {/* Primary Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => navigate("/appointments")}
              variant="outline"
              className="h-auto p-6 flex flex-col items-center space-y-3 border-gray-200 hover:shadow-md transition-all duration-200 transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CalendarPlus className="text-blue-600" size={24} />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-1">Book Appointment</h3>
                <p className="text-sm text-gray-500">Find nearby clinics</p>
              </div>
            </Button>

            <Button
              onClick={() => navigate("/chatbot")}
              variant="outline"
              className="h-auto p-6 flex flex-col items-center space-y-3 border-gray-200 hover:shadow-md transition-all duration-200 transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <MessageCircle className="text-green-600" size={24} />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-1">Mental Health Chat</h3>
                <p className="text-sm text-gray-500">Get support now</p>
              </div>
            </Button>

            <Button
              onClick={() => navigate("/questionnaire")}
              variant="outline"
              className="h-auto p-6 flex flex-col items-center space-y-3 border-gray-200 hover:shadow-md transition-all duration-200 transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <ClipboardList className="text-purple-600" size={24} />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-1">AI Assessment</h3>
                <p className="text-sm text-gray-500">Quick health check</p>
              </div>
            </Button>

            <Button
              onClick={() => navigate("/video-consultation")}
              variant="outline"
              className="h-auto p-6 flex flex-col items-center space-y-3 border-gray-200 hover:shadow-md transition-all duration-200 transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Video className="text-red-600" size={24} />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-1">Video Consult</h3>
                <p className="text-sm text-gray-500">Talk to an expert</p>
              </div>
            </Button>
          </div>

          {/* Secondary Features */}
          <div className="space-y-4">
            <Button
              onClick={() => navigate("/reminders")}
              variant="outline"
              className="w-full h-auto p-4 flex items-center space-x-4 border-gray-200 hover:shadow-md transition-all duration-200"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Bell className="text-orange-600" size={24} />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900">Reminders & Meditation</h3>
                <p className="text-sm text-gray-500">Track wellness activities</p>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </Button>

            <Button
              onClick={() => navigate("/facial-recognition")}
              variant="outline"
              className="w-full h-auto p-4 flex items-center space-x-4 border-gray-200 hover:shadow-md transition-all duration-200"
            >
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <Smile className="text-pink-600" size={24} />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900">AI Emotion Check</h3>
                <p className="text-sm text-gray-500">Optional mood analysis</p>
              </div>
              <ChevronRight className="text-gray-400" size={20} />
            </Button>
          </div>

          {/* Recent Activity */}
          <Card className="bg-gray-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {latestQuestionnaire && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="text-green-600" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Completed wellness check</p>
                      <p className="text-xs text-gray-500">
                        {new Date(latestQuestionnaire.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {nextAppointment && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="text-blue-600" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Appointment scheduled</p>
                      <p className="text-xs text-gray-500">
                        {new Date(nextAppointment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {progress && progress.totalSessions > 0 && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Smile className="text-purple-600" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Meditation session completed</p>
                      <p className="text-xs text-gray-500">
                        {progress.lastMeditationDate ? 
                          new Date(progress.lastMeditationDate).toLocaleDateString() :
                          "Recently"
                        }
                      </p>
                    </div>
                  </div>
                )}
                {!latestQuestionnaire && !nextAppointment && (!progress || progress.totalSessions === 0) && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No recent activity</p>
                    <p className="text-xs text-gray-400">Start your wellness journey today!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
}
