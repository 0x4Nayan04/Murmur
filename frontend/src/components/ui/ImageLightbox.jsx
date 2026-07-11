import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const ImageLightbox = ({ src, alt = "Attachment", onClose }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);

    return () => {
      dialog.removeEventListener("close", handleClose);
      if (dialog.open) dialog.close();
    };
  }, [onClose]);

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-label="Image preview"
      className="fixed inset-0 z-50 m-0 flex max-h-none max-w-none items-center justify-center border-0 bg-transparent p-4 [&::backdrop]:bg-black/80"
    >
      <button
        type="button"
        className="btn btn-circle btn-ghost absolute right-4 top-4 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        aria-label="Close image preview"
        onClick={() => dialogRef.current?.close()}
      >
        <X size={24} />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-full rounded-lg object-contain"
      />
    </dialog>,
    document.body,
  );
};

export default ImageLightbox;
