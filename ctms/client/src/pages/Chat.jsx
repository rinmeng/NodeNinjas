import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/utils/AuthProvider";

const Chat = () => {
  const { user } = useAuth();

  return (
    <>
      <div className="px-20">Hello World</div>
    </>
  );
};

export default Chat;
