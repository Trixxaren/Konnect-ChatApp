// visar bara utloggningsknappen när användaren är inloggad
import { useAuth } from "../auth/AuthContext";

function SideNav() {
  const { user, logout } = useAuth();

  return (
    <div>
      {user ? (
        <>
          <p>Hej {user.name}</p>
          <button onClick={logout}>Logga ut</button>
        </>
      ) : (
        <p>Inte inloggad</p>
      )}
    </div>
  );
}

export default SideNav;
