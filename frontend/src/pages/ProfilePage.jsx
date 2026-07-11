import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { validateImageFile } from "../lib/cloudinary";
import FormFieldError from "../components/ui/FormFieldError";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera, Calendar, Mail, Shield, User } from "lucide-react";
import { getAvatarSrc } from "../lib/avatar";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFieldErrors({});

    const validationError = validateImageFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      toast.error("Failed to read image file");
    };

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      const result = await updateProfile({ profilePic: base64Image });

      if (!result.success) {
        setSelectedImg(null);
        setFieldErrors(result.fieldErrors);
      }
    };
  };

  return (
    <main id="main-content" className="min-h-screen bg-base-200 px-4 pb-12 pt-24">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-2 text-sm text-base-content/70 transition-colors hover:text-base-content"
        >
          <ArrowLeft className="size-4" />
          Back to chat
        </Link>
        <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
          <div className="p-6 md:p-8 space-y-6 bg-base-100">
            <div className="flex flex-col items-center gap-2 mb-2">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <User className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-base-content">
                Your Identity
              </h1>
            </div>

            <section className="rounded-xl border border-base-300 bg-base-200 p-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img
                    src={getAvatarSrc(selectedImg || authUser?.profilePic)}
                    alt={authUser?.fullName || "User"}
                    className="size-36 rounded-full object-cover border-2 border-base-300 shadow-sm"
                  />
                  {isUpdatingProfile && (
                    <div
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-base-100/60"
                      aria-hidden="true"
                    >
                      <span className="loading loading-spinner loading-lg text-primary" />
                    </div>
                  )}
                  <label
                    htmlFor="avatar-upload"
                    aria-label="Change profile photo"
                    className={`
                      absolute bottom-0 right-0
                      bg-primary hover:bg-primary-focus
                      p-2.5 rounded-full cursor-pointer
                      transition-all duration-200 shadow-md
                      ${
                        isUpdatingProfile
                          ? "pointer-events-none opacity-70"
                          : "hover:scale-105 active:scale-95"
                      }
                    `}
                  >
                    <Camera className="size-4 text-primary-content" />
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUpdatingProfile}
                    />
                  </label>
                </div>
                <p className="text-xs text-base-content/60 text-center">
                  {isUpdatingProfile
                    ? "Updating your photo..."
                    : "Tap the camera icon to update your profile picture"}
                </p>
                <FormFieldError
                  id="profile-pic-error"
                  message={fieldErrors.profilePic}
                />
              </div>
            </section>

            <section className="rounded-xl border border-base-300 bg-base-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <User className="size-4 text-primary" />
                </div>
                <h2 className="font-semibold text-base-content">About You</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-medium text-base-content/70 block mb-1.5">
                    Display Name
                  </span>
                  <div className="px-4 py-3 rounded-lg border border-base-300 bg-base-100 text-sm text-base-content">
                    {authUser?.fullName}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-base-content/70 block mb-1.5">
                    Contact Email
                  </span>
                  <div className="px-4 py-3 rounded-lg border border-base-300 bg-base-100 text-sm text-base-content flex items-center gap-2">
                    <Mail className="size-4 text-base-content/50 shrink-0" />
                    {authUser?.email}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-base-300 bg-base-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Shield className="size-4 text-primary" />
                </div>
                <h2 className="font-semibold text-base-content">
                  Account Information
                </h2>
              </div>
              <div className="space-y-0 text-sm">
                <div className="flex items-center justify-between py-3 border-b border-base-300">
                  <span className="flex items-center gap-2 text-base-content/80">
                    <Calendar className="size-4 text-primary" />
                    Member Since
                  </span>
                  <span className="font-medium text-base-content">
                    {formatDate(authUser?.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="flex items-center gap-2 text-base-content/80">
                    <Shield className="size-4 text-primary" />
                    Account Status
                  </span>
                  <span className="badge badge-sm badge-success">Active</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
