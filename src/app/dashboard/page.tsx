"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function DashboardPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState<Record<string, string>>({});
  const [startDate, setStartDate] = useState<string | null>(null);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Normalize today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Month navigation state
  const [viewDate, setViewDate] = useState(new Date());
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const monthName = viewDate.toLocaleString("default", { month: "long" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        setLoading(false);
        return;
      }

      setUser(currentUser);

      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUsername(data.username || "");
        setStreakData(data.streakData || {});
        setStartDate(data.startDate || null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const saveStartDate = async (date: string) => {
    if (!user) return;

    await updateDoc(doc(db, "users", user.uid), {
      startDate: date,
    });

    setStartDate(date);
  };

  const getDaysInMonth = () => {
    const days = new Date(viewYear, viewMonth + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => i + 1);
  };

  const confirmToggle = async () => {
    if (!user || selectedDay === null) return;

    const formatted = `${viewYear}-${viewMonth + 1}-${selectedDay}`;

    const updatedData = {
      ...streakData,
      [formatted]:
        streakData[formatted] === "relapse" ? "success" : "relapse",
    };

    setStreakData(updatedData);

    await updateDoc(doc(db, "users", user.uid), {
      streakData: updatedData,
    });

    setShowConfirm(false);
    setSelectedDay(null);
  };

  // 🔥 Current Streak
  const calculateCurrentStreak = () => {
    if (!startDate) return 0;

    const [sy, sm, sd] = startDate.split("-").map(Number);
    const startObj = new Date(sy, sm - 1, sd);
    startObj.setHours(0, 0, 0, 0);

    if (startObj.getTime() === today.getTime()) {
      const key = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
      return streakData[key] === "relapse" ? 0 : 1;
    }

    let streak = 0;

    for (let i = 1; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      if (date.getTime() < startObj.getTime()) break;

      const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

      if (streakData[key] === "relapse") break;

      streak++;
    }

    return streak;
  };

  // 🏆 Longest Streak
  const calculateLongestStreak = () => {
    if (!startDate) return 0;

    const [sy, sm, sd] = startDate.split("-").map(Number);
    const startObj = new Date(sy, sm - 1, sd);
    startObj.setHours(0, 0, 0, 0);

    let longest = 0;
    let current = 0;

    for (
      let date = new Date(startObj);
      date <= today;
      date.setDate(date.getDate() + 1)
    ) {
      const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

      if (streakData[key] === "relapse") {
        current = 0;
      } else {
        current++;
        longest = Math.max(longest, current);
      }
    }

    return longest;
  };

  const totalRelapses = Object.values(streakData).filter(
    (v) => v === "relapse"
  ).length;

  let totalTrackedDays = 0;

  if (startDate) {
    const [sy, sm, sd] = startDate.split("-").map(Number);
    const startObj = new Date(sy, sm - 1, sd);
    startObj.setHours(0, 0, 0, 0);

    totalTrackedDays =
      Math.floor(
        (today.getTime() - startObj.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    totalTrackedDays = Math.max(totalTrackedDays, 0);
  }

  const cleanDays = totalTrackedDays - totalRelapses;

  const successRate =
    totalTrackedDays > 0
      ? Math.round((cleanDays / totalTrackedDays) * 100)
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Resurge</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      <div className="bg-zinc-900 p-6 rounded-2xl mb-6">
        Hello{" "}
        <span className="text-green-400 font-semibold">
          {username || user?.email}
        </span>{" "}
        👋
      </div>

      {!startDate && (
        <div className="bg-zinc-900 p-6 rounded-2xl mb-6">
          <h2 className="mb-2 font-semibold">Select your start date</h2>
          <input
            type="date"
            className="bg-zinc-800 p-2 rounded-lg"
            onChange={(e) => saveStartDate(e.target.value)}
          />
        </div>
      )}

      {startDate && (
        <>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Current Streak" value={`${calculateCurrentStreak()} 🔥`} />
            <StatCard label="Longest Streak" value={`${calculateLongestStreak()} 🏆`} />
            <StatCard label="Clean Days" value={cleanDays} />
            <StatCard label="Success Rate" value={`${successRate}%`} />
          </div>

          <div className="bg-zinc-900 p-6 rounded-2xl">
            {/* Month Navigation */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() =>
                  setViewDate(new Date(viewYear, viewMonth - 1, 1))
                }
                className="bg-zinc-800 px-3 py-1 rounded-lg"
              >
                ◀
              </button>

              <h2 className="text-2xl font-bold">
                {monthName} {viewYear}
              </h2>

              <button
                onClick={() => {
                  const next = new Date(viewYear, viewMonth + 1, 1);

                  if (
                    next.getFullYear() < today.getFullYear() ||
                    (next.getFullYear() === today.getFullYear() &&
                      next.getMonth() <= today.getMonth())
                  ) {
                    setViewDate(next);
                  }
                }}
                className="bg-zinc-800 px-3 py-1 rounded-lg"
              >
                ▶
              </button>
            </div>

            <div className="grid grid-cols-7 gap-4">
              {getDaysInMonth().map((day) => {
                const dateObj = new Date(viewYear, viewMonth, day);
                dateObj.setHours(0, 0, 0, 0);

                const formatted = `${viewYear}-${viewMonth + 1}-${day}`;

                const isFuture =
                  dateObj.getTime() > today.getTime();

                let isBeforeStart = false;
                if (startDate) {
                  const [sy, sm, sd] =
                    startDate.split("-").map(Number);
                  const startObj = new Date(sy, sm - 1, sd);
                  startObj.setHours(0, 0, 0, 0);

                  isBeforeStart =
                    dateObj.getTime() < startObj.getTime();
                }

                const isToday =
                  dateObj.getTime() === today.getTime();

                const status = streakData[formatted];

                return (
                  <div
                    key={day}
                    onClick={() => {
                      if (!isFuture && !isBeforeStart) {
                        setSelectedDay(day);
                        setShowConfirm(true);
                      }
                    }}
                    className={`
                      flex items-center justify-center
                      h-12 rounded-xl font-semibold transition relative
                      ${
                        isFuture || isBeforeStart
                          ? "bg-zinc-800 text-gray-500 cursor-not-allowed"
                          : status === "relapse"
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-600 hover:bg-green-700"
                      }
                      ${
                        isToday
                          ? "ring-4 ring-yellow-400 scale-105"
                          : ""
                      }
                    `}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-zinc-900 p-6 rounded-2xl w-80 text-center">
            <p className="mb-4">
              {streakData[
                `${viewYear}-${viewMonth + 1}-${selectedDay}`
              ] === "relapse"
                ? "Remove relapse for this day?"
                : "Mark this day as relapse?"}
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={confirmToggle}
                className="bg-green-600 px-4 py-2 rounded-lg"
              >
                Confirm
              </button>

              <button
                onClick={() => {
                  setShowConfirm(false);
                  setSelectedDay(null);
                }}
                className="bg-red-500 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-zinc-900 p-5 rounded-2xl text-center">
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      <p className="text-2xl font-bold text-green-400">{value}</p>
    </div>
  );
}
