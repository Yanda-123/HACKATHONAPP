import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import MobileLayout from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Star,
  Clock,
  Video,
  AlertTriangle,
  Phone,
  Calendar,
  CheckCircle2,
  User
} from "lucide-react";
import { useLocation } from "wouter";

export default function VideoConsultation() {
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

  const { data: appointments } = useQuery({
    queryKey: ["/api/appointments"],
    retry: false,
  });

  const bookConsultationMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await apiRequest("POST", "/api/appointments", appointmentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Video consultation booked successfully!",
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
        description: "Failed to book consultation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBookConsultation = (timeSlot: string, date: Date) => {
    bookConsultationMutation.mutate({
      doctorName: "Dr. Sarah Johnson",
      appointmentDate: date.toISOString(),
      type: "video",
      duration: 45,
      notes: `Video consultation scheduled for ${timeSlot}`,
    });
  };

  const handleEmergencyContact = () => {
    // In a real app, this would connect to emergency services
    toast({
      title: "Emergency Support",
      description: "In a real emergency, please call your local emergency number.",
    });
  };

  if (isLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;
  }

  // Mock time slots
  const todaySlots = [
    { time: "2:00 PM", available: true },
    { time: "4:00 PM", available: true },
    { time: "6:00 PM", available: false },
  ];

  const tomorrowSlots = [
    { time: "10:00 AM", available: true },
    { time: "2:00 PM", available: true },
    { time: "4:00 PM", available: true },
  ];

  const psychiatrist = {
    name: "Dr. Sarah Johnson",
    title: "Clinical Psychiatrist",
    rating: "4.9",
    experience: "8 years exp.",
    specialties: "Specializes in anxiety, depression, and women's mental health",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  };

  const getSlotDate = (isToday: boolean, time: string) => {
    const date = new Date();
    if (!isToday) {
      date.setDate(date.getDate() + 1);
    }
    
    const [timeStr, period] = time.split(' ');
    const [hours, minutes] = timeStr.split(':').map(Number);
    const adjustedHours = period === 'PM' && hours !== 12 ? hours + 12 : hours === 12 && period === 'AM' ? 0 : hours;
    
    date.setHours(adjustedHours, minutes || 0, 0, 0);
    return date;
  };

  return (
    <MobileLayout>
      <div className="max-w-lg mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-6 text-white">
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
              <h2 className="text-xl font-bold">Video Consultation</h2>
              <p className="text-red-100 text-sm">Connect with professionals</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Your Psychiatrist */}
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  <User className="text-gray-400" size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-red-900">{psychiatrist.name}</h3>
                  <p className="text-red-700 text-sm">{psychiatrist.title}</p>
                  <div className="flex items-center text-sm text-red-600 mt-1">
                    <Star className="text-yellow-500 mr-1" size={16} fill="currentColor" />
                    <span>{psychiatrist.rating}</span>
                    <span className="mx-2">•</span>
                    <span>{psychiatrist.experience}</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mb-1"></div>
                  <span className="text-xs text-red-700">Available</span>
                </div>
              </div>
              <p className="text-sm text-red-800">{psychiatrist.specialties}</p>
            </CardContent>
          </Card>

          {/* Available Slots */}
          <h3 className="font-semibold text-gray-900 mb-4">Available This Week</h3>
          <div className="space-y-4 mb-6">
            {/* Today */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {todaySlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={slot.available ? "outline" : "secondary"}
                    disabled={!slot.available || bookConsultationMutation.isPending}
                    onClick={() => slot.available && handleBookConsultation(slot.time, getSlotDate(true, slot.time))}
                    className={`text-center py-3 rounded-lg text-sm transition-colors ${
                      slot.available 
                        ? 'border-gray-300 hover:border-red-500 hover:bg-red-50' 
                        : 'bg-gray-100 border-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{slot.time}</div>
                      <div className="text-xs text-gray-500">
                        {slot.available ? 'Available' : 'Booked'}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Tomorrow */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Tomorrow, {new Date(Date.now() + 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {tomorrowSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant="outline"
                    disabled={bookConsultationMutation.isPending}
                    onClick={() => handleBookConsultation(slot.time, getSlotDate(false, slot.time))}
                    className="text-center py-3 rounded-lg text-sm transition-colors border-gray-300 hover:border-red-500 hover:bg-red-50"
                  >
                    <div>
                      <div className="font-medium">{slot.time}</div>
                      <div className="text-xs text-gray-500">Available</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Consultation Details */}
          <Card className="mb-6 bg-gray-50">
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">Session Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Clock size={16} className="mr-2" />
                    Duration:
                  </span>
                  <span className="font-medium">45 minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Video size={16} className="mr-2" />
                    Type:
                  </span>
                  <span className="font-medium">Video Call</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <CheckCircle2 size={16} className="mr-2" />
                    Cost:
                  </span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="text-orange-600 flex-shrink-0" size={20} />
                <div className="flex-1">
                  <h4 className="font-medium text-orange-900">Need immediate help?</h4>
                  <p className="text-sm text-orange-700">Contact our 24/7 crisis hotline</p>
                </div>
                <Button
                  onClick={handleEmergencyContact}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-medium"
                >
                  <Phone size={16} className="mr-1" />
                  Call Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Video Consultations */}
          {appointments && appointments.filter((apt: any) => apt.type === 'video').length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-gray-900 mb-4">Your Video Consultations</h3>
              <div className="space-y-3">
                {appointments
                  .filter((apt: any) => apt.type === 'video')
                  .slice(0, 3)
                  .map((appointment: any) => (
                    <Card key={appointment.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {appointment.doctorName || "Video Consultation"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short', 
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.status === 'scheduled' 
                                ? 'bg-blue-100 text-blue-800'
                                : appointment.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status}
                            </span>
                            {appointment.status === 'scheduled' && (
                              <Button size="sm" variant="outline">
                                <Video size={16} className="mr-1" />
                                Join
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
