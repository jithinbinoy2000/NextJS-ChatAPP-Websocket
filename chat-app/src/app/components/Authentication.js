"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Authetication() {
  const [defultAPI, setDefualtAPI] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `${defultAPI ? "http://localhost:8000/login" : "http://localhost:8000/register"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );
      const result = await response.json();
      
      if (response.ok) {
        if (result.token) {
          sessionStorage.setItem("userdata", JSON.stringify({ token: result.token }));
          sessionStorage.setItem("username",JSON.stringify(result.username))
          router.push('/rooms');
        } else {
          router.push("/");
        }
      } else {
        console.log(result.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (

    <div className="auth-container flex flex-col gap-5 text-white items-center justify-center text-lg font-bold">
      <h1 className="text-3xl font-bold  transition 2s">{defultAPI ? "LogIn" : "Register"}</h1>
      <input
        type="text"
        className="w-[300px] h-10 rounded-lg bg-transparent border border-emerald-300 select:border-emerald-500 p-4"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        className="w-[300px] h-10 rounded-lg bg-transparent border border-emerald-300 select:border-emerald-500 p-4"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSubmit} className={`w-[200px] h-10 rounded-lg bg-transparent border border-white select:border-emerald-500 p-1 ${!username || !password ? "cursor-not-allowed" : "cursor-pointer"}`}>
        {defultAPI ? "LogIn" : "Register"}
      </button>
      <span onClick={() => setDefualtAPI(!defultAPI)} className="text-sm w-[100%] text-end text-blue-500 underline hover:text-blue-400 cursor-pointer">
        {defultAPI ? "Register" : "Login"}
      </span>
    </div>
  );
}
