const LoadingSpinner = ({ size = 'md' }) => {
    const sizes = {
      sm: 'w-5 h-5',
      md: 'w-8 h-8',
      lg: 'w-12 h-12'
    };
  
    return (
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizes[size]}`} />
    );
  };
  
  export default LoadingSpinner;