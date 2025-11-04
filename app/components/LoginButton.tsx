"use client";

import Link from "next/link";

export default function LoginButton() {
  // const handleLogin = async () => {
  //   await supabase.auth.signInWithOAuth({ provider: "google" });
  // };

  return (
    <>
      {/* <button onClick={handleLogin} className="bg-green-600 text-white p-2 rounded">
        Sign in with Google
      </button> */}
      <Link href={'/login'}>Login</Link>
    </>
  );
}