import { useAuth0 } from '@auth0/auth0-react';

function LogoutButton() {
  const { logout, isAuthenticated } = useAuth0();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      className="text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600"
    >
      Sair
    </button>
  );
}

export default LogoutButton; 