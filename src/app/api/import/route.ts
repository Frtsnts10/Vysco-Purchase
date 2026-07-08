import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    const { data } = await request.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: 'Invalid data format or empty array' }, { status: 400 });
    }

    // 1. Fetch existing Units and Suppliers
    const unitsSnapshot = await adminDb.collection('units').get();
    const unitsMap = new Map<string, string>(); // kodeUnit -> id
    unitsSnapshot.forEach(doc => {
      unitsMap.set(doc.data().kodeUnit.toLowerCase(), doc.id);
    });

    const suppliersSnapshot = await adminDb.collection('suppliers').get();
    const suppliersMap = new Map<string, string>(); // namaSupplier -> id
    suppliersSnapshot.forEach(doc => {
      suppliersMap.set(doc.data().namaSupplier.toLowerCase(), doc.id);
    });

    // 2. Prepare Batches (Firestore limit is 500 writes per batch)
    let batch = adminDb.batch();
    let operationCount = 0;
    const batches = [];

    // Helper to commit and reset batch when limit is reached
    const commitBatchIfFull = async () => {
      if (operationCount >= 490) { // Safety margin
        batches.push(batch.commit());
        batch = adminDb.batch();
        operationCount = 0;
      }
    };

    // 3. Process each row
    for (const row of data) {
      if (row.isDuplicate) continue; // Skip duplicates marked in UI
      
      const { kodeUnit, supplierNama, ...transactionData } = row;

      // Handle Unit
      let unitId = "";
      if (kodeUnit) {
        const key = String(kodeUnit).toLowerCase();
        if (unitsMap.has(key)) {
          unitId = unitsMap.get(key)!;
        } else {
          // Create missing unit
          const newUnitRef = adminDb.collection('units').doc();
          unitId = newUnitRef.id;
          batch.set(newUnitRef, {
            kodeUnit: String(kodeUnit),
            jenisUnit: "Unknown (Auto-created)",
            sn: "-",
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
          unitsMap.set(key, unitId);
          operationCount++;
          await commitBatchIfFull();
        }
      }

      // Handle Supplier
      let supplierId = "";
      if (supplierNama) {
        const key = String(supplierNama).toLowerCase();
        if (suppliersMap.has(key)) {
          supplierId = suppliersMap.get(key)!;
        } else {
          // Create missing supplier
          const newSupplierRef = adminDb.collection('suppliers').doc();
          supplierId = newSupplierRef.id;
          batch.set(newSupplierRef, {
            namaSupplier: String(supplierNama),
            alamat: "",
            noTelp: "",
            noWa: "",
            email: "",
            fax: "",
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
          suppliersMap.set(key, supplierId);
          operationCount++;
          await commitBatchIfFull();
        }
      }

      // Add Transaction
      const transactionRef = adminDb.collection('transactions').doc();
      batch.set(transactionRef, {
        unitId,
        kodeUnit: String(kodeUnit || ""),
        supplierId,
        supplierNama: String(supplierNama || ""),
        noPo: String(transactionData.noPo || ""),
        namaBarang: String(transactionData.namaBarang || ""),
        qty: Number(transactionData.qty || 0),
        satuan: String(transactionData.satuan || ""),
        hargaSatuan: Number(transactionData.hargaSatuan || 0),
        dpp: Number(transactionData.dpp || 0),
        ppn: Number(transactionData.ppn || 0),
        tanggalOrder: transactionData.tanggalOrder ? new Date(transactionData.tanggalOrder) : FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      });
      operationCount++;
      await commitBatchIfFull();
    }

    // Commit any remaining operations
    if (operationCount > 0) {
      batches.push(batch.commit());
    }

    // Wait for all batches to finish
    await Promise.all(batches);

    return NextResponse.json({ success: true, message: 'Import completed successfully' });
  } catch (error: any) {
    console.error("Import API Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
