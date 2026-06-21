import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectContextProps {
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const SelectContext = createContext<SelectContextProps | undefined>(undefined);

export function Select({ 
  children, 
  value, 
  onValueChange 
}: { 
  children: React.ReactNode; 
  value: string; 
  onValueChange: (value: string) => void; 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, triggerRef }}>
      <div className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ 
  className, 
  children,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectTrigger must be used within Select');
  
  const { isOpen, setIsOpen, triggerRef } = context;

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`
        flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 text-left cursor-pointer
        ${className || ''}
      `}
      {...props}
    >
      {children}
      <ChevronDown className={`h-4 w-4 opacity-50 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
}

export function SelectValue({ 
  placeholder, 
  children 
}: { 
  placeholder?: string; 
  children?: React.ReactNode; 
}) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectValue must be used within Select');
  
  return (
    <span className="truncate block pr-2">
      {children || placeholder}
    </span>
  );
}

export function SelectContent({ 
  className, 
  children, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectContent must be used within Select');
  
  const { isOpen, setIsOpen, triggerRef } = context;
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        contentRef.current && !contentRef.current.contains(event.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, setIsOpen, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={contentRef}
      className={`
        absolute z-50 mt-1 max-h-[320px] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-white dark:bg-zinc-900 border-neutral-200 dark:border-zinc-800 text-popover-foreground shadow-md p-1 animate-in fade-in slide-in-from-top-1 duration-150 right-0 left-0
        ${className || ''}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function SelectItem({ 
  className, 
  value, 
  disabled, 
  children,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  value: string; 
}) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectItem must be used within Select');
  
  const { value: selectedValue, onValueChange, setIsOpen } = context;
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          onValueChange(value);
          setIsOpen(false);
        }
      }}
      className={`
        relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none transition-colors hover:bg-neutral-100 dark:hover:bg-zinc-800 text-left
        ${disabled ? 'pointer-events-none opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className || ''}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
