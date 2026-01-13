'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked: controlledChecked, onChange, ...props }, ref) => {
    const [internalChecked, setInternalChecked] = React.useState(false);

    // Support both controlled and uncontrolled modes
    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(e.target.checked);
      }
      onChange?.(e);
    };

    const handleClick = () => {
      const newChecked = !checked;
      if (!isControlled) {
        setInternalChecked(newChecked);
      }
      // Create a synthetic event for the onChange handler
      const syntheticEvent = {
        target: { checked: newChecked },
        currentTarget: { checked: newChecked },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(syntheticEvent);
    };

    return (
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          ref={ref}
          checked={checked}
          onChange={handleChange}
          {...props}
        />
        <div
          className={cn(
            'h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
            checked && 'bg-primary text-primary-foreground',
            className
          )}
          onClick={handleClick}
        >
          {checked && <Check className="h-3 w-3" />}
        </div>
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
