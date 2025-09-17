'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"

export default function Unauthorized() {
    const router = useRouter()
    const [countdown, setCountdown] = useState(5) //detik

    useEffect(() => {
        if (countdown <= 0) {
            router.push('/')
            return
        }

        const timer = setTimeout(() => {
            setCountdown((prev) => prev - 1)
        }, 1000)

        return () => clearTimeout(timer)
    }, [countdown, router])

    return (
        <div className='h-svh'>
            <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
                <h1 className='text-[7rem] leading-tight font-bold'>401</h1>
                <span className='font-medium'>Unauthorized Access</span>
                <p className='text-muted-foreground text-center'>
                    Please log in with the appropriate credentials <br /> to access this resource.
                </p>
                <div className='mt-6 flex gap-4'>
                    <Button variant='outline' onClick={() => router.back()}>
                        Go Back
                    </Button>
                    <Button onClick={() => router.push('/')}>
                        Back to Home
                    </Button>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                    Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
                </p>
            </div>
        </div>
    )
}
