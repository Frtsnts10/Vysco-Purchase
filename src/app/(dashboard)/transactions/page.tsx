"use client";

import { useState, useEffect } from "react";
import { 
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Input, Chip
} from "@heroui/react";
import { Upload, Search } from "lucide-react";
import Link from "next/link";
import { getRecentTransactions, Transaction } from "@/lib/services/transactionService";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await getRecentTransactions(100);
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.namaBarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.noPo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.kodeUnit.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.supplierNama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date);
  };

  return (
    <div className="p-8 flex flex-col gap-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Riwayat Transaksi (PO)</h1>
        <Button as={Link} href="/transactions/import" color="primary" startContent={<Upload size={18} />}>
          Import Excel
        </Button>
      </header>
      
      <div className="flex gap-4 items-center">
        <Input
          className="max-w-md"
          placeholder="Cari nama barang, no PO, unit..."
          startContent={<Search size={18} className="text-default-400" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Chip variant="flat" color="primary">Latest 100 entries</Chip>
      </div>

      <Table aria-label="Transactions Table" className="bg-background max-h-[700px]" isHeaderSticky>
        <TableHeader>
          <TableColumn>TANGGAL ORDER</TableColumn>
          <TableColumn>NO PO</TableColumn>
          <TableColumn>UNIT</TableColumn>
          <TableColumn>SUPPLIER</TableColumn>
          <TableColumn>NAMA BARANG</TableColumn>
          <TableColumn>QTY</TableColumn>
          <TableColumn>TOTAL (DPP+PPN)</TableColumn>
        </TableHeader>
        <TableBody emptyContent={isLoading ? "Loading..." : "No transactions found."} items={filteredTransactions}>
          {(item) => (
            <TableRow key={item.id}>
              <TableCell>{formatDate(item.tanggalOrder)}</TableCell>
              <TableCell className="font-medium text-primary">{item.noPo}</TableCell>
              <TableCell>
                <Chip size="sm" variant="faded">{item.kodeUnit}</Chip>
              </TableCell>
              <TableCell>{item.supplierNama}</TableCell>
              <TableCell>{item.namaBarang}</TableCell>
              <TableCell>{item.qty} {item.satuan}</TableCell>
              <TableCell className="font-semibold">
                Rp {(item.dpp + item.ppn).toLocaleString('id-ID')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
