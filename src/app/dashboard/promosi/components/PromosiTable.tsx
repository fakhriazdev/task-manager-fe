'use client';
import { DataTable } from '@/components/shared/dataTable';
import {promosiColumns} from "@/app/dashboard/promosi/components/PromosiColumns";

const data = [
    {
        id: "9031b36c",
        idStore: "STR002",
        potongan:"10000",
        brand: "SariWangi",
        keterangan: "Promo Spesial Lebaran",
        kelipatan: "50.000",
        startDate: "2025-07-01",
        endDate: "2025-07-31",
        status: true
    },
    {
        id: "9b4294f3",
        idStore: "STR006",
        potongan:"10000",
        brand: "Rinso",
        keterangan: "Promo Spesial Lebaran",
        kelipatan: "10.000",
        startDate: "2025-07-01",
        endDate: "2025-07-31",
        status: true
    },
    {
        id: "7c37f66f",
        idStore: "STR005",
        potongan:"10000",
        brand: "Rinso",
        keterangan: "Promo Spesial Lebaran",
        kelipatan: "50.000",
        startDate: "2025-07-01",
        endDate: "2025-07-31",
        status: true
    },
    {
        id: "19e859e3",
        idStore: "STR006",
        potongan:"10000",
        brand: "Pepsodent",
        keterangan: "Promo Spesial Lebaran",
        kelipatan: "50.000",
        startDate: "2025-07-01",
        endDate: "2025-07-31",
        status: true
    },
    {
        id: "2039ad8f",
        idStore: "STR006",
        potongan:"10000",
        brand: "Bango",
        keterangan: "Beli 1 Gratis 1",
        kelipatan: "5.000",
        startDate: "2025-08-01",
        endDate: "2025-08-15",
        status: true
    },
    {
        id: "108fa466",
        idStore: "STR003",
        potongan:"10000",
        brand: "Clear",
        keterangan: "Harga Spesial Member",
        kelipatan: "100.000",
        startDate: "2025-07-10",
        endDate: "2025-08-10",
        status: true
    },
    {
        id: "8b27d07f",
        idStore: "STR016",
        potongan:"10000",
        brand: "SariWangi",
        keterangan: "Promo Spesial Lebaran",
        kelipatan: "10.000",
        startDate: "2025-07-01",
        endDate: "2025-07-31",
        status: true
    },
    {
        id: "8cfa3f1e",
        idStore: "STR012",
        potongan:"10000",
        brand: "Rinso",
        keterangan: "Harga Spesial Member",
        kelipatan: "5.000",
        startDate: "2025-06-15",
        endDate: "2025-07-15",
        status: false
    },
    {
        id: "17f351bb",
        idStore: "STR001",
        potongan:"10000",
        brand: "Lifebuoy",
        keterangan: "Promo Spesial Lebaran",
        kelipatan: "10.000",
        startDate: "2025-07-01",
        endDate: "2025-07-31",
        status: true
    }
];


export default function PromosiTabel() {
    return (
        <>
            <DataTable columns={promosiColumns} data={data} />
            {/*<RegionDialogs />*/}
        </>
    );
}
