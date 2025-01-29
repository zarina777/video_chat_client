import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { IoCallSharp } from "react-icons/io5";
import { SocketContext } from "../../SocketContext";
import api from "../../api";

const Users = () => {
  const [users, setUsers] = useState([]); // State to hold the list of users
  const { me, socket, stream, callUserFn, online, busyLine, setCallID } = useContext(SocketContext);
  useEffect(() => {
    api
      .get(`/users`)
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);

  return (
    <div className="bg-blue-gray-400 flex justify-center  flex-col w-full p-10 ">
      {online && <p className="text-2xl text-center p-3 bg-white">{online}</p>}
      {busyLine && <p className="text-2xl text-center p-3 bg-yellow-400">{busyLine}</p>}
      <h1 className="text-2xl text-center p-3 text-white">Users</h1>
      <ul className="bg-white ">
        {users?.map((user) => {
          if (user._id != me?._id)
            return (
              <li key={user._id} className="border-b-2 border-b-black flex justify-between p-7 items-center">
                <h2 className="text-blue-900 w-full text-lg "> {user.name}</h2>
                <span className="text-blue-gray-800 mr-2">ID:{user._id}</span>
                <span
                  onClick={() => {
                    setCallID(user._id);
                    callUserFn(user._id, user.name);
                  }}
                  className="p-4 rounded-full bg-blue-700 flex justify-center items-center cursor-pointer hover:-translate-y-2"
                >
                  <IoCallSharp className="text-2xl text-gray-200" />
                </span>
              </li>
            );
        })}
      </ul>
    </div>
  );
};

export default Users;
