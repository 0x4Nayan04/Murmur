import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Calendar, Mail, Shield, User } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      toast.error("Failed to read image file");
    };

    reader.readAsDataURL(file);

    reader.onload = async () => {
      try {
        const base64Image = reader.result;
        setSelectedImg(base64Image);
        await updateProfile({ profilePic: base64Image });
      } catch {
        toast.error("Failed to update profile picture");
        setSelectedImg(null);
      }
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-base-200 pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-base-100 rounded-2xl border border-base-300 overflow-hidden shadow-sm">
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
                    src={selectedImg || authUser?.profilePic || "/avatar.png"}
                    alt="Profile"
                    className="size-36 rounded-full object-cover border-2 border-base-300 shadow-sm"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className={`
                      absolute bottom-0 right-0
                      bg-primary hover:bg-primary-focus
                      p-2.5 rounded-full cursor-pointer
                      transition-all duration-200 shadow-md
                      ${
                        isUpdatingProfile
                          ? "animate-pulse pointer-events-none opacity-70"
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
                  <label className="text-xs font-medium text-base-content/70 block mb-1.5">
                    Display Name
                  </label>
                  <div className="px-4 py-3 rounded-lg border border-base-300 bg-base-100 text-sm text-base-content">
                    {authUser?.fullName}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-base-content/70 block mb-1.5">
                    Contact Email
                  </label>
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
    </div>
  );
};

export default ProfilePage;
