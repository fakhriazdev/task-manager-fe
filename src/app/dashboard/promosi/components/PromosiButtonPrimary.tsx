'use client'
import {Button} from "@/components/ui/button";
import {IconDownload} from "@tabler/icons-react";
import {usePromosiStore} from "@/lib/stores/usePromosiStore";

export default function PromosiButtonPrimary(){
    const {setOpen} = usePromosiStore()
    return (
        <div className="flex justify-end gap-4 py-4 md:gap-6 md:py-6 px-6">
        <Button
            className='space-x-1'
            onClick={() => setOpen('import')}
        >
            <span>Import</span> <IconDownload size={18} />
        </Button>
        <Button size={"sm"} variant={"outline"} >
            Download Template Import
        </Button>
    </div>
    )
}