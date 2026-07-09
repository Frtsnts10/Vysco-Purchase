"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { Card, Input, Button } from "@heroui/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // router.push("/") will be handled by useEffect
    } catch (err: any) {
      console.error(err);
      setError("Email atau kata sandi salah. Silakan coba lagi.");
      setIsLoggingIn(false);
    }
  };

  if (loading || user) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Memuat...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-default-50 p-4">
      <Card className="w-full max-w-md p-6">
        <Card.Header className="flex flex-col items-center gap-2 mb-4">
          <h1 className="text-2xl font-bold text-primary">Vysco PO</h1>
          <p className="text-default-500 text-sm">Masuk ke Dasbor Manajemen Pembelian</p>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="admin@vysco.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Kata Sandi</label>
              <Input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-danger text-sm">{error}</p>}
            <Button variant="primary" type="submit" isDisabled={isLoggingIn} className="mt-2">
              {isLoggingIn ? "Memuat..." : "Masuk"}
            </Button>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}
