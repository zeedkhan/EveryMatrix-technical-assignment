import { NavLink } from "react-router-dom";
import { Button } from "./components/ui/button"
import useAuth from "./hooks/use-auth";

function App() {
  const { auth } = useAuth();

  return (
    <main className="flex flex-col justify-center py-8">
      <div className="flex flex-col space-y-8 items-center">
        <h2 className="text-bold text-2xl">Welcome to your new app!</h2>
        <div>
          <Button>
            <NavLink to={auth ? "/chats" : '/auth/login'}>{auth ? "Go to chats" : "Login"}</NavLink>
          </Button>
        </div>

      </div>
    </main>
  )
}

export default App
