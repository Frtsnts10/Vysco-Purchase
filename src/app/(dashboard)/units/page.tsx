"use client";

import { useState, useEffect } from "react";
import { 
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Input, Modal
} from "@heroui/react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { getUnits, createUnit, updateUnit, deleteUnit, Unit } from "@/lib/services/unitService";

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

  return (
    <div className="p-8 flex flex-col gap-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Units</h1>
        <Button color="primary" onPress={openAddModal} startContent={<Plus size={18} />}>
          Add Unit
        </Button>
      </header>
      
      <Table aria-label="Units Table" className="bg-background">
        <TableHeader>
          <TableColumn>KODE UNIT</TableColumn>
          <TableColumn>JENIS UNIT</TableColumn>
          <TableColumn>SERIAL NUMBER</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent={isLoading ? "Loading..." : "No units found."} items={units}>
          {(item) => (
            <TableRow key={item.id}>
              <TableCell>{item.kodeUnit}</TableCell>
              <TableCell>{item.jenisUnit}</TableCell>
              <TableCell>{item.sn}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button isIconOnly size="sm" variant="light" onPress={() => openEditModal(item)}>
                    <Edit size={16} />
                  </Button>
                  <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDelete(item.id!)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Content>
          {() => (
            <>
              <Modal.Header className="flex flex-col gap-1">{editingId ? 'Edit Unit' : 'Add Unit'}</Modal.Header>
              <Modal.Body>
                <Input 
                  label="Kode Unit" 
                  value={kodeUnit} 
                  onChange={(e) => setKodeUnit(e.target.value)} 
                  placeholder="e.g. BD 46"
                />
                <Input 
                  label="Jenis Unit" 
                  value={jenisUnit} 
                  onChange={(e) => setJenisUnit(e.target.value)} 
                  placeholder="e.g. D85ESS-2"
                />
                <Input 
                  label="Serial Number (SN)" 
                  value={sn} 
                  onChange={(e) => setSn(e.target.value)} 
                />
              </Modal.Body>
              <Modal.Footer>
                <Button color="danger" variant="light" onPress={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button color="primary" onPress={() => handleSave()}>
                  Save
                </Button>
              </Modal.Footer>
            </>
          )}
        </Modal.Content>
      </Modal>
    </div>
  );
}
