import React from 'react';

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
  const baseClass = 'btn';

  const variantClass = variant ? `btn--${variant}` : '';
  
  const activeClass = isActive ? 'active' : '';

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