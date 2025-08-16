import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import MobileLayout from "@/components/layout/mobile-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  MapPin, 
  RefreshCw, 
  Star, 
  Circle, 
  Map,
  Calendar,
  Clock,
  ArrowRight,
  FileText,
  Heart
} from "lucide-react";
import { useLocation } from "wouter";

interface HealthScreeningData {
  personalHealth: {
    age: string;
    height: string;
    weight: string;
    chronicConditions: string;
    chronicConditionsDetails: string;
    medications: string;
    medicationsDetails: string;
    familyHistory: string[];
  };
  lifestyle: {
    exercise: string;
    diet: string;
    alcohol: string;
    alcoholDetails: string;
    smoking: string;
    sleep: string;
  };
  screenings: {
    papSmear: string;
    papSmearDate: string;
    mammogram: string;
    mammogramDate: string;
    bloodWork: string;
    vaccinations: string;
    vaccinationsDetails: string;
  };
  mentalHealth: {
    stress: string;
    mentalHealthScreening: string;
    mentalHealthSupport: string;
  };
  reproductive: {
    pregnancy: string;
    prenatalVitamins: string;
    contraceptives: string;
  };
  goals: {
    concerns: string[];
    preventiveAppointments: string;
  };
}

export default function Appointments() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [showHealthScreening, setShowHealthScreening] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [healthData, setHealthData] = useState<HealthScreeningData>({
    personalHealth: {
      age: '',
      height: '',
      weight: '',
      chronicConditions: '',
      chronicConditionsDetails: '',
      medications: '',
      medicationsDetails: '',
      familyHistory: [],
    },
    lifestyle: {
      exercise: '',
      diet: '',
      alcohol: '',
      alcoholDetails: '',
      smoking: '',
      sleep: '',
    },
    screenings: {
      papSmear: '',
      papSmearDate: '',
      mammogram: '',
      mammogramDate: '',
      bloodWork: '',
      vaccinations: '',
      vaccinationsDetails: '',
    },
    mentalHealth: {
      stress: '',
      mentalHealthScreening: '',
      mentalHealthSupport: '',
    },
    reproductive: {
      pregnancy: '',
      prenatalVitamins: '',
      contraceptives: '',
    },
    goals: {
      concerns: [],
      preventiveAppointments: '',
    },
  });

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

  const handleStartBooking = (clinic: any) => {
    setSelectedClinic(clinic);
    setShowHealthScreening(true);
    setCurrentStep(0);
  };

  const handleCompleteBooking = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // 2:00 PM

    bookAppointmentMutation.mutate({
      clinicId: selectedClinic.id,
      appointmentDate: tomorrow.toISOString(),
      type: "clinic",
      notes: `Appointment at ${selectedClinic.name} - Health screening completed`,
      healthScreeningData: healthData,
    });
    
    setShowHealthScreening(false);
    setSelectedClinic(null);
  };

  const updateHealthData = (section: keyof HealthScreeningData, field: string, value: any) => {
    setHealthData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      }
    }));
  };

  const handleCheckboxChange = (section: keyof HealthScreeningData, field: string, value: string, checked: boolean) => {
    const currentValues = (healthData[section] as any)[field] || [];
    const newValues = checked 
      ? [...currentValues, value]
      : currentValues.filter((v: string) => v !== value);
    
    updateHealthData(section, field, newValues);
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

  // Health screening info card component
  const HealthScreeningInfo = () => (
    <Card className="mb-6 bg-blue-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Heart className="text-blue-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Health Screening Required
            </h3>
            <p className="text-blue-800 text-sm mb-4">
              To provide you with the best personalized care, we need to understand your health background before your clinic appointment.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FileText className="text-blue-600" size={16} />
                <span className="text-blue-700 text-sm">Personal health history & lifestyle</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="text-blue-600" size={16} />
                <span className="text-blue-700 text-sm">Recent screenings & vaccinations</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="text-blue-600" size={16} />
                <span className="text-blue-700 text-sm">Mental health & wellness goals</span>
              </div>
            </div>
            <p className="text-blue-600 text-xs mt-4 italic">
              This information helps your healthcare provider prepare for your visit and give you the most effective care.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const healthScreeningSteps = [
    {
      title: "Personal Health & History",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Age</Label>
              <Input
                type="number"
                value={healthData.personalHealth.age}
                onChange={(e) => updateHealthData('personalHealth', 'age', e.target.value)}
                placeholder="Age"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Height (cm)</Label>
              <Input
                type="number"
                value={healthData.personalHealth.height}
                onChange={(e) => updateHealthData('personalHealth', 'height', e.target.value)}
                placeholder="cm"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Weight (kg)</Label>
              <Input
                type="number"
                value={healthData.personalHealth.weight}
                onChange={(e) => updateHealthData('personalHealth', 'weight', e.target.value)}
                placeholder="kg"
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Do you have any chronic medical conditions?</Label>
            <RadioGroup value={healthData.personalHealth.chronicConditions} onValueChange={(value) => updateHealthData('personalHealth', 'chronicConditions', value)}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="yes" id="chronic-yes" />
                <Label htmlFor="chronic-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="no" id="chronic-no" />
                <Label htmlFor="chronic-no">No</Label>
              </div>
            </RadioGroup>
            {healthData.personalHealth.chronicConditions === 'yes' && (
              <Input
                value={healthData.personalHealth.chronicConditionsDetails}
                onChange={(e) => updateHealthData('personalHealth', 'chronicConditionsDetails', e.target.value)}
                placeholder="Please specify"
                className="mt-3 w-full p-3 border border-gray-300 rounded-lg"
              />
            )}
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Are you currently taking any medications or supplements?</Label>
            <RadioGroup value={healthData.personalHealth.medications} onValueChange={(value) => updateHealthData('personalHealth', 'medications', value)}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="yes" id="meds-yes" />
                <Label htmlFor="meds-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="no" id="meds-no" />
                <Label htmlFor="meds-no">No</Label>
              </div>
            </RadioGroup>
            {healthData.personalHealth.medications === 'yes' && (
              <Textarea
                value={healthData.personalHealth.medicationsDetails}
                onChange={(e) => updateHealthData('personalHealth', 'medicationsDetails', e.target.value)}
                placeholder="Please list medications and supplements"
                className="mt-3 w-full p-3 border border-gray-300 rounded-lg"
                rows={3}
              />
            )}
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Do you have a family history of any of the following? (Check all that apply)</Label>
            <div className="space-y-2">
              {['Diabetes', 'Hypertension', 'Heart disease', 'Cancer', 'Mental health disorders', 'None'].map((condition) => (
                <div key={condition} className="flex items-center space-x-3">
                  <Checkbox
                    id={condition}
                    checked={healthData.personalHealth.familyHistory.includes(condition)}
                    onCheckedChange={(checked) => handleCheckboxChange('personalHealth', 'familyHistory', condition, checked as boolean)}
                  />
                  <Label htmlFor={condition} className="text-gray-700">{condition}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Lifestyle & Habits",
      content: (
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">How often do you exercise?</Label>
            <RadioGroup value={healthData.lifestyle.exercise} onValueChange={(value) => updateHealthData('lifestyle', 'exercise', value)}>
              {['Daily', '3–5 times/week', '1–2 times/week', 'Rarely', 'Never'].map((option) => (
                <div key={option} className="flex items-center space-x-3">
                  <RadioGroupItem value={option} id={`exercise-${option}`} />
                  <Label htmlFor={`exercise-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">How would you rate your diet?</Label>
            <RadioGroup value={healthData.lifestyle.diet} onValueChange={(value) => updateHealthData('lifestyle', 'diet', value)}>
              {['Balanced and healthy', 'Mostly healthy', 'Occasionally unhealthy', 'Mostly unhealthy'].map((option) => (
                <div key={option} className="flex items-center space-x-3">
                  <RadioGroupItem value={option} id={`diet-${option}`} />
                  <Label htmlFor={`diet-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Do you consume alcohol?</Label>
            <RadioGroup value={healthData.lifestyle.alcohol} onValueChange={(value) => updateHealthData('lifestyle', 'alcohol', value)}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="yes" id="alcohol-yes" />
                <Label htmlFor="alcohol-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="no" id="alcohol-no" />
                <Label htmlFor="alcohol-no">No</Label>
              </div>
            </RadioGroup>
            {healthData.lifestyle.alcohol === 'yes' && (
              <Input
                value={healthData.lifestyle.alcoholDetails}
                onChange={(e) => updateHealthData('lifestyle', 'alcoholDetails', e.target.value)}
                placeholder="Frequency/Quantity"
                className="mt-3 w-full p-3 border border-gray-300 rounded-lg"
              />
            )}
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Do you smoke or use tobacco products?</Label>
            <RadioGroup value={healthData.lifestyle.smoking} onValueChange={(value) => updateHealthData('lifestyle', 'smoking', value)}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="yes" id="smoking-yes" />
                <Label htmlFor="smoking-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="no" id="smoking-no" />
                <Label htmlFor="smoking-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">How many hours of sleep do you get per night on average?</Label>
            <Input
              type="number"
              value={healthData.lifestyle.sleep}
              onChange={(e) => updateHealthData('lifestyle', 'sleep', e.target.value)}
              placeholder="Hours"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      )
    },
    {
      title: "Screenings & Vaccinations",
      content: (
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Have you had a Pap smear or cervical cancer screening?</Label>
            <RadioGroup value={healthData.screenings.papSmear} onValueChange={(value) => updateHealthData('screenings', 'papSmear', value)}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="yes" id="pap-yes" />
                <Label htmlFor="pap-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="no" id="pap-no" />
                <Label htmlFor="pap-no">No</Label>
              </div>
            </RadioGroup>
            {healthData.screenings.papSmear === 'yes' && (
              <Input
                value={healthData.screenings.papSmearDate}
                onChange={(e) => updateHealthData('screenings', 'papSmearDate', e.target.value)}
                placeholder="When was your last test?"
                className="mt-3 w-full p-3 border border-gray-300 rounded-lg"
              />
            )}
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Have you had a mammogram or breast exam?</Label>
            <RadioGroup value={healthData.screenings.mammogram} onValueChange={(value) => updateHealthData('screenings', 'mammogram', value)}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="yes" id="mammo-yes" />
                <Label htmlFor="mammo-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="no" id="mammo-no" />
                <Label htmlFor="mammo-no">No</Label>
              </div>
            </RadioGroup>
            {healthData.screenings.mammogram === 'yes' && (
              <Input
                value={healthData.screenings.mammogramDate}
                onChange={(e) => updateHealthData('screenings', 'mammogramDate', e.target.value)}
                placeholder="When was your last test?"
                className="mt-3 w-full p-3 border border-gray-300 rounded-lg"
              />
            )}
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Have you had your blood pressure, cholesterol, or blood sugar checked in the last year?</Label>
            <RadioGroup value={healthData.screenings.bloodWork} onValueChange={(value) => updateHealthData('screenings', 'bloodWork', value)}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="yes" id="blood-yes" />
                <Label htmlFor="blood-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="no" id="blood-no" />
                <Label htmlFor="blood-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Are your vaccinations up to date (flu, tetanus, COVID-19, HPV, etc.)?</Label>
            <RadioGroup value={healthData.screenings.vaccinations} onValueChange={(value) => updateHealthData('screenings', 'vaccinations', value)}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="yes" id="vacc-yes" />
                <Label htmlFor="vacc-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="no" id="vacc-no" />
                <Label htmlFor="vacc-no">No</Label>
              </div>
            </RadioGroup>
            {healthData.screenings.vaccinations === 'no' && (
              <Input
                value={healthData.screenings.vaccinationsDetails}
                onChange={(e) => updateHealthData('screenings', 'vaccinationsDetails', e.target.value)}
                placeholder="If no, specify which"
                className="mt-3 w-full p-3 border border-gray-300 rounded-lg"
              />
            )}
          </div>
        </div>
      )
    },
    {
      title: "Mental & Emotional Wellbeing",
      content: (
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Do you experience frequent stress, anxiety, or low mood?</Label>
            <RadioGroup value={healthData.mentalHealth.stress} onValueChange={(value) => updateHealthData('mentalHealth', 'stress', value)}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="yes" id="stress-yes" />
                <Label htmlFor="stress-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="no" id="stress-no" />
                <Label htmlFor="stress-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Have you had a mental health screening in the past year?</Label>
            <RadioGroup value={healthData.mentalHealth.mentalHealthScreening} onValueChange={(value) => updateHealthData('mentalHealth', 'mentalHealthScreening', value)}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="yes" id="screen-yes" />
                <Label htmlFor="screen-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="no" id="screen-no" />
                <Label htmlFor="screen-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Are you currently receiving mental health support?</Label>
            <RadioGroup value={healthData.mentalHealth.mentalHealthSupport} onValueChange={(value) => updateHealthData('mentalHealth', 'mentalHealthSupport', value)}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="yes" id="support-yes" />
                <Label htmlFor="support-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="no" id="support-no" />
                <Label htmlFor="support-no">No</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    },
    {
      title: "Reproductive & Maternal Health",
      content: (
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Are you currently pregnant or planning pregnancy?</Label>
            <RadioGroup value={healthData.reproductive.pregnancy} onValueChange={(value) => updateHealthData('reproductive', 'pregnancy', value)}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="yes" id="pregnant-yes" />
                <Label htmlFor="pregnant-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="no" id="pregnant-no" />
                <Label htmlFor="pregnant-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Do you take prenatal vitamins or supplements?</Label>
            <RadioGroup value={healthData.reproductive.prenatalVitamins} onValueChange={(value) => updateHealthData('reproductive', 'prenatalVitamins', value)}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="yes" id="prenatal-yes" />
                <Label htmlFor="prenatal-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="no" id="prenatal-no" />
                <Label htmlFor="prenatal-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Are you using any contraceptive methods?</Label>
            <RadioGroup value={healthData.reproductive.contraceptives} onValueChange={(value) => updateHealthData('reproductive', 'contraceptives', value)}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="yes" id="contraceptive-yes" />
                <Label htmlFor="contraceptive-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="no" id="contraceptive-no" />
                <Label htmlFor="contraceptive-no">No</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    },
    {
      title: "Goals & Follow-Up",
      content: (
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">What preventive health areas are you most concerned about? (Check all that apply)</Label>
            <div className="space-y-2">
              {['Physical Health', 'Mental Health', 'Reproductive Health', 'Nutrition', 'Exercise'].map((concern) => (
                <div key={concern} className="flex items-center space-x-3">
                  <Checkbox
                    id={concern}
                    checked={healthData.goals.concerns.includes(concern)}
                    onCheckedChange={(checked) => handleCheckboxChange('goals', 'concerns', concern, checked as boolean)}
                  />
                  <Label htmlFor={concern} className="text-gray-700">{concern}</Label>
                </div>
              ))}
              <div className="flex items-center space-x-3">
                <Checkbox id="other-concern" />
                <Input placeholder="Other" className="flex-1 p-2 border border-gray-300 rounded" />
              </div>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Are you interested in scheduling preventive care appointments through the app?</Label>
            <RadioGroup value={healthData.goals.preventiveAppointments} onValueChange={(value) => updateHealthData('goals', 'preventiveAppointments', value)}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="yes" id="preventive-yes" />
                <Label htmlFor="preventive-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="no" id="preventive-no" />
                <Label htmlFor="preventive-no">No</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    }
  ];

  if (showHealthScreening) {
    return (
      <MobileLayout>
        <div className="max-w-lg mx-auto bg-white min-h-screen">
          {/* Health Screening Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-6 text-white">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHealthScreening(false)}
                className="p-2 -ml-2 hover:bg-white hover:bg-opacity-20 rounded-lg text-white hover:text-white"
              >
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h2 className="text-xl font-bold">Health Screening</h2>
                <p className="text-green-100 text-sm">For {selectedClinic?.name}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-500">
                  {currentStep + 1} of {healthScreeningSteps.length}
                </span>
              </div>
              <Progress value={((currentStep + 1) / healthScreeningSteps.length) * 100} className="w-full h-2" />
            </div>

            {/* Current Step */}
            <Card className="mb-6 bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <FileText className="text-green-600" size={24} />
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">
                      {healthScreeningSteps[currentStep].title}
                    </h3>
                    <p className="text-green-700 text-sm">
                      Please complete all relevant fields
                    </p>
                  </div>
                </div>
                
                {healthScreeningSteps[currentStep].content}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 0}
                variant="outline"
                className="px-6 py-3 rounded-xl font-medium"
              >
                <ArrowLeft size={16} className="mr-2" />
                Previous
              </Button>
              <Button
                onClick={() => {
                  if (currentStep === healthScreeningSteps.length - 1) {
                    handleCompleteBooking();
                  } else {
                    setCurrentStep(prev => prev + 1);
                  }
                }}
                disabled={bookAppointmentMutation.isPending}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-medium"
              >
                {bookAppointmentMutation.isPending ? (
                  "Booking..."
                ) : currentStep === healthScreeningSteps.length - 1 ? (
                  "Complete Booking"
                ) : (
                  <>
                    Next
                    <ArrowRight size={16} className="ml-2" />
                  </>
                )}
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
          
          <HealthScreeningInfo />
          
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
                          onClick={() => handleStartBooking(clinic)}
                          disabled={!clinic.isOpen}
                          size="sm"
                          className="text-xs"
                        >
                          {clinic.isOpen ? (
                            <>
                              <Heart size={12} className="mr-1" />
                              Book Now
                            </>
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
