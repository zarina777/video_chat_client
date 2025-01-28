import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { SocketContext } from "../../SocketContext";
import api from "../../api";

const Login = () => {
  const { setMe, me, socket } = useContext(SocketContext);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    api
      .get(`/users/`)
      .then((response) => {
        setUsers(response.data); // Set the list of users
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);

  function submitForm(event) {
    event.preventDefault(); // Prevents page reload on form submission
    if (!selectedUserId) {
      alert("Please select a user.");
      return;
    }
    api
      .get(`/users/${selectedUserId}`) // Use ID in the query
      .then((response) => {
        setMe(response.data);
        socket.emit("authenticate", response.data._id);
      })
      .catch((error) => {
        console.error("There was an error making the request:", error);
      });
  }

  return (
    <div className="border-r-2 border-r-black bg-blue-gray-100">
      {me && (
        <h1 className="text-4xl flex justify-center items-center h-full">
          <span>{me?.name}</span>
        </h1>
      )}
      {!me && (
        <form onSubmit={submitForm} className="flex justify-center items-center flex-col h-full gap-4">
          <h1 className="text-4xl">Log in</h1>
          <select className="rounded py-2 px-3" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
            <option value="">Select a user</option>
            {users?.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
          <button type="submit" className="bg-blue-600 px-7 py-3 rounded-lg text-white">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default Login;
