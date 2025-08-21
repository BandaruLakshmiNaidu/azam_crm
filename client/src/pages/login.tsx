import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthContext } from "@/context/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Eye, EyeOff, Lock, User, Loader2 } from "lucide-react";
import logo from "../assets/logo.png";
import vaiLogo from "../assets/vailogo.png";
import { useTranslation } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthContext();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(username, password);

    if (!success) {
      toast({
        title: t("auth.loginFailed"),
        description: t("auth.invalidEmailPassword"),
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-0 md:p-4">
      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left Side - Branding */}
        <div className="hidden md:flex flex-col justify-center items-center text-white relative w-1/2 bg-gradient-to-br from-[#181c4c] via-[#238fb7] to-[#1e40af] p-12">
          {/* Decorative circles */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-10 w-24 h-24 bg-[#e67c1a]/20 rounded-full blur-lg"></div>
          <div className="text-center space-y-8 relative z-10">
            {/* Logos Section */}
            <div className="space-y-6">
              {/* AZAM TV Logo */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                    <img
                      src={logo}
                      alt="AZAM TV Logo"
                      className="w-32 h-auto object-contain"
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#e67c1a] rounded-full"></div>
                </div>
              </div>
              {/* VAI Logo */}
              <div className="flex justify-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <img
                    src={vaiLogo}
                    alt="VAI Logo"
                    className="w-40 h-auto object-contain"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                {t("auth.welcomeBack")}
              </h1>
              <p className="text-blue-100 text-lg leading-relaxed max-w-md">
                {t("auth.welcomeMessage")}
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-blue-200">
              <div className="w-2 h-2 bg-[#e67c1a] rounded-full animate-pulse"></div>
              <span>{t("auth.secureReliableProfessional")}</span>
              <div className="w-2 h-2 bg-[#e67c1a] rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        {/* Right Side - Login Form */}
        <div className="flex-1 flex flex-col justify-center p-8 md:p-12">
          <div className="w-full max-w-sm mx-auto space-y-8">
            <div className="flex justify-center md:hidden mb-4">
              <img src={vaiLogo} alt="VAI Logo" className="w-32 h-auto" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">{t("auth.signIn")}</h2>
              <p className="text-gray-600">{t("auth.enterCredentials")}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <Label htmlFor="username" className="text-sm font-semibold text-gray-700 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {t("auth.username")}
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={t("auth.enterEmailAddress")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-[#238fb7] focus:ring-[#238fb7] transition-all duration-200 mt-1"
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>
              {/* Password */}
              <div>
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  {t("auth.password")}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-[#238fb7] focus:ring-[#238fb7] transition-all duration-200 mt-1 pr-12"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="data-[state=checked]:bg-[#238fb7] data-[state=checked]:border-[#238fb7]"
                  />
                  <Label htmlFor="remember-me" className="text-sm text-gray-700 cursor-pointer">
                    {t("auth.rememberMe")}
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-[#238fb7] hover:text-[#181c4c] font-medium p-0 h-auto"
                  onClick={() => setLocation("/forgot-password")}
                >
                  {t("auth.forgotPasswordQuestion")}
                </Button>
              </div>
              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#238fb7] to-[#181c4c] hover:from-[#181c4c] hover:to-[#238fb7] text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{t("auth.signingIn")}</span>
                  </span>
                ) : (
                  t("auth.signInToDashboard")
                )}
              </Button>
            </form>
            {/* Footer */}
            <div className="text-center pt-6 border-t border-gray-200 mt-8">
              <p className="text-sm text-gray-600">
                {t("auth.needAssistance")}{" "}
                <a
                  href="mailto:admin@azamtv.com"
                  className="text-[#238fb7] hover:text-[#181c4c] font-medium hover:underline transition-colors"
                >
                  {t("auth.contactSupport")}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
