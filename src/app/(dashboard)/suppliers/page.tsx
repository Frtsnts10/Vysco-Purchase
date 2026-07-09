"use client";

import { useState, useEffect } from "react";
import { 
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Input, Modal, Drawer
} from "@heroui/react";
import { Plus, Edit, Trash2, Eye, MessageCircle, Mail, Users } from "lucide-react";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, Supplier } from "@/lib/services/supplierService";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  
  // Form State
  const [namaSupplier, setNamaSupplier] = useState("");
  const [alamat, setAlamat] = useState("");
  const [noTelp, setNoTelp] = useState("");
  const [noWa, setNoWa] = useState("");
  const [email, setEmail] = useState("");
  const [fax, setFax] = useState("");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setNamaSupplier("");
    setAlamat("");
    setNoTelp("");
    setNoWa("");
    setEmail("");
    setFax("");
    setIsModalOpen(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingId(supplier.id!);
    setNamaSupplier(supplier.namaSupplier);
    setAlamat(supplier.alamat || "");
    setNoTelp(supplier.noTelp || "");
    setNoWa(supplier.noWa || "");
    setEmail(supplier.email || "");
    setFax(supplier.fax || "");
    setIsModalOpen(true);
  };
  
  const openDetailsDrawer = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!namaSupplier) return alert("Nama Supplier is required");
    
    try {
      const data = { namaSupplier, alamat, noTelp, noWa, email, fax };
      if (editingId) {
        await updateSupplier(editingId, data);
      } else {
        await createSupplier(data);
      }
      fetchSuppliers();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save supplier:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      try {
        await deleteSupplier(id);
        fetchSuppliers();
      } catch (error) {
        console.error("Failed to delete supplier:", error);
      }
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
            Daftar Supplier
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Kelola data vendor dan penyedia suku cadang.</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 border-none font-semibold"
          onPress={openAddModal}
        >
          <div className="flex items-center gap-2">
            <Plus size={18} />
            Tambah Supplier
          </div>
        </Button>
      </motion.header>
      
      <motion.div variants={itemVariants} className="rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden p-2">
        <Table aria-label="Suppliers Table" removeWrapper className="bg-transparent" classNames={{
          th: "bg-slate-800/50 text-slate-300 font-bold border-b border-white/5",
          td: "py-4 border-b border-white/5 text-slate-200",
          tr: "hover:bg-slate-800/30 transition-colors"
        }}>
          <TableHeader>
            <TableColumn>NAMA SUPPLIER</TableColumn>
            <TableColumn>KONTAK UTAMA</TableColumn>
            <TableColumn>AKSI CEPAT</TableColumn>
            <TableColumn>AKSI</TableColumn>
          </TableHeader>
          <TableBody items={suppliers} isLoading={isLoading}>
            {(item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <Users size={16} className="text-indigo-400" />
                    </div>
                    <span className="font-bold text-white">{item.namaSupplier}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-slate-300 font-medium">{item.noTelp || item.noWa || item.email || "-"}</span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-3">
                    {item.noWa && (
                      <Link href={`https://wa.me/${item.noWa.replace(/\D/g, '')}`} target="_blank" className="text-emerald-400 hover:text-emerald-300 hover:scale-110 transition-all bg-emerald-500/10 p-2 rounded-lg">
                        <MessageCircle size={18} />
                      </Link>
                    )}
                    {item.email && (
                      <Link href={`mailto:${item.email}`} className="text-blue-400 hover:text-blue-300 hover:scale-110 transition-all bg-blue-500/10 p-2 rounded-lg">
                        <Mail size={18} />
                      </Link>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button isIconOnly size="sm" className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400" onPress={() => openDetailsDrawer(item)}>
                      <Eye size={16} />
                    </Button>
                    <Button isIconOnly size="sm" className="bg-slate-800 hover:bg-slate-700 text-slate-300" onPress={() => openEditModal(item)}>
                      <Edit size={16} />
                    </Button>
                    <Button isIconOnly size="sm" className="bg-red-500/10 hover:bg-red-500/20 text-red-400" onPress={() => handleDelete(item.id!)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>

      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen} classNames={{
        base: "bg-slate-900 border border-white/10 shadow-2xl",
        header: "border-b border-white/5",
        footer: "border-t border-white/5"
      }}>
        <Modal.Content>
          <Modal.Header className="flex flex-col gap-1 text-white">{editingId ? 'Edit Supplier' : 'Tambah Supplier Baru'}</Modal.Header>
          <Modal.Body className="py-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Nama Supplier *</label>
                <Input 
                  placeholder="Nama Supplier"
                  value={namaSupplier} 
                  onChange={(e) => setNamaSupplier(e.target.value)} 
                  required
                  classNames={{ inputWrapper: "bg-slate-800 border border-white/5 hover:bg-slate-700 focus-within:!bg-slate-800", input: "text-white" }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300">No. Telepon</label>
                  <Input 
                    placeholder="Contoh: 021-123456"
                    value={noTelp} 
                    onChange={(e) => setNoTelp(e.target.value)} 
                    classNames={{ inputWrapper: "bg-slate-800 border border-white/5 hover:bg-slate-700 focus-within:!bg-slate-800", input: "text-white" }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300">No. WhatsApp</label>
                  <Input 
                    value={noWa} 
                    onChange={(e) => setNoWa(e.target.value)} 
                    placeholder="+628..."
                    classNames={{ inputWrapper: "bg-slate-800 border border-white/5 hover:bg-slate-700 focus-within:!bg-slate-800", input: "text-white" }}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Email</label>
                <Input 
                  placeholder="Email"
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  classNames={{ inputWrapper: "bg-slate-800 border border-white/5 hover:bg-slate-700 focus-within:!bg-slate-800", input: "text-white" }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Alamat</label>
                <Input 
                  placeholder="Alamat"
                  value={alamat} 
                  onChange={(e) => setAlamat(e.target.value)} 
                  classNames={{ inputWrapper: "bg-slate-800 border border-white/5 hover:bg-slate-700 focus-within:!bg-slate-800", input: "text-white" }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Fax</label>
                <Input 
                  placeholder="Fax"
                  value={fax} 
                  onChange={(e) => setFax(e.target.value)} 
                  classNames={{ inputWrapper: "bg-slate-800 border border-white/5 hover:bg-slate-700 focus-within:!bg-slate-800", input: "text-white" }}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button className="bg-transparent text-slate-400 hover:text-white" onPress={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button className="bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/30" onPress={() => handleSave()}>
              Simpan
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      <Drawer isOpen={isDrawerOpen} onOpenChange={setIsDrawerOpen} classNames={{
        base: "bg-slate-900 border-l border-white/10",
        header: "border-b border-white/5 text-white"
      }}>
        <Drawer.Content>
          <Drawer.Header className="flex flex-col gap-1">Detail Supplier</Drawer.Header>
          <Drawer.Body>
            {selectedSupplier && (
              <div className="flex flex-col gap-6 mt-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                    <Users size={32} className="text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Nama Supplier</h4>
                    <p className="text-2xl font-extrabold text-white">{selectedSupplier.namaSupplier}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">No. Telepon</h4>
                    <p className="text-slate-200 font-medium">{selectedSupplier.noTelp || "-"}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">No. WhatsApp</h4>
                    <p className="text-slate-200 font-medium">{selectedSupplier.noWa || "-"}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 col-span-2">
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Email</h4>
                    <p className="text-slate-200 font-medium">{selectedSupplier.email || "-"}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 col-span-2">
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Alamat Lengkap</h4>
                    <p className="text-slate-200 font-medium leading-relaxed">{selectedSupplier.alamat || "-"}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 col-span-2">
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Fax</h4>
                    <p className="text-slate-200 font-medium">{selectedSupplier.fax || "-"}</p>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <h4 className="text-blue-400 text-sm font-bold border-b border-blue-500/20 pb-2 mb-3">Riwayat Transaksi</h4>
                  <p className="text-blue-300/70 text-sm italic">Fitur riwayat transaksi akan tersedia di fase selanjutnya.</p>
                </div>
              </div>
            )}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
    </motion.div>
  );
}
