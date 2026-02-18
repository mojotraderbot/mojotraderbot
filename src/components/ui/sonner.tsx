import type { ReactNode } from "react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/** Кнопка COPY CA для тостов (показывать в description). */
export function ToastExtras({ mint }: { mint?: string }) {
  const copyCa = () => {
    if (!mint) return;
    navigator.clipboard.writeText(mint);
    toast.success("CA скопирован");
  };
  return (
    <div className="win95-toast-extras flex flex-wrap items-center gap-2 mt-2">
      {mint && (
        <button type="button" onClick={copyCa} className="win95-button !px-2 !py-1 text-[11px]">
          COPY CA
        </button>
      )}
    </div>
  );
}

export function toastSuccess(message: ReactNode, options?: { mint?: string }) {
  return toast.success(message, {
    description: <ToastExtras mint={options?.mint} />,
  });
}

export function toastError(message: string) {
  return toast.error(message, {
    description: <ToastExtras />,
  });
}

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster toaster-win95"
      closeButton
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: "win95-toast",
          title: "win95-toast-title",
          description: "win95-toast-description",
          actionButton: "win95-toast-btn",
          cancelButton: "win95-toast-btn",
          closeButton: "win95-toast-close",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
