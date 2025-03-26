const Input = ({ 
    label, 
    type = 'text', 
    name, 
    value, 
    onChange, 
    required = false, 
    ...props 
  }) => {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500"> *</span>}
          </label>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          {...props}
        />
      </div>
    );
  };
  
  export default Input;