import React, { forwardRef, useEffect } from "react";

const UserVideo = forwardRef(({ call, callingUserName }, ref) => {
  return (
    <div className="w-full bg-gray-100 rounded-lg p-2 mt-5">
      <h2 className="text-center font-semibold">{call?.name || callingUserName}</h2>
      <video ref={ref} playsInline className="bg-blue-gray-500 w-full rounded-md" autoPlay />
    </div>
  );
});

export default UserVideo;
