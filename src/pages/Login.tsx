import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';

function Login() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-12 md:px-24">
      <img src={logo} alt="Logo" className="w-24 mb-6" />
      <h1 className="text-2xl font-bold mb-6 text-center">Bem-vindo ao Lana's Aulas</h1>
      <Button
        onClick={() => loginWithRedirect()}
        className="w-full md:w-48"
      >
        Entrar
      </Button>
    </div>
  );
}

export default Login; 