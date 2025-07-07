import { Button } from "@/components/ui/button"
import { useRolesStore } from "@/lib/stores/useRolesStore"
import {useStoreStore} from "@/lib/stores/useStoreStore";
import {useUserStore} from "@/lib/stores/useUserStore";
import {useRegionStore} from "@/lib/stores/useRegionStore";


interface Props {
    type: string
}

export default function ButtonAdds({ type }: Props) {
    const { setOpen: openUser } = useUserStore()
    const { setOpen: openRole } = useRolesStore()
    const { setOpen: openStore } = useStoreStore()
    const { setOpen: openRegion } = useRegionStore()

    const handleClick = () => {
        switch (type.toLowerCase()) {
            case "user":
                openUser("create")
                break
            case "roles":
                openRole("create")
                break
            case "store":
                openStore("create")
                break
            case "region":
                openRegion("create")
                break
            default:
                return
        }
    }

    return (
        <Button size="sm" onClick={handleClick}>
            {`Add New ${type}`}
        </Button>
    )
}
