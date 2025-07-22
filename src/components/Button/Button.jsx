import React from 'react';

// A flexible, reusable button component
const Button = ({ 
  children, 
  onClick, 
  variant, 
  disabled, 
  type = 'button', 
  className = '',
  isActive,
  ...props 
}) => {
  // Base class is always 'btn'
  const baseClass = 'btn';

  // Determine the variant class
  const variantClass = variant ? `btn--${variant}` : '';
  
  // Determine if the 'active' class should be applied (for toggle buttons)
  const activeClass = isActive ? 'active' : '';

  // Combine all classes
  const combinedClassName = `${baseClass} ${variantClass} ${activeClass} ${className}`.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClassName}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;