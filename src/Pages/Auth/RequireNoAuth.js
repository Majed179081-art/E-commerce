import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookie from 'cookie-universal';
import LoadingSubmit from '../../Components/Loading/Loading';

export default function AuthRedirector({ children }) {
  const navigate = useNavigate();
  const cookies = Cookie();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = cookies.get('e-commerce');
    
    if (token) {
      // If token exists, go back to last visited page
      navigate(-1); // -1 means go back one page in history
    }
    
    // Mark check as complete
    setIsChecking(false);
  }, [navigate, cookies]); // Added cookies to dependencies for safety

  // Show loading while checking auth state
  if (isChecking) {
    return <LoadingSubmit />;
  }

  // If no token exists, render the login page (children)
  return children;
}