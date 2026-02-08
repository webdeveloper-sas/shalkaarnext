import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles =
    'font-medium rounded transition-colors duration-200 focus:outline-none';
  const variantStyles = {
    primary: 'bg-[#1a2847] text-[#f5f1ed] hover:bg-[#8b4513]',
    secondary: 'border border-[#8b4513] text-[#1a2847] hover:bg-[#f5f1ed]',
    tertiary: 'text-[#2a2a2a] hover:underline',
  };
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Placeholder components
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props
) => (
  <input
    className="px-4 py-2 border border-[#e8e4df] rounded focus:border-[#1a2847] focus:outline-none"
    {...props}
  />
);

export const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-6 rounded shadow bg-white">{children}</div>
);

export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ isOpen, onClose: _onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded p-8 max-w-md w-full">{children}</div>
    </div>
  );
};

export const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-block px-3 py-1 text-sm font-semibold bg-[#8b4513] text-[#f5f1ed] rounded">
    {children}
  </span>
);

export const Spinner: React.FC = () => (
  <div className="inline-block w-4 h-4 border-2 border-[#8b4513] border-t-transparent rounded-full animate-spin" />
);
