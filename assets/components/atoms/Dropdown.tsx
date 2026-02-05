import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  error?: string;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  error,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`w-full relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-3 py-2 border rounded-lg shadow-sm bg-white text-left
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          flex items-center justify-between
          ${error ? 'border-red-500' : 'border-gray-300'}
          hover:border-gray-400 cursor-pointer
        `}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {displayValue}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`
                w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none
                ${option.value === value ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}
                cursor-pointer
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

