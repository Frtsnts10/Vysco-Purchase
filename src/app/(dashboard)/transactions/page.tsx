"use client";

import { useState, useEffect } from "react";
import { 
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Input, Chip
} from "@heroui/react";
import { Upload, Search, Plus, ReceiptText } from "lucide-react";
import Link from "next/link";
import { getRecentTransactions, createTransaction, Transaction } from "@/lib/services/transactionService";
import { getUnits, Unit } from "@/lib/services/unitService";
import { getSuppliers, Supplier } from "@/lib/services/supplierService";
import { Modal } from "@heroui/react";
import { motion, Variants } from "framer-motion";

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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="flex flex-col gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header variants={itemVariants} className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Riwayat Transaksi (PO)
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Pantau dan kelola seluruh transaksi Purchase Order Anda.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            className="bg-slate-800 hover:bg-slate-700 text-white border border-white/10 font-semibold"
            onPress={() => setIsModalOpen(true)}
          >
            <Plus size={18} /> Tambah Manual
          </Button>
          <Link href="/transactions/import">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 border-none font-semibold">
              <Upload size={18} /> Import Excel
            </Button>
          </Link>
        </div>
      </motion.header>
      
      <motion.div variants={itemVariants} className="flex gap-4 items-center">
        <Input
          className="max-w-md"
          aria-label="Cari transaksi"
          placeholder="Cari nama barang, no PO, unit, supplier..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startContent={<Search className="text-slate-400" size={18}/>}
          classNames={{ inputWrapper: "bg-slate-900/50 border border-white/10 hover:bg-slate-800 focus-within:!bg-slate-900", input: "text-white" }}
        />
        <div className="px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold tracking-wider">
          TERBARU: 100 ENTRI
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden p-2">
        <Table aria-label="Transactions Table" removeWrapper className="bg-transparent" classNames={{
          th: "bg-slate-800/50 text-slate-300 font-bold border-b border-white/5",
          td: "py-4 border-b border-white/5 text-slate-200",
          tr: "hover:bg-slate-800/30 transition-colors"
        }}>
          <TableHeader>
            <TableColumn>TANGGAL ORDER</TableColumn>
            <TableColumn>NO PO</TableColumn>
            <TableColumn>UNIT</TableColumn>
            <TableColumn>SUPPLIER</TableColumn>
            <TableColumn>NAMA BARANG</TableColumn>
            <TableColumn>QTY</TableColumn>
            <TableColumn align="end">TOTAL (DPP+PPN)</TableColumn>
          </TableHeader>
          <TableBody items={filteredTransactions} isLoading={isLoading}>
            {(item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <span className="text-slate-300 font-medium">{formatDate(item.tanggalOrder)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ReceiptText size={16} className="text-blue-400" />
                    <span className="font-bold text-blue-400">{item.noPo}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="px-3 py-1 bg-slate-800 border border-white/5 rounded-md text-xs font-mono text-slate-300">
                    {item.kodeUnit}
                  </span>
                </TableCell>
                <TableCell>{item.supplierNama}</TableCell>
                <TableCell className="font-medium text-white">{item.namaBarang}</TableCell>
                <TableCell>
                  <span className="font-bold">{item.qty}</span> <span className="text-xs text-slate-400 uppercase">{item.satuan}</span>
                </TableCell>
                <TableCell className="font-extrabold text-white text-right">
                  Rp {(item.dpp + item.ppn).toLocaleString('id-ID')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>

      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen} classNames={{
        base: "bg-slate-900 border border-white/10 shadow-2xl max-w-2xl",
        header: "border-b border-white/5",
        footer: "border-t border-white/5"
      }}>
        <Modal.Content>
          <Modal.Header className="flex flex-col gap-1 text-white">Tambah Transaksi Baru</Modal.Header>
          <Modal.Body className="py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">No PO *</label>
                <Input 
                  placeholder="No PO (Contoh: PO-2023-001)" 
                  value={noPo} onChange={(e) => setNoPo(e.target.value)} 
                  classNames={{ inputWrapper: "bg-slate-800 border border-white/5 hover:bg-slate-700 focus-within:!bg-slate-800", input: "text-white" }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Tanggal Order</label>
                <Input 
                  value={new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date())} 
                  disabled
                  classNames={{ inputWrapper: "bg-slate-800/50 border border-white/5 opacity-70", input: "text-slate-400 font-medium" }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Pilih Unit *</label>
                <select 
                  className="w-full p-2.5 border border-white/5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  value={unitId} onChange={(e) => setUnitId(e.target.value)}
                >
                  <option value="">Pilih Unit...</option>
                  {units.map(u => <option key={u.id} value={u.id!}>{u.kodeUnit} - {u.jenisUnit}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Pilih Supplier *</label>
                <select 
                  className="w-full p-2.5 border border-white/5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  value={supplierId} onChange={(e) => setSupplierId(e.target.value)}
                >
                  <option value="">Pilih Supplier...</option>
                  {suppliers.map(s => <option key={s.id} value={s.id!}>{s.namaSupplier}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-2 col-span-2">
                <label className="text-sm font-medium text-slate-300">Nama Barang *</label>
                <Input 
                  placeholder="Nama barang atau jasa" 
                  value={namaBarang} onChange={(e) => setNamaBarang(e.target.value)} 
                  classNames={{ inputWrapper: "bg-slate-800 border border-white/5 hover:bg-slate-700 focus-within:!bg-slate-800", input: "text-white" }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Kuantitas & Satuan *</label>
                <div className="flex gap-2">
                  <Input 
                    type="number" placeholder="Qty" 
                    value={qty.toString()} onChange={(e) => setQty(Number(e.target.value))} 
                    classNames={{ inputWrapper: "bg-slate-800 border border-white/5 hover:bg-slate-700 focus-within:!bg-slate-800", input: "text-white" }}
                  />
                  <Input 
                    placeholder="PCS" 
                    value={satuan} onChange={(e) => setSatuan(e.target.value)} 
                    classNames={{ inputWrapper: "bg-slate-800 border border-white/5 hover:bg-slate-700 focus-within:!bg-slate-800", input: "text-white" }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Harga Satuan (Rp) *</label>
                <Input 
                  type="number" placeholder="0" 
                  value={hargaSatuan.toString()} onChange={(e) => setHargaSatuan(Number(e.target.value))} 
                  classNames={{ inputWrapper: "bg-slate-800 border border-white/5 hover:bg-slate-700 focus-within:!bg-slate-800", input: "text-white font-bold text-lg" }}
                  startContent={<span className="text-slate-400 mr-1">Rp</span>}
                />
              </div>

              <div className="col-span-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mt-2 flex justify-between items-center">
                <div>
                  <div className="text-sm text-blue-300/80 mb-1">DPP: Rp {(qty * hargaSatuan).toLocaleString('id-ID')}</div>
                  <div className="text-sm text-blue-300/80">PPN (11%): Rp {(qty * hargaSatuan * 0.11).toLocaleString('id-ID')}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Total Biaya</div>
                  <div className="text-2xl font-extrabold text-white">Rp {(qty * hargaSatuan * 1.11).toLocaleString('id-ID')}</div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button className="bg-transparent text-slate-400 hover:text-white" onPress={() => setIsModalOpen(false)}>Batal</Button>
            <Button className="bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/30" onPress={handleSave}>Simpan Transaksi</Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </motion.div>
  );
}
