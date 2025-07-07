
import {AppSidebar} from "@/app/dashboard/components/app-sidebar";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {SiteHeader} from "@/app/dashboard/components/site-header";
export default function LayoutDashboard({children,}: Readonly<{ children: React.ReactNode;
}>) {
     return(
         <SidebarProvider>
             <AppSidebar variant="inset" />
             <SidebarInset>
                 <SiteHeader />
                 {children}
             </SidebarInset>
         </SidebarProvider>
     )
 }