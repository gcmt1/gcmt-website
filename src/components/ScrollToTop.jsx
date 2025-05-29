// src/components/ScrollToTop.jsx

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth', // Optional: remove 'smooth' if you want instant jump
    });
  }, [pathname]);

  return null; // This component doesn't render anything visible
};

export default ScrollToTop;
