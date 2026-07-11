const SIZE_CLASSES = {
  sm: "size-8",
  md: "size-10 md:size-12",
  lg: "size-12",
};

const UserAvatar = ({
  profilePic,
  alt = "",
  size = "lg",
  showOnlineDot = false,
  animatedDot = false,
  className = "",
  imageClassName = "",
}) => {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.lg;

  return (
    <div className={`relative shrink-0 ${className}`}>
      <img
        src={profilePic || "/avatar.png"}
        alt={alt}
        className={`${sizeClass} object-cover rounded-full shadow-sm ${imageClassName}`}
      />
      {showOnlineDot && (
        <div className="absolute -bottom-0.5 -right-0.5">
          {animatedDot && (
            <span className="absolute size-3 animate-ping rounded-full bg-green-400 opacity-75" />
          )}
          <span className="block size-3 bg-green-500 rounded-full ring-2 ring-base-100" />
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
