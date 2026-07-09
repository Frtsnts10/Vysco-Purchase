"use client";

import { useState, useEffect } from "react";
import { 
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Input, Chip
} from "@heroui/react";
import { Upload, Search, Plus } from "lucide-react";
import Link from "next/link";
import { getRecentTransactions, createTransaction, Transaction } from "@/lib/services/transactionService";
import { getUnits, Unit } from "@/lib/services/unitService";
import { getSuppliers, Supplier } from "@/lib/services/supplierService";
import { Modal } from "@heroui/react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Form
  const [unitId, setUnitId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [noPo, setNoPo] = useState("");
  const [namaBarang, setNamaBarang] = useState("");
  const [qty, setQty] = useState(1);
  const [satuan, setSatuan] = useState("PCS");
  const [hargaSatuan, setHargaSatuan] = useState(0);

  useEffect(() => {
    fetchTransactions();
    fetchLookups();
  }, []);

  const fetchLookups = async () => {
    try {
      const [u, s] = await Promise.all([getUnits(), getSuppliers()]);
      setUnits(u);
      setSuppliers(s);
    } catch (e) {
      console.error(e);
    }
  };

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

  const handleSave = async () => {
    if (!unitId || !supplierId || !namaBarang || !noPo) return alert("Please fill all required fields");
    
    const selectedUnit = units.find(u => u.id === unitId);
    const selectedSupplier = suppliers.find(s => s.id === supplierId);
    
    const dpp = qty * hargaSatuan;
    const ppn = dpp * 0.11;

    try {
      await createTransaction({
        unitId,
        kodeUnit: selectedUnit?.kodeUnit || "",
        supplierId,
        supplierNama: selectedSupplier?.namaSupplier || "",
        noPo,
        namaBarang,
        qty,
        satuan,
        hargaSatuan,
        dpp,
        ppn,
        tanggalOrder: new Date()
      });
      setIsModalOpen(false);
      fetchTransactions();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-8 flex flex-col gap-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Riwayat Transaksi (PO)</h1>
        <div className="flex gap-2">
          <Button variant="outline" onPress={() => setIsModalOpen(true)}>
            <Plus size={18} /> Add Manual
          </Button>
          <Link href="/transactions/import">
            <Button variant="primary">
              <Upload size={18} /> Import Excel
            </Button>
          </Link>
        </div>
      </header>
      
      <div className="flex gap-4 items-center">
        <Input
          className="max-w-md"
          aria-label="Cari transaksi"
          placeholder="Cari nama barang, no PO, unit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">Latest 100 entries</div>
      </div>

      <Table aria-label="Transactions Table" className="bg-background max-h-[700px]">
        <TableHeader>
          <TableColumn>TANGGAL ORDER</TableColumn>
          <TableColumn>NO PO</TableColumn>
          <TableColumn>UNIT</TableColumn>
          <TableColumn>SUPPLIER</TableColumn>
          <TableColumn>NAMA BARANG</TableColumn>
          <TableColumn>QTY</TableColumn>
          <TableColumn>TOTAL (DPP+PPN)</TableColumn>
        </TableHeader>
        <TableBody items={filteredTransactions}>
          {(item) => (
            <TableRow key={item.id}>
              <TableCell>{formatDate(item.tanggalOrder)}</TableCell>
              <TableCell className="font-medium text-primary">{item.noPo}</TableCell>
              <TableCell>
                <span className="px-2 py-1 bg-default-100 rounded-md text-xs">{item.kodeUnit}</span>
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

      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
        <Modal.Dialog>
          <Modal.Header className="flex flex-col gap-1">Add Transaction</Modal.Header>
          <Modal.Body>
            <Input 
              aria-label="No PO" placeholder="No PO" 
              value={noPo} onChange={(e) => setNoPo(e.target.value)} 
            />
            <select 
              className="w-full p-2 border rounded bg-background text-foreground"
              value={unitId} onChange={(e) => setUnitId(e.target.value)}
            >
              <option value="">Select Unit...</option>
              {units.map(u => <option key={u.id} value={u.id!}>{u.kodeUnit}</option>)}
            </select>
            <select 
              className="w-full p-2 border rounded bg-background text-foreground"
              value={supplierId} onChange={(e) => setSupplierId(e.target.value)}
            >
              <option value="">Select Supplier...</option>
              {suppliers.map(s => <option key={s.id} value={s.id!}>{s.namaSupplier}</option>)}
            </select>
            <Input 
              aria-label="Nama Barang" placeholder="Nama Barang" 
              value={namaBarang} onChange={(e) => setNamaBarang(e.target.value)} 
            />
            <div className="flex gap-2">
              <Input 
                aria-label="Qty" type="number" placeholder="Qty" 
                value={qty.toString()} onChange={(e) => setQty(Number(e.target.value))} 
              />
              <Input 
                aria-label="Satuan" placeholder="Satuan (PCS)" 
                value={satuan} onChange={(e) => setSatuan(e.target.value)} 
              />
            </div>
            <Input 
              aria-label="Harga Satuan" type="number" placeholder="Harga Satuan (Rp)" 
              value={hargaSatuan.toString()} onChange={(e) => setHargaSatuan(Number(e.target.value))} 
            />
            <div className="p-3 bg-default-100 rounded-lg text-sm flex justify-between">
              <span>DPP: Rp {(qty * hargaSatuan).toLocaleString('id-ID')}</span>
              <span>PPN: Rp {(qty * hargaSatuan * 0.11).toLocaleString('id-ID')}</span>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger-soft" onPress={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onPress={handleSave}>Save</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal>
    </div>
  );
}
