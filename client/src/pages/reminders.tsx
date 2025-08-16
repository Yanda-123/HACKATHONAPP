import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import MobileLayout from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Calendar,
  Pill,
  Edit,
  Play,
  Moon,
  Leaf,
  Heart,
  Flame,
  Clock,
  TrendingUp
} from "lucide-react";
import { useLocation } from "wouter";

export default function Reminders() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

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

  const { data: reminders, isLoading: remindersLoading } = useQuery({
    queryKey: ["/api/reminders"],
    retry: false,
  });

  const { data: meditationSessions } = useQuery({
    queryKey: ["/api/meditation/sessions"],
    retry: false,
  });

  const { data: featuredMeditation } = useQuery({
    queryKey: ["/api/meditation/featured"],
    retry: false,
  });

  const { data: progress } = useQuery({
    queryKey: ["/api/progress"],
    retry: false,
  });

  const playMeditationMutation = useMutation({
    mutationFn: async (duration: number) => {
      const response = await apiRequest("POST", "/api/progress/meditation", { duration });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      toast({
        title: "Great job!",
        description: "Meditation session completed.",
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
      console.error("Error updating progress:", error);
    },
  });

  const handlePlayMeditation = (duration: number = 10) => {
    // Simulate meditation session completion
    playMeditationMutation.mutate(duration);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;
  }

  // Mock data if not available
  const mockReminders = [
    {
      id: "1",
      title: "Dr. Sarah Johnson Consultation",
      reminderTime: new Date(Date.now() + 3600000), // 1 hour from now
      type: "appointment",
    },
    {
      id: "2", 
      title: "Take Daily Vitamin",
      reminderTime: new Date(Date.now() + 86400000), // Tomorrow
      type: "medication",
    },
  ];

  const mockMeditationCategories = [
    { id: "sleep", title: "Sleep", icon: Moon, count: 12, color: "blue" },
    { id: "anxiety", title: "Anxiety", icon: Leaf, count: 8, color: "green" },
    { id: "self-love", title: "Self-Love", icon: Heart, count: 6, color: "purple" },
    { id: "focus", title: "Focus", icon: Flame, count: 10, color: "red" },
  ];

  const displayReminders = reminders?.length ? reminders : mockReminders;
  const displayProgress = progress || { streak: 7, totalSessions: 23, totalMinutes: 340 };

  const getIconForReminderType = (type: string) => {
    switch (type) {
      case "appointment":
        return Calendar;
      case "medication":
        return Pill;
      default:
        return Calendar;
    }
  };

  const getColorForCategory = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-600";
      case "green":
        return "bg-green-100 text-green-600";
      case "purple":
        return "bg-purple-100 text-purple-600";
      case "red":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <MobileLayout>
      <div className="max-w-lg mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-6 text-white">
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
              <h2 className="text-xl font-bold">Wellness Hub</h2>
              <p className="text-orange-100 text-sm">Reminders & meditation</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Upcoming Reminders */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Upcoming Reminders</h3>
            {remindersLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-12 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : displayReminders.length > 0 ? (
              <div className="space-y-3">
                {displayReminders.map((reminder: any) => {
                  const IconComponent = getIconForReminderType(reminder.type);
                  return (
                    <Card key={reminder.id} className="border border-gray-200 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            reminder.type === 'appointment' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            <IconComponent className={
                              reminder.type === 'appointment' ? 'text-blue-600' : 'text-green-600'
                            } size={20} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{reminder.title}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(reminder.reminderTime).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                            <Edit size={16} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border border-gray-200">
                <CardContent className="p-6 text-center">
                  <Clock className="text-gray-400 mx-auto mb-2" size={32} />
                  <p className="text-gray-500">No upcoming reminders</p>
                  <p className="text-sm text-gray-400">Your reminders will appear here</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Meditation Library */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Meditation Library</h3>
              <Button variant="link" className="text-orange-600 hover:text-orange-700 text-sm font-medium p-0">
                View All
              </Button>
            </div>
            
            {/* Featured Meditation */}
            <Card className="mb-4">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-lg p-6 text-white">
                  <div className="w-full h-32 bg-white bg-opacity-20 rounded-xl mb-4 flex items-center justify-center">
                    <div className="text-center">
                      <Heart className="mx-auto mb-2" size={32} />
                      <p className="text-xs opacity-80">Featured Session</p>
                    </div>
                  </div>
                  <h4 className="text-lg font-bold mb-2">
                    {featuredMeditation?.title || "Morning Mindfulness"}
                  </h4>
                  <p className="text-orange-100 text-sm mb-4">
                    {featuredMeditation?.description || "Start your day with clarity and intention"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{featuredMeditation?.duration || 10} minutes</span>
                    <Button
                      onClick={() => handlePlayMeditation(featuredMeditation?.duration || 10)}
                      disabled={playMeditationMutation.isPending}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium"
                      size="sm"
                    >
                      <Play size={16} className="mr-2" />
                      {playMeditationMutation.isPending ? "Playing..." : "Play"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meditation Categories */}
            <div className="grid grid-cols-2 gap-4">
              {mockMeditationCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Card key={category.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className={`w-12 h-12 ${getColorForCategory(category.color)} rounded-xl flex items-center justify-center mb-3`}>
                        <IconComponent size={20} />
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{category.title}</h4>
                      <p className="text-sm text-gray-600">{category.count} sessions</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Progress Tracking */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <TrendingUp className="mr-2 text-orange-600" size={20} />
                Your Progress
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Meditation streak</span>
                  <span className="font-medium">{displayProgress.streak} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total sessions</span>
                  <span className="font-medium">{displayProgress.totalSessions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Minutes practiced</span>
                  <span className="font-medium">{displayProgress.totalMinutes} min</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
}
