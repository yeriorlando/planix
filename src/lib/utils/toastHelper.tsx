import { toast } from "sonner";
import { Check, X } from "lucide-react";

export const showSuccessToast = (message: string) => {
  toast.custom((t) => (
    <div className="bg-[#EAFBF3] border border-[#BFF1DE] rounded-[18px] px-4 py-3.5 shadow-sm flex items-center justify-between gap-4 min-w-[320px] max-w-sm pointer-events-auto">
      <div className="flex items-center gap-3">
        <div className="w-[22px] h-[22px] rounded-full bg-[#45B883] text-white flex items-center justify-center shrink-0">
          <Check size={13} strokeWidth={4} />
        </div>
        <span className="text-[#0D5C3E] text-[13.5px] font-bold tracking-tight">
          {message}
        </span>
      </div>
      <button 
        type="button"
        onClick={() => toast.dismiss(t)} 
        className="text-[#45B883] opacity-60 hover:opacity-100 transition-opacity p-0.5 shrink-0 cursor-pointer"
      >
        <X size={15} />
      </button>
    </div>
  ));
};
