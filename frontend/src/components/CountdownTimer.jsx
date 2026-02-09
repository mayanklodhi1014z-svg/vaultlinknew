import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ expiresAt, variant = 'light' }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeRemaining(null);
        return true; // Signal that timer has expired
      }

      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
      setIsExpired(false);
      return false;
    };

    // Calculate immediately
    const hasExpired = calculateTimeRemaining();
    
    // Only set up interval if not already expired
    if (hasExpired) return;

    // Update every second
    const interval = setInterval(() => {
      const expired = calculateTimeRemaining();
      if (expired) {
        clearInterval(interval);
      }
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [expiresAt]);

  const textColor = variant === 'dark' ? 'text-primary-600' : 'text-white';
  const iconColor = variant === 'dark' ? 'text-primary-500' : 'text-white';

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">Expired</span>
      </div>
    );
  }

  if (!timeRemaining) {
    return null;
  }

  const formatTime = (value) => String(value).padStart(2, '0');

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <svg className={`w-5 h-5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className={`text-sm font-medium ${textColor}`}>Expires in:</span>
      </div>
      <div className={`font-mono text-lg font-bold ${textColor}`}>
        {timeRemaining.hours > 0 && `${formatTime(timeRemaining.hours)}:`}
        {formatTime(timeRemaining.minutes)}:{formatTime(timeRemaining.seconds)}
      </div>
    </div>
  );
};

export default CountdownTimer;
