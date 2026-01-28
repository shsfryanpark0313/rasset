import React, { forwardRef } from 'react';
import Input, { type InputProps } from './Input';

interface PhoneInputProps extends Omit<InputProps, 'onChange'> {
    value: string;
    onChange: (value: string) => void;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
    ({ value, onChange, ...props }, ref) => {

        // Auto-format: 01012345678 -> 010-1234-5678
        const formatPhoneNumber = (val: string) => {
            if (!val) return val;
            const onlyNums = val.replace(/[^\d]/g, '');

            if (onlyNums.length <= 3) return onlyNums;
            if (onlyNums.length <= 7) return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
            return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7, 11)}`;
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const formatted = formatPhoneNumber(e.target.value);
            // Limit to 13 chars (010-1234-5678)
            if (formatted.length <= 13) {
                onChange(formatted);
            }
        };

        return (
            <Input
                type="tel"
                ref={ref}
                value={value}
                onChange={handleChange}
                placeholder="010-0000-0000"
                maxLength={13}
                {...props}
            />
        );
    }
);

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
