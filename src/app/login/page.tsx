"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Sign Up
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Create Firestore document
        await setDoc(doc(db, "users", userCredential.user.uid), {
          username,
          email,
          createdAt: new Date(),
          streakData: {},
        });
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-zinc-900 p-8 rounded-2xl w-96 shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Resurge
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Username (Signup Only) */}
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              className="p-3 rounded bg-zinc-800 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            className="p-3 rounded bg-zinc-800 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            className="p-3 rounded bg-zinc-800 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 transition p-3 rounded font-semibold"
          >
            {isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          {isLogin ? "No account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-green-400 underline"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
