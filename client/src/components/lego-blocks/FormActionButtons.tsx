import React from 'react';
import { RotateCcw, Save } from 'lucide-react';
import ReusableButton from './ReusableButton';

interface FormActionButtonsProps {
  onReset?: () => void;
  onSave?: () => void;
  resetLabel?: string;
  saveLabel?: string;
  isLoading?: boolean;
  disabled?: boolean;
  showReset?: boolean;
  showSave?: boolean;
  resetType?: 'button' | 'reset';
  saveType?: 'button' | 'submit';
  className?: string;
}

export default function FormActionButtons({
  onReset,
  onSave,
  resetLabel = "Reset Form",
  saveLabel = "Save Use Case",
  isLoading = false,
  disabled = false,
  showReset = true,
  showSave = true,
  resetType = "button",
  saveType = "submit",
  className = "",
}: FormActionButtonsProps) {
  return (
    <div className={`flex justify-end space-x-4 ${className}`}>
      {showReset && (
        <ReusableButton
          type={resetType}
          rsaStyle="reset"
          onClick={onReset}
          icon={RotateCcw}
          disabled={disabled || isLoading}
        >
          {resetLabel}
        </ReusableButton>
      )}
      
      {showSave && (
        <ReusableButton
          type={saveType}
          rsaStyle="primary"
          onClick={onSave}
          icon={Save}
          loading={isLoading}
          disabled={disabled}
        >
          {saveLabel}
        </ReusableButton>
      )}
    </div>
  );
}