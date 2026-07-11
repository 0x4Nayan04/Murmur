import { useEffect, useId, useRef } from "react";

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onCancel();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onCancel]);

  const handleConfirm = () => {
    onConfirm();
    dialogRef.current?.close();
  };

  const confirmClass =
    variant === "destructive" ? "btn btn-error" : "btn btn-primary";

  return (
    <dialog ref={dialogRef} className="modal" aria-labelledby={titleId}>
      <div className="modal-box">
        <h3 id={titleId} className="text-lg font-bold">
          {title}
        </h3>
        <p className="py-4 text-base-content/70">{message}</p>
        <div className="modal-action">
          <button
            type="button"
            ref={cancelRef}
            className="btn btn-ghost"
            onClick={() => dialogRef.current?.close()}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={confirmClass}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit">close</button>
      </form>
    </dialog>
  );
};

export default ConfirmDialog;
