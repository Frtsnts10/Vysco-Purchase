import Link from "next/link";
import { Card } from "@heroui/react";

export function Sidebar() {
  return (
    <div className="w-64 border-r border-default-200 p-4 flex flex-col hidden md:flex h-full bg-background">
      <h2 className="text-xl font-bold text-primary mb-8 px-2">Vysco PO</h2>
      <nav className="flex flex-col gap-2">
        <Link href="/" className="p-2 rounded-md hover:bg-default-100 transition-colors font-medium">
          Dashboard
        </Link>
        <Link href="/units" className="p-2 rounded-md hover:bg-default-100 transition-colors font-medium">
          Units
        </Link>
        <Link href="/suppliers" className="p-2 rounded-md hover:bg-default-100 transition-colors font-medium">
          Suppliers
        </Link>
        <Link href="/transactions" className="p-2 rounded-md hover:bg-default-100 transition-colors font-medium">
          Transactions
        </Link>
      </nav>
    </div>
  );
}
