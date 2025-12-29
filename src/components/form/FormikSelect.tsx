'use client'
import { Field, ErrorMessage, FieldAttributes, useField } from 'formik';

const FormikSelect = ({
  label,
  options,
  isDisabled = false,
  errorMessage,
  ...props
}: {
  isDisabled?: boolean;
  label?: string;
  options: { value: string; label: string }[];
  errorMessage?: string;
} & FieldAttributes<any>) => {
  const [, meta] = useField(props.name);
  const hasError = meta.touched && meta.error;

  return (
    <div className="w-full">
      {label && (
        <label className={`block text-sm sm:text-base font-medium mb-1.5 sm:mb-2 ${hasError ? 'text-red-600' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      <Field
        {...props}
        disabled={isDisabled}
        as="select"
        className={`min-h-[44px] sm:min-h-[48px] w-full border rounded-lg px-3 sm:px-4 text-sm sm:text-base bg-white text-gray-800 outline-none transition-all duration-200 shadow-sm cursor-pointer appearance-none bg-no-repeat bg-right pr-10 ${hasError
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 hover:border-gray-300'
          }`}
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '20px', backgroundPosition: 'right 12px center' }}
      >
        {options.map((option: { value: string; label: string }) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Field>
      {(errorMessage || props.name) && (
        <div className="min-h-[18px] mt-1">
          {errorMessage ? (
            <div className="text-red-500 text-xs sm:text-sm font-medium">{errorMessage}</div>
          ) : (
            <ErrorMessage name={props.name} component="div" className="text-red-500 text-xs sm:text-sm font-medium" />
          )}
        </div>
      )}
    </div>
  );
};

export default FormikSelect;