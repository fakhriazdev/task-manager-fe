'use client'
import { SidebarTrigger } from "@/components/ui/sidebar"
import DarkmodeSwitch from "@/components/ui/darkmode-switch";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function SiteHeader() {
  const pathname = usePathname();
  const pathSegments = pathname
      .split("/")
      .filter((segment) => segment.length > 0);
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 py-1 lg:gap-2 lg:px-6 py-2">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              {pathSegments.length > 0}
            </BreadcrumbItem>
            {pathSegments.map((segment, index) => {
              const href = "/" + pathSegments.slice(0, index + 1).join("/");
              const isLast = index === pathSegments.length - 1;
              const label = decodeURIComponent(segment)
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase());
              return (
                  <BreadcrumbItem key={href}>
                    {isLast ? (
                        <BreadcrumbPage>{label}</BreadcrumbPage>
                    ) : (
                        <>
                          <BreadcrumbLink asChild>
                            <Link href={href}>{label}</Link>
                          </BreadcrumbLink>
                          <BreadcrumbSeparator />
                        </>
                    )}
                  </BreadcrumbItem>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex justify-between items-center gap-2">
          <DarkmodeSwitch/>
        </div>
      </div>
    </header>
  )
}
