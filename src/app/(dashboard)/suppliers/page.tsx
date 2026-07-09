"use client";

import { useState, useEffect } from "react";
import { 
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Input, Modal, Drawer
} from "@heroui/react";
import { Plus, Edit, Trash2, Eye, MessageCircle, Mail } from "lucide-react";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, Supplier } from "@/lib/services/supplierService";
import Link from "next/link";

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

  return (
    <div className="p-8 flex flex-col gap-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Suppliers</h1>
        <Button variant="primary" onPress={openAddModal}>
          <div className="flex items-center gap-2">
            <Plus size={18} />
            Add Supplier
          </div>
        </Button>
      </header>
      
      <Table aria-label="Suppliers Table" className="bg-background">
        <TableHeader>
          <TableColumn>NAMA SUPPLIER</TableColumn>
          <TableColumn>KONTAK UTAMA</TableColumn>
          <TableColumn>QUICK ACTIONS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody items={suppliers}>
          {(item) => (
            <TableRow key={item.id}>
              <TableCell className="font-semibold">{item.namaSupplier}</TableCell>
              <TableCell>{item.noTelp || item.noWa || item.email || "-"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {item.noWa && (
                    <Link href={`https://wa.me/${item.noWa.replace(/\D/g, '')}`} target="_blank" className="text-success hover:opacity-70 transition-opacity">
                      <MessageCircle size={18} />
                    </Link>
                  )}
                  {item.email && (
                    <Link href={`mailto:${item.email}`} className="text-primary hover:opacity-70 transition-opacity">
                      <Mail size={18} />
                    </Link>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button isIconOnly size="sm" variant="ghost" onPress={() => openDetailsDrawer(item)}>
                    <Eye size={16} />
                  </Button>
                  <Button isIconOnly size="sm" variant="ghost" onPress={() => openEditModal(item)}>
                    <Edit size={16} />
                  </Button>
                  <Button isIconOnly size="sm" variant="danger-soft" onPress={() => handleDelete(item.id!)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
        <Modal.Dialog>
          <Modal.Header className="flex flex-col gap-1">{editingId ? 'Edit Supplier' : 'Add Supplier'}</Modal.Header>
          <Modal.Body>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Nama Supplier *</label>
              <Input 
                placeholder="Nama Supplier"
                value={namaSupplier} 
                onChange={(e) => setNamaSupplier(e.target.value)} 
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">No. Telepon</label>
              <Input 
                placeholder="No. Telepon"
                value={noTelp} 
                onChange={(e) => setNoTelp(e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">No. WhatsApp</label>
              <Input 
                value={noWa} 
                onChange={(e) => setNoWa(e.target.value)} 
                placeholder="+628... (No. WhatsApp)"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Email</label>
              <Input 
                placeholder="Email"
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Alamat</label>
              <Input 
                placeholder="Alamat"
                value={alamat} 
                onChange={(e) => setAlamat(e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Fax</label>
              <Input 
                placeholder="Fax"
                value={fax} 
                onChange={(e) => setFax(e.target.value)} 
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger-soft" onPress={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onPress={() => handleSave()}>
              Save
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal>

      <Drawer isOpen={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Content>
          <Drawer.Header className="flex flex-col gap-1">Detail Supplier</Drawer.Header>
          <Drawer.Body>
            {selectedSupplier && (
              <div className="flex flex-col gap-4 mt-4">
                <div>
                  <h4 className="text-default-500 text-sm font-medium">Nama Supplier</h4>
                  <p className="text-lg font-semibold">{selectedSupplier.namaSupplier}</p>
                </div>
                <div>
                  <h4 className="text-default-500 text-sm font-medium">Alamat</h4>
                  <p>{selectedSupplier.alamat || "-"}</p>
                </div>
                <div>
                  <h4 className="text-default-500 text-sm font-medium">No. Telepon</h4>
                  <p>{selectedSupplier.noTelp || "-"}</p>
                </div>
                <div>
                  <h4 className="text-default-500 text-sm font-medium">No. WhatsApp</h4>
                  <p>{selectedSupplier.noWa || "-"}</p>
                </div>
                <div>
                  <h4 className="text-default-500 text-sm font-medium">Email</h4>
                  <p>{selectedSupplier.email || "-"}</p>
                </div>
                <div>
                  <h4 className="text-default-500 text-sm font-medium">Fax</h4>
                  <p>{selectedSupplier.fax || "-"}</p>
                </div>
                <div className="mt-6">
                  <h4 className="text-default-500 text-sm font-medium border-b pb-2 mb-2">Riwayat Transaksi</h4>
                  <p className="text-default-400 text-sm italic">Fitur riwayat transaksi akan tersedia di fase selanjutnya.</p>
                </div>
              </div>
            )}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer>
    </div>
  );
}
