'use client'
import { Field, ErrorMessage, FieldAttributes, useField } from 'formik';

const FormikTextarea = ({ label, errorMessage, ...props }: { label?: string; errorMessage?: string } & FieldAttributes<any>) => {
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
        as="textarea"
        {...props}
        className={`min-h-[100px] sm:min-h-[120px] w-full border rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 shadow-sm resize-y ${hasError
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 hover:border-gray-300'
          }`}
      />
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

export default FormikTextarea;