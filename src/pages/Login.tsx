
import { useEffect } from 'react';
import { useNavigate } from '@/components/LocalizedLink';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to new auth page
    navigate('/auth', { replace: true });
  }, [navigate]);

  return null;
};

export default Login;
