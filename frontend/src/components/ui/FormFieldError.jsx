const FormFieldError = ({ id, message }) => {
  if (!message) return null;

  return (
    <p id={id} className="mt-1.5 text-xs text-error" role="alert">
      {message}
    </p>
  );
};

export default FormFieldError;
