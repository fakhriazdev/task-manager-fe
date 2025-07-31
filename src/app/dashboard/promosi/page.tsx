import PromosiTabel from "@/app/dashboard/promosi/components/PromosiTable";
import PromosiButtonPrimary from "@/app/dashboard/promosi/components/PromosiButtonPrimary";
import PromosiDialogs from "@/app/dashboard/promosi/components/PromosiDialogs";


export default function PromosiPage() {

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
               <PromosiButtonPrimary/>
                <PromosiTabel/>
                <PromosiDialogs/>
            </div>
        </div>
    )
}
