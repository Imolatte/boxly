import { createPortal } from 'react-dom';
import { useToastStore, type Toast, type ToastType } from '../../store/toastStore';

function toastBg(type: ToastType): string {
  if (type === 'success') return 'bg-boxly-peach text-white';
  if (type === 'reward') return 'bg-boxly-peach text-white';
  return 'bg-boxly-mint text-boxly-text';
}

interface ToastItemProps {
  toast: Toast;
}

function ToastItem({ toast }: ToastItemProps): JSX.Element {
  const remove = useToastStore((s) => s.remove);

  return (
    <div
      className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-md text-sm font-medium cursor-pointer animate-fade-in ${toastBg(toast.type)}`}
      style={{ animation: 'toastIn 0.2s ease forwards' }}
      onClick={() => remove(toast.id)}
    >
      {toast.message}
    </div>
  );
}

export function ToastContainer(): JSX.Element {
  const toasts = useToastStore((s) => s.toasts);

  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>,
    document.body,
  );
}
