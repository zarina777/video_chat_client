import Login from "./components/login/Login";
import Video from "./components/videovizov/Video";
import Users from "./components/users/User";

const App = () => {
  return (
    <div className="grid grid-cols-3 h-[100vh]">
      <Login />
      <Video />
      <Users />
    </div>
  );
};

export default App;
