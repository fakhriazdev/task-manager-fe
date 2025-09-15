'use client'
import {Button} from "@/components/ui/button";

import {Upload} from "lucide-react";
import { useRouter } from "next/navigation";


export default function PromosiButtonPrimary(){
    const router = useRouter()
    return (
        <div className="flex justify-end gap-4 py-4 md:gap-6 md:py-6 px-6">
            <Button
                variant="default" // "default" adalah varian utama/primer
                onClick={() => router.push(`/dashboard/promosi/new-import`)}
            >
                <Upload className="mr-2 h-4 w-4" /> {/* Tambahkan ikon */}
                Import Promosi Baru {/* Tambahkan teks label */}
            </Button>
        <Button size={"sm"} variant={"outline"} >
            Download Template Import
        </Button>
    </div>
    )
}