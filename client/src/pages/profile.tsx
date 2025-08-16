import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { 
  ArrowLeft, 
  User,
  CheckCircle2,
  Save
} from "lucide-react";
import { useLocation } from "wouter";

interface ProfileData {
  personalInfo: {
    fullName: string;
    age: string;
    gender: string;
    occupation: string;
    phoneNumber: string;
    location: string;
  };
  livingInfo: {
    livingSituation: string;
    supportSystem: string[];
  };
  healthInfo: {
    primaryConcerns: string[];
    healthGoals: string;
    emergencyContact: string;
  };
}

export default function Profile() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [currentSection, setCurrentSection] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData>({
    personalInfo: {
      fullName: "",
      age: "",
      gender: "",
      occupation: "",
      phoneNumber: "",
      location: "",
    },
    livingInfo: {
      livingSituation: "",
      supportSystem: [],
    },
    healthInfo: {
      primaryConcerns: [],
      healthGoals: "",
      emergencyContact: "",
    }
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

  // Load existing profile data
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          phoneNumber: user.phoneNumber || '',
          location: user.location || '',
        }
      }));
    }
  }, [user]);

  const saveProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PATCH", "/api/auth/user", {
        firstName: data.personalInfo.fullName.split(' ')[0],
        lastName: data.personalInfo.fullName.split(' ').slice(1).join(' '),
        phoneNumber: data.personalInfo.phoneNumber,
        location: data.personalInfo.location,
        profileData: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      navigate("/");
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
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (section: keyof ProfileData, field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      }
    }));
  };

  const handleCheckboxChange = (section: keyof ProfileData, field: string, value: string, checked: boolean) => {
    const currentValues = (profileData[section] as any)[field] || [];
    const newValues = checked 
      ? [...currentValues, value]
      : currentValues.filter((v: string) => v !== value);
    
    handleInputChange(section, field, newValues);
  };

  const sections = [
    {
      title: "Personal Information",
      description: "Basic details about yourself",
      content: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 mb-2 block">
              Full Name *
            </Label>
            <Input
              id="fullName"
              value={profileData.personalInfo.fullName}
              onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
              placeholder="Enter your full name"
              className="w-full p-4 border border-purple-200 rounded-xl"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age" className="text-sm font-medium text-gray-700 mb-2 block">
                Age *
              </Label>
              <Input
                id="age"
                type="number"
                value={profileData.personalInfo.age}
                onChange={(e) => handleInputChange('personalInfo', 'age', e.target.value)}
                placeholder="Age"
                className="w-full p-4 border border-purple-200 rounded-xl"
              />
            </div>
            
            <div>
              <Label htmlFor="gender" className="text-sm font-medium text-gray-700 mb-2 block">
                Gender/Pronouns *
              </Label>
              <Input
                id="gender"
                value={profileData.personalInfo.gender}
                onChange={(e) => handleInputChange('personalInfo', 'gender', e.target.value)}
                placeholder="e.g., She/Her"
                className="w-full p-4 border border-purple-200 rounded-xl"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="occupation" className="text-sm font-medium text-gray-700 mb-2 block">
              Occupation
            </Label>
            <Input
              id="occupation"
              value={profileData.personalInfo.occupation}
              onChange={(e) => handleInputChange('personalInfo', 'occupation', e.target.value)}
              placeholder="Your occupation"
              className="w-full p-4 border border-purple-200 rounded-xl"
            />
          </div>
          
          <div>
            <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 mb-2 block">
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={profileData.personalInfo.phoneNumber}
              onChange={(e) => handleInputChange('personalInfo', 'phoneNumber', e.target.value)}
              placeholder="Your phone number"
              className="w-full p-4 border border-purple-200 rounded-xl"
            />
          </div>
          
          <div>
            <Label htmlFor="location" className="text-sm font-medium text-gray-700 mb-2 block">
              Location
            </Label>
            <Input
              id="location"
              value={profileData.personalInfo.location}
              onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
              placeholder="City, Province"
              className="w-full p-4 border border-purple-200 rounded-xl"
            />
          </div>
        </div>
      )
    },
    {
      title: "Living Situation",
      description: "Your current living arrangements",
      content: (
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-4 block">
              Living Situation
            </Label>
            <RadioGroup
              value={profileData.livingInfo.livingSituation}
              onValueChange={(value) => handleInputChange('livingInfo', 'livingSituation', value)}
              className="space-y-3"
            >
              {['alone', 'family', 'roommates', 'other'].map((option) => (
                <div key={option} className="flex items-center space-x-3 p-4 bg-white border border-purple-200 rounded-xl">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option} className="flex-1 text-gray-900 cursor-pointer capitalize">
                    {option === 'family' ? 'With Family' : option === 'roommates' ? 'With Roommates' : option.charAt(0).toUpperCase() + option.slice(1)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-4 block">
              Support System (select all that apply)
            </Label>
            <div className="space-y-3">
              {['friends', 'family', 'community', 'none'].map((option) => (
                <div key={option} className="flex items-center space-x-3 p-4 bg-white border border-purple-200 rounded-xl">
                  <Checkbox
                    id={option}
                    checked={profileData.livingInfo.supportSystem.includes(option)}
                    onCheckedChange={(checked) => handleCheckboxChange('livingInfo', 'supportSystem', option, checked as boolean)}
                  />
                  <Label htmlFor={option} className="flex-1 text-gray-900 cursor-pointer capitalize">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Health Information",
      description: "Your health goals and preferences",
      content: (
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-4 block">
              Primary Health Concerns (select all that apply)
            </Label>
            <div className="space-y-3">
              {['Anxiety/Stress', 'Depression', 'Sleep Issues', 'Relationship Problems', 'Work-Life Balance', 'Self-Esteem', 'Trauma/PTSD', 'Other'].map((concern) => (
                <div key={concern} className="flex items-center space-x-3 p-4 bg-white border border-purple-200 rounded-xl">
                  <Checkbox
                    id={concern}
                    checked={profileData.healthInfo.primaryConcerns.includes(concern)}
                    onCheckedChange={(checked) => handleCheckboxChange('healthInfo', 'primaryConcerns', concern, checked as boolean)}
                  />
                  <Label htmlFor={concern} className="flex-1 text-gray-900 cursor-pointer">
                    {concern}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="healthGoals" className="text-sm font-medium text-gray-700 mb-2 block">
              Health Goals
            </Label>
            <Textarea
              id="healthGoals"
              value={profileData.healthInfo.healthGoals}
              onChange={(e) => handleInputChange('healthInfo', 'healthGoals', e.target.value)}
              placeholder="What do you hope to achieve with HerVital?"
              rows={4}
              className="w-full p-4 border border-purple-200 rounded-xl resize-none"
            />
          </div>
          
          <div>
            <Label htmlFor="emergencyContact" className="text-sm font-medium text-gray-700 mb-2 block">
              Emergency Contact
            </Label>
            <Input
              id="emergencyContact"
              value={profileData.healthInfo.emergencyContact}
              onChange={(e) => handleInputChange('healthInfo', 'emergencyContact', e.target.value)}
              placeholder="Name and phone number"
              className="w-full p-4 border border-purple-200 rounded-xl"
            />
          </div>
        </div>
      )
    }
  ];

  const canProceed = () => {
    if (currentSection === 0) {
      return profileData.personalInfo.fullName && profileData.personalInfo.age && profileData.personalInfo.gender;
    }
    return true;
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
    } else {
      saveProfileMutation.mutate(profileData);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;
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
              <h2 className="text-xl font-bold">Complete Your Profile</h2>
              <p className="text-blue-100 text-sm">Help us personalize your experience</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">
                {currentSection + 1} of {sections.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Current Section */}
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <User className="text-blue-600" size={24} />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    {sections[currentSection].title}
                  </h3>
                  <p className="text-blue-700 text-sm">
                    {sections[currentSection].description}
                  </p>
                </div>
              </div>
              
              {sections[currentSection].content}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentSection === 0}
              variant="outline"
              className="px-6 py-3 rounded-xl font-medium"
            >
              <ArrowLeft size={16} className="mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || saveProfileMutation.isPending}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium"
            >
              {saveProfileMutation.isPending ? (
                "Saving..."
              ) : currentSection === sections.length - 1 ? (
                <>
                  <Save size={16} className="mr-2" />
                  Save Profile
                </>
              ) : (
                <>
                  Next
                  <ArrowLeft size={16} className="ml-2 rotate-180" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}