"use client";

/** Activate/Deactivate confirmation — never a hard delete. Mirrors
 * RetailerStatusDialog.tsx / ProductStatusDialog.tsx. */
interface UserStatusDialogProps {
  userName: string;
  isActive: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  submitting?: boolean;
  submitError?: string | null;
}

export default function UserStatusDialog({ userName, isActive, onClose, onConfirm, submitting = false, submitError = null }: UserStatusDialogProps) {
  const willDeactivate = isActive;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brown-900/40 p-4 backdrop-blur-sm">
      <div className="premium-card w-full max-w-md p-6">
        <h2 className="font-heading text-lg font-bold text-brown-900">
          {willDeactivate ? "Deactivate" : "Activate"} {userName}?
        </h2>
        <p className="mt-2 text-sm text-brown-500">
          {willDeactivate
            ? "This user will no longer be able to sign in. Their account and history are kept, never deleted."
            : "This user will be able to sign in again."}
        </p>

        {submitError && (
          <div role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {submitError}
          </div>
        )}

        <div className="mt-5 flex items-center justify-end gap-3 border-t border-warm-200 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-brown-300 px-5 py-2.5 text-sm font-semibold text-brown-700 transition-all duration-200 hover:bg-brown-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm()}
            disabled={submitting}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
              willDeactivate ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {willDeactivate ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}
