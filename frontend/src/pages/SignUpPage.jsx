import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";

import AuthImagePattern from "../components/AuthImagePattern";
import ThemeToggle from "../components/ThemeToggle";
import FormFieldError from "../components/ui/FormFieldError";
const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Invalid email format";
    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 6)
      errors.password = "Password must be at least 6 characters";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const result = await signup({
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    });

    if (!result.success) {
      setFieldErrors(result.fieldErrors);
    }
  };

  return (
    <main id="main-content" className="relative grid min-h-screen lg:grid-cols-2">
      <div className="absolute top-4 right-4 z-10 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>
      {/* left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* LOGO */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-colors"
              >
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Your Account</h1>
              <p className="text-base-content/60">
                Join our community in seconds
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="form-control">
              <label className="label" htmlFor="signup-name">
                <span className="label-text font-medium">Your Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                  id="signup-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  className={`input input-bordered w-full pl-10 bg-base-200 text-base-content focus:border-primary transition-colors ${
                    fieldErrors.fullName ? "input-error" : ""
                  }`}
                  placeholder="What should we call you?"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  aria-invalid={Boolean(fieldErrors.fullName)}
                  aria-describedby={
                    fieldErrors.fullName ? "signup-name-error" : undefined
                  }
                  required
                />
              </div>
              <FormFieldError
                id="signup-name-error"
                message={fieldErrors.fullName}
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="signup-email">
                <span className="label-text font-medium">Email Address</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  className={`input input-bordered w-full pl-10 bg-base-200 text-base-content focus:border-primary transition-colors ${
                    fieldErrors.email ? "input-error" : ""
                  }`}
                  placeholder="Your email stays private"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={
                    fieldErrors.email ? "signup-email-error" : undefined
                  }
                  required
                />
              </div>
              <FormFieldError
                id="signup-email-error"
                message={fieldErrors.email}
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="signup-password">
                <span className="label-text font-medium">Choose Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  className={`input input-bordered w-full pl-10 bg-base-200 text-base-content focus:border-primary transition-colors ${
                    fieldErrors.password ? "input-error" : ""
                  }`}
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password ? "signup-password-error" : undefined
                  }
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
              <FormFieldError
                id="signup-password-error"
                message={fieldErrors.password}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Creating your account...
                </>
              ) : (
                "Join Murmur Now"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* right side */}

      <AuthImagePattern
        title="Join the conversation"
        subtitle="Connect with friends, share ideas, and build meaningful relationships in our vibrant community."
      />
    </main>
  );
};
export default SignUpPage;
