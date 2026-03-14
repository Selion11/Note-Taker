import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
}

export const Button = ({ children, variant = 'primary', className = '', ...props }: ButtonProps) => {
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm',
    danger: 'bg-rose-50 hover:bg-rose-100 text-rose-600',
    warning: 'bg-amber-50 hover:bg-amber-100 text-amber-600',
  };

  return (
    <button 
      className={`px-5 py-2.5 rounded-full font-semibold transition-all duration-300 active:scale-95 disabled:opacity-50 shadow-lg ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};