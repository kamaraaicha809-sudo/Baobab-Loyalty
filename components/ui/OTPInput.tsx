"use client";

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent, ChangeEvent, FocusEvent } from "react";

interface OTPInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  disabled?: boolean;
}

/**
 * OTPInput Component
 * 6 digit OTP input with auto-focus and paste support
 */
export default function OTPInput({ length = 6, onComplete, disabled = false }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [disabled]);

  const handleChange = (element: HTMLInputElement, index: number): void => {
    const value = element.value;

    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only the last character
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if OTP is complete
    const otpString = newOtp.join("");
    if (otpString.length === length && onComplete) {
      onComplete(otpString);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number): void => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Move to next input on right arrow
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Move to previous input on left arrow
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // Only process if pasted data contains only numbers
    if (!/^\d+$/.test(pastedData)) return;

    const pastedOtp = pastedData.slice(0, length).split("");
    const newOtp = [...otp];

    pastedOtp.forEach((digit, index) => {
      if (index < length) {
        newOtp[index] = digit;
      }
    });

    setOtp(newOtp);

    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex((val) => !val);
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();

    // Check if OTP is complete
    const otpString = newOtp.join("");
    if (otpString.length === length && onComplete) {
      onComplete(otpString);
    }
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>): void => {
    e.target.select();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-2 sm:gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={handleFocus}
            disabled={disabled}
            className={`
              w-11 h-14 sm:w-14 sm:h-16 
              text-center text-xl sm:text-2xl font-bold 
              border-2 rounded-xl
              outline-none transition-all duration-200
              ${
                digit
                  ? "border-primary bg-primary/5"
                  : "border-slate-200 bg-white"
              }
              ${
                disabled
                  ? "opacity-50 cursor-not-allowed bg-slate-50"
                  : "focus:border-primary focus:ring-2 focus:ring-primary/20"
              }
            `}
            aria-label={`Chiffre ${index + 1} du code`}
          />
        ))}
      </div>

      {/* Helper text */}
      <p className="text-xs text-slate-400 mt-4 text-center">
        Entrez le code à 6 chiffres reçu par email
      </p>
    </div>
  );
}
