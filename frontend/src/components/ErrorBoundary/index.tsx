import { useState } from "react";

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  const componentDidCatch = (error, info) => {
    // You can log the error here, or send it to a logging service
    console.error("Error caught by boundary:", error, info);
    setHasError(true);
  };

  if (hasError) {
    // You can customize the fallback UI here
    return <div>Something went wrong!</div>;
  }

  return children;
};

export default ErrorBoundary;
