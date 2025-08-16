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
  MapPin, 
  RefreshCw, 
  Star, 
  Circle, 
  Map,
  Calendar,
  Clock
} from "lucide-react";
import { useLocation } from "wouter";

export default function Appointments() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
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

  const { data: clinics, isLoading: clinicsLoading } = useQuery({
    queryKey: ["/api/clinics"],
    retry: false,
  });

  const { data: appointments } = useQuery({
    queryKey: ["/api/appointments"],
    retry: false,
  });

  const bookAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      await apiRequest("POST", "/api/appointments", appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Appointment booked successfully!",
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
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBookAppointment = (clinicId: string, clinicName: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // 2:00 PM

    bookAppointmentMutation.mutate({
      clinicId,
      appointmentDate: tomorrow.toISOString(),
      type: "clinic",
      notes: `Appointment at ${clinicName}`,
    });
  };

  if (isLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;
  }

  // Mock clinics data if not available
  const mockClinics = [
    {
      id: "1",
      name: "Greenpoint Medical Centre",
      address: "123 Main St, Greenpoint",
      distance: "2.3 km away",
      rating: "4.8",
      isOpen: true,
    },
    {
      id: "2", 
      name: "Seapoint Health Clinic",
      address: "456 Ocean Rd, Sea Point",
      distance: "3.1 km away",
      rating: "4.6",
      isOpen: true,
    },
    {
      id: "3",
      name: "Community Care Center",
      address: "789 High St, Observatory",
      distance: "4.2 km away", 
      rating: "4.4",
      isOpen: false,
    }
  ];

  const displayClinics = clinics?.length ? clinics : mockClinics;

  return (
    <MobileLayout>
      <div className="max-w-lg mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-6 text-white">
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
              <h2 className="text-xl font-bold">Book Appointment</h2>
              <p className="text-blue-100 text-sm">Find nearby clinics</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Location Banner */}
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <MapPin className="text-blue-600" size={20} />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">Current Location</p>
                  <p className="text-sm text-blue-700">
                    {user?.location || "Cape Town, Western Cape"}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <RefreshCw size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Nearby Clinics */}
          <h3 className="font-semibold text-gray-900 mb-4">Nearby Clinics</h3>
          
          {clinicsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-32 bg-gray-200 rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {displayClinics.map((clinic: any) => (
                <Card key={clinic.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    {/* Mock clinic image */}
                    <div className="w-full h-32 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg mb-3 flex items-center justify-center">
                      <div className="text-blue-600 text-center">
                        <Calendar size={24} className="mx-auto mb-1" />
                        <p className="text-xs">Clinic Image</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{clinic.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{clinic.address}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className={`flex items-center ${clinic.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                            <Circle className="w-2 h-2 mr-1" fill="currentColor" />
                            {clinic.isOpen ? 'Open' : 'Closed'}
                          </span>
                          <span className="text-gray-500">{clinic.distance}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-yellow-500 mb-1">
                          <Star className="w-4 h-4 mr-1" fill="currentColor" />
                          <span className="text-sm font-medium">{clinic.rating}</span>
                        </div>
                        <Button
                          onClick={() => handleBookAppointment(clinic.id, clinic.name)}
                          disabled={!clinic.isOpen || bookAppointmentMutation.isPending}
                          size="sm"
                          className="text-xs"
                        >
                          {bookAppointmentMutation.isPending ? (
                            <>
                              <Clock size={12} className="mr-1" />
                              Booking...
                            </>
                          ) : clinic.isOpen ? (
                            "Book Now"
                          ) : (
                            "Closed"
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Map View Toggle */}
          <Button 
            variant="outline"
            className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Map size={16} />
            <span>View on Map</span>
          </Button>

          {/* Existing Appointments */}
          {appointments && appointments.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-gray-900 mb-4">Your Appointments</h3>
              <div className="space-y-3">
                {appointments.slice(0, 3).map((appointment: any) => (
                  <Card key={appointment.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {appointment.doctorName || "Clinic Visit"}
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'scheduled' 
                            ? 'bg-green-100 text-green-800'
                            : appointment.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status}
                        </span>
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
