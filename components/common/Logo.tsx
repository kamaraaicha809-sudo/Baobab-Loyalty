/**
 * Kodefast Logo Component
 * 
 * Renders the Kodefast "K" logo as an inline SVG
 * 
 * Utilise la variable CSS --color-primary pour la couleur principale
 */

interface LogoProps {
  size?: number;
  variant?: "color" | "white";
  className?: string;
}

const Logo = ({ size = 36, variant = "color", className = "" }: LogoProps) => {
  const fillColor = variant === "white" ? "#ffffff" : "var(--color-primary)";
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 189.08 182.17"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Kodefast Logo"
    >
      <path
        d="M71.48,128.21v23.51c0,6.06-4.91,10.96-10.96,10.96h-5.5c-6.04,0-10.93-4.9-10.93-10.93,0,0,0-.02,0-.03V29.86c-.02-6.04,4.87-10.95,10.91-10.96,0,0,.02,0,.03,0h5.5c6.06,0,10.96,4.91,10.96,10.96v98.35Z"
        fill={fillColor}
      />
      <path
        d="M86.18,99.43l28.39-47.85c1.84-3.12,5.19-5.04,8.82-5.06h7.5c5.7-.05,10.36,4.53,10.4,10.23.02,1.97-.53,3.91-1.59,5.58l-23.13,36.45c-2.25,3.53-2.14,8.08.29,11.49l26.22,36.74c3.3,4.63,2.21,11.05-2.41,14.35-1.74,1.24-3.83,1.91-5.96,1.91h-7.38c-3.42,0-6.62-1.7-8.55-4.53l-21.84-32.33-10.35-16.08c-2.22-3.25-2.38-7.49-.41-10.91Z"
        fill={fillColor}
      />
    </svg>
  );
};

export default Logo;
