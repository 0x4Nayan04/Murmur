const EmptyState = ({
  icon: Icon,
  title,
  description,
  className = "",
  children,
}) => (
  <div
    className={`flex flex-col items-center justify-center text-center ${className}`}
  >
    {Icon && (
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-base-200">
        <Icon className="size-8 text-base-content/40" aria-hidden="true" />
      </div>
    )}
    {title && <p className="font-medium text-base-content/70">{title}</p>}
    {description && (
      <p className="mt-1 text-sm text-base-content/50">{description}</p>
    )}
    {children}
  </div>
);

export default EmptyState;
