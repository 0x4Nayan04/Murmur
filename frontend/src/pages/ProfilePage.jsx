import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Calendar, Mail, Shield, User } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  // Format the date to be more readable
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
    <div className="min-h-screen bg-base-100 pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-base-200 rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-base-300 p-6 border-b border-base-content/10">
            <h1 className="text-2xl font-bold text-center">Your Identity</h1>
            <p className="text-center text-base-content/70 mt-1">
              Personalize how others see you
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={selectedImg || authUser.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="size-36 rounded-full object-cover border-4 border-base-300 shadow-md"
                />
                <label
                  htmlFor="avatar-upload"
                  className={`
                    absolute bottom-1 right-1 
                    bg-primary hover:bg-primary-focus
                    p-2.5 rounded-full cursor-pointer 
                    transition-all duration-300 shadow-lg
                    ${
                      isUpdatingProfile
                        ? "animate-pulse pointer-events-none opacity-70"
                        : "hover:scale-110"
                    }
                  `}>
                  <Camera className="w-5 h-5 text-primary-content" />
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
              <p className="text-sm text-base-content/70 font-medium">
                {isUpdatingProfile
                  ? "Updating your photo..."
                  : "Tap the camera icon to update your profile picture"}
              </p>
            </div>

            {/* Personal Information Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold border-b border-base-content/10 pb-2">
                About You
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-base-content/80 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Display Name
                  </div>
                  <div className="px-5 py-3 bg-base-100 rounded-lg border border-base-300 shadow-sm">
                    {authUser?.fullName}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-base-content/80 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    Contact Email
                  </div>
                  <div className="px-5 py-3 bg-base-100 rounded-lg border border-base-300 shadow-sm">
                    {authUser?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div className="bg-base-300 rounded-xl p-6 shadow-inner">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Account Information
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between py-3 border-b border-base-content/10">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary/80" />
                    Member Since
                  </span>
                  <span className="font-medium">
                    {formatDate(authUser.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary/80" />
                    Account Status
                  </span>
                  <span className="px-3 py-1 bg-success/20 text-success rounded-full font-medium">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
