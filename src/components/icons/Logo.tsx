import React from 'react';

const Logo = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="32"
    height="32"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Flow Finance Logo"
  >
    <path
      d="M20 30C20 24.4772 24.4772 20 30 20H70C75.5228 20 80 24.4772 80 30V70C80 75.5228 75.5228 80 70 80H30C24.4772 80 20 75.5228 20 70V30Z"
      className="fill-primary"
    />
    <path
      d="M40 40L60 40M40 50L70 50M40 60L55 60"
      stroke="hsl(var(--primary-foreground))"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Logo;
