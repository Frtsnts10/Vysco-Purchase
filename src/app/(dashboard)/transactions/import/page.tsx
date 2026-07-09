"use client";

import { useState, useRef } from "react";
import { read, utils } from "xlsx";
import { 
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Card
} from "@heroui/react";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ImportPage() {
  const [data, setData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<"idle" | "review" | "uploading" | "success" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatus("idle");

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = read(bstr, { type: 'binary' });
        // Assuming the first sheet contains the data
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Convert to JSON
        const rawData = utils.sheet_to_json(ws);
        
        // Basic mapping based on expected Excel columns (adjust these as needed)
        const mappedData = rawData.map((row: any, index: number) => ({
          id: `row-${index}`,
          kodeUnit: row['Kode Unit'] || row['Unit'] || '',
          noPo: row['No PO'] || row['PO Number'] || '',
          namaBarang: row['Nama Barang'] || row['Item Name'] || '',
          qty: Number(row['Qty'] || row['Quantity'] || 0),
          satuan: row['Satuan'] || row['Unit Measure'] || '',
          hargaSatuan: Number(row['Harga Satuan'] || row['Unit Price'] || 0),
          dpp: Number(row['DPP'] || 0),
          ppn: Number(row['PPN'] || 0),
          supplierNama: row['Supplier'] || row['Nama Supplier'] || '',
          tanggalOrder: row['Tanggal Order'] || row['Order Date'] || '',
        }));

        // Find duplicates within the file (example: same PO and same item)
        const seen = new Set();
        mappedData.forEach((item: any) => {
          const key = `${item.noPo}-${item.namaBarang}`;
          if (seen.has(key)) {
            item.isDuplicate = true;
          } else {
            seen.add(key);
            item.isDuplicate = false;
          }
        });

        setData(mappedData);
        setStatus("review");
      } catch (error) {
        console.error("Error parsing Excel:", error);
        setStatus("error");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleProcessImport = async () => {
    if (data.length === 0) return;
    setStatus("uploading");
    
    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      
      if (!response.ok) throw new Error("Failed to process import");
      
      setStatus("success");
    } catch (error) {
      console.error("Import failed:", error);
      setStatus("error");
    }
  };

  return (
    <div className="p-8 flex flex-col gap-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Import PO Excel</h1>
        {(status === "review" || status === "uploading") && (
          <Button 
            variant="primary" 
            onPress={handleProcessImport} 
            isDisabled={status === "uploading"}
          >
            {status === "uploading" ? "Processing..." : `Process Import (${data.length} rows)`}
          </Button>
        )}
      </header>

      {status === "success" && (
        <Card className="p-4 bg-success-50 border-success-200">
          <div className="flex items-center gap-2 text-success-700">
            <CheckCircle2 />
            <span className="font-medium">Import successful! Data is being processed in the background.</span>
          </div>
        </Card>
      )}

      {status === "error" && (
        <Card className="p-4 bg-danger-50 border-danger-200">
          <div className="flex items-center gap-2 text-danger-700">
            <AlertCircle />
            <span className="font-medium">An error occurred during import. Please check the file format or try again later.</span>
          </div>
        </Card>
      )}

      {(status === "idle" || status === "error" || status === "success") && (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-default-300 rounded-xl bg-default-50">
          <Upload size={48} className="text-default-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Upload Excel File</h3>
          <p className="text-default-500 mb-6 text-center max-w-md">
            Upload your Purchase Order Excel file. The system will parse the rows and display a preview before saving.
          </p>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button variant="primary" onPress={() => fileInputRef.current?.click()} isDisabled={isProcessing}>
            {isProcessing ? "Loading..." : "Select File"}
          </Button>
        </div>
      )}

      {status === "review" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center bg-default-100 p-4 rounded-lg">
            <p className="font-medium">Previewing {data.length} rows</p>
            <Button size="sm" variant="ghost" onPress={() => {setData([]); setStatus("idle");}}>
              Cancel & Upload Different File
            </Button>
          </div>
          
          <Table aria-label="Preview Table" className="bg-background max-h-[600px]">
            <TableHeader>
              <TableColumn>KODE UNIT</TableColumn>
              <TableColumn>NO PO</TableColumn>
              <TableColumn>SUPPLIER</TableColumn>
              <TableColumn>NAMA BARANG</TableColumn>
              <TableColumn>QTY</TableColumn>
              <TableColumn>HARGA (DPP)</TableColumn>
            </TableHeader>
            <TableBody items={data}>
              {(item) => (
                <TableRow key={item.id} className={item.isDuplicate ? "bg-danger-50" : ""}>
                  <TableCell>{item.kodeUnit}</TableCell>
                  <TableCell>{item.noPo}</TableCell>
                  <TableCell>{item.supplierNama}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.namaBarang}
                      {item.isDuplicate && <AlertCircle size={14} className="text-danger" aria-label="Possible duplicate in this file" />}
                    </div>
                  </TableCell>
                  <TableCell>{item.qty} {item.satuan}</TableCell>
                  <TableCell>Rp {item.dpp?.toLocaleString()}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
