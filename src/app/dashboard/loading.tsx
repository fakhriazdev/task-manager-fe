import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

export default function Loading(){
    return(
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Card key={i} className="@container/card">
                                <CardHeader className="pb-2 space-y-2">
                                    <CardTitle>
                                        <Skeleton className="h-4 w-1/2" />
                                    </CardTitle>
                                    <Skeleton className="h-4 w-8" />
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}