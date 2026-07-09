"use client";

import { useState, useEffect } from "react";
import { 
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Input, Modal
} from "@heroui/react";
import { Plus, Edit, Trash2, Truck } from "lucide-react";
import { getUnits, createUnit, updateUnit, deleteUnit, Unit } from "@/lib/services/unitService";
import { motion } from "framer-motion";

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [kodeUnit, setKodeUnit] = useState("");
  const [jenisUnit, setJenisUnit] = useState("");
  const [sn, setSn] = useState("");

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    setIsLoading(true);
    try {
      const data = await getUnits();
      setUnits(data);
    } catch (error) {
      console.error("Failed to fetch units:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setKodeUnit("");
    setJenisUnit("");
    setSn("");
    setIsOpen(true);
  };

  const openEditModal = (unit: Unit) => {
    setEditingId(unit.id!);
    setKodeUnit(unit.kodeUnit);
    setJenisUnit(unit.jenisUnit);
    setSn(unit.sn);
    setIsOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateUnit(editingId, { kodeUnit, jenisUnit, sn });
      } else {
        await createUnit({ kodeUnit, jenisUnit, sn });
      }
      fetchUnits();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save unit:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this unit?")) {
      try {
        await deleteUnit(id);
        fetchUnits();
      } catch (error) {
        console.error("Failed to delete unit:", error);
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
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
            Daftar Unit
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Kelola data alat berat dan kendaraan Anda.</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 border-none font-semibold"
          onPress={openAddModal}
        >
          <div className="flex items-center gap-2">
            <Plus size={18} />
            Tambah Unit
          </div>
        </Button>
      </motion.header>
      
      <motion.div variants={itemVariants} className="rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden p-2">
        <Table aria-label="Units Table" removeWrapper className="bg-transparent" classNames={{
          th: "bg-slate-800/50 text-slate-300 font-bold border-b border-white/5",
          td: "py-4 border-b border-white/5 text-slate-200",
          tr: "hover:bg-slate-800/30 transition-colors"
        }}>
          <TableHeader>
            <TableColumn>KODE UNIT</TableColumn>
            <TableColumn>JENIS UNIT</TableColumn>
            <TableColumn>SERIAL NUMBER</TableColumn>
            <TableColumn>AKSI</TableColumn>
          </TableHeader>
          <TableBody items={units} isLoading={isLoading}>
            {(item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Truck size={16} className="text-blue-400" />
                    </div>
                    <span className="font-bold text-white">{item.kodeUnit}</span>
                  </div>
                </TableCell>
                <TableCell>{item.jenisUnit}</TableCell>
                <TableCell>
                  <span className="font-mono text-xs px-2 py-1 bg-slate-800 rounded-md text-slate-400 border border-white/5">{item.sn}</span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
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

      <Modal isOpen={isOpen} onOpenChange={setIsOpen} classNames={{
        base: "bg-slate-900 border border-white/10 shadow-2xl",
        header: "border-b border-white/5",
        footer: "border-t border-white/5"
      }}>
        <Modal.Content>
          <Modal.Header className="flex flex-col gap-1 text-white">{editingId ? 'Edit Unit' : 'Tambah Unit Baru'}</Modal.Header>
          <Modal.Body className="py-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Kode Unit</label>
                <Input 
                  value={kodeUnit} 
                  onChange={(e) => setKodeUnit(e.target.value)} 
                  placeholder="Contoh: PC200-8"
                  classNames={{ inputWrapper: "bg-slate-800 border border-white/5 hover:bg-slate-700 focus-within:!bg-slate-800", input: "text-white" }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Jenis Unit</label>
                <Input 
                  value={jenisUnit} 
                  onChange={(e) => setJenisUnit(e.target.value)} 
                  placeholder="Contoh: Excavator"
                  classNames={{ inputWrapper: "bg-slate-800 border border-white/5 hover:bg-slate-700 focus-within:!bg-slate-800", input: "text-white" }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-300">Serial Number (SN)</label>
                <Input 
                  value={sn} 
                  onChange={(e) => setSn(e.target.value)} 
                  placeholder="Masukkan SN Unit"
                  classNames={{ inputWrapper: "bg-slate-800 border border-white/5 hover:bg-slate-700 focus-within:!bg-slate-800", input: "text-white" }}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button className="bg-transparent text-slate-400 hover:text-white" onPress={() => setIsOpen(false)}>
              Batal
            </Button>
            <Button className="bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/30" onPress={() => handleSave()}>
              Simpan
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </motion.div>
  );
}
