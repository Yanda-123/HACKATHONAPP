import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Heart, ArrowLeft, Key, UserPlus } from "lucide-react";

type AuthMode = "login" | "register" | "forgot-password";

export default function Landing() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {authMode === "login" && (
          <>
            {/* Logo and Welcome */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to HerVital</h1>
              <p className="text-gray-600">Your mental health and wellness companion</p>
            </div>

            {/* Login Form */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <form>
                  <div className="mb-4">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <Label htmlFor="remember" className="text-sm text-gray-600">
                        Remember me
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm text-primary-600 hover:text-primary-700 p-0"
                      onClick={() => setAuthMode("forgot-password")}
                    >
                      Forgot password?
                    </Button>
                  </div>

                  <Button
                    type="button"
                    onClick={handleLogin}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                  >
                    Sign In
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Button
                  variant="link"
                  className="text-primary-600 hover:text-primary-700 font-medium p-0"
                  onClick={() => setAuthMode("register")}
                >
                  Sign up here
                </Button>
              </p>
            </div>
          </>
        )}

        {authMode === "register" && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserPlus className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
              <p className="text-gray-600">Join HerVital for personalized care</p>
            </div>

            <Card className="mb-6">
              <CardContent className="p-6">
                <form>
                  <div className="mb-4">
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 mb-2 block">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <Label htmlFor="registerEmail" className="text-sm font-medium text-gray-700 mb-2 block">
                      Email Address
                    </Label>
                    <Input
                      id="registerEmail"
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <Label htmlFor="registerPassword" className="text-sm font-medium text-gray-700 mb-2 block">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="registerPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-start space-x-2">
                      <Checkbox id="terms" className="mt-1" />
                      <Label htmlFor="terms" className="text-sm text-gray-600">
                        I agree to the{" "}
                        <Button variant="link" className="text-primary-600 hover:text-primary-700 p-0 h-auto">
                          Terms of Service
                        </Button>
                        {" "}and{" "}
                        <Button variant="link" className="text-primary-600 hover:text-primary-700 p-0 h-auto">
                          Privacy Policy
                        </Button>
                      </Label>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleLogin}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                  >
                    Create Account
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="text-primary-600 hover:text-primary-700 font-medium p-0"
                  onClick={() => setAuthMode("login")}
                >
                  Sign in here
                </Button>
              </p>
            </div>
          </>
        )}

        {authMode === "forgot-password" && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Key className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
              <p className="text-gray-600">Enter your email to receive reset instructions</p>
            </div>

            <Card className="mb-6">
              <CardContent className="p-6">
                <form>
                  <div className="mb-6">
                    <Label htmlFor="forgotEmail" className="text-sm font-medium text-gray-700 mb-2 block">
                      Email Address
                    </Label>
                    <Input
                      id="forgotEmail"
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <Button
                    type="button"
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                  >
                    Send Reset Link
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                variant="link"
                className="text-primary-600 hover:text-primary-700 font-medium"
                onClick={() => setAuthMode("login")}
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Sign In
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
