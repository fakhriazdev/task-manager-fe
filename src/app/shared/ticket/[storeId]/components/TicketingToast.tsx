import { toast } from "sonner";

/**
 * Custom toast untuk sistem ticketing
 * Selalu muncul di tengah layar dengan gaya besar dan animasi lembut
 */
export const ticketToast = {
    success: (message: string) =>
        toast.success(message, {
            id: "ticketing",
            duration: 20000,
            className:
                "!fixed !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 !z-[9999] animate-ticket-toast",
            style: {
                fontSize: "1.5rem",
                padding: "28px 40px",
                borderRadius: "16px",
                backgroundColor: "#22c55e",
                color: "#fff",
                textAlign: "center",
                fontWeight: "bold",
                boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
                minWidth: "350px",
            },
        }),

    error: (message: string) =>
        toast.error(message, {
            id: "ticketing",
            duration: 20000,
            className:
                "!fixed !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 !z-[9999] animate-ticket-toast",
            style: {
                fontSize: "1.5rem",
                padding: "28px 40px",
                borderRadius: "16px",
                backgroundColor: "#c52222",
                color: "#fff",
                textAlign: "center",
                fontWeight: "bold",
                boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
                minWidth: "350px",
            },
        }),
};
