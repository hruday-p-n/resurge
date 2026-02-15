"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 flex justify-between items-center px-6 sm:px-8 py-4 border-b border-zinc-800 bg-black/80 backdrop-blur-md">

        <div className="flex items-center gap-3">
          <Image
            src="/icon.png"
            alt="Resurge Logo"
            width={32}
            height={32}
          />
          <h1 className="text-2xl font-bold text-blue-400">
            Resurge
          </h1>
        </div>

        <div className="flex gap-4">
          <Link
            href="/login"
            className="border border-zinc-600 hover:border-blue-700 px-4 py-1 rounded-lg font-semibold transition"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded-lg font-semibold transition"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex flex-col items-center text-center px-6 py-24 max-w-4xl mx-auto">
        <h2 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          Break the cycle. <br />
          <span className="text-blue-400">
            Build discipline daily.
          </span>
        </h2>

        <p className="text-gray-400 text-lg md:text-xl mb-10">
          Resurge helps you track your daily streak, visualize progress,
          and build long-term self-control with clarity and accountability.
        </p>

        <div className="flex gap-6">
          <Link
            href="/signup"
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl font-semibold text-lg transition"
          >
            Get Started
          </Link>

          <Link
            href="/login"
            className="border border-zinc-700 hover:border-blue-500 px-8 py-3 rounded-xl text-lg transition"
          >
            Login
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-zinc-900 py-20 px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          <FeatureCard
            title="Track Your Streak"
            description="See your current streak, longest streak, and success rate at a glance."
          />
          <FeatureCard
            title="Monthly Calendar View"
            description="Visualize relapse and success days clearly with an intuitive calendar."
          />
          <FeatureCard
            title="Real Accountability"
            description="Mark relapses honestly and watch your progress evolve over time."
          />
        </div>
      </section>

      <footer className="border-t border-zinc-800 py-8 text-center text-gray-500 text-sm">
        <p>Resurge v1.2</p>
        <p className="mt-2">
          Made by <span className="text-blue-400 font-medium">MazeRunner1531</span>
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-black border border-zinc-800 p-8 rounded-2xl hover:border-blue-500 transition">
      <h4 className="text-xl font-semibold mb-4 text-blue-400">
        {title}
      </h4>
      <p className="text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
