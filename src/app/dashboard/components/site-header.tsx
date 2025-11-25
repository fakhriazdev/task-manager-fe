'use client'

import { SidebarTrigger } from "@/components/ui/sidebar"
import DarkmodeSwitch from "@/components/ui/darkmode-switch"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useProjectAction } from "@/lib/project/projectAction"

export function SiteHeader() {
  const pathname = usePathname() || "/"
  const pathSegments = useMemo(
      () => pathname.split("/").filter(Boolean),
      [pathname]
  )

  const { data: projects = [] } = useProjectAction()
  const [projectName, setProjectName] = useState<string | null>(null)

  // Format label untuk tiap segment
  const formatLabel = (segment: string) =>
      decodeURIComponent(segment)
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())

  // Detect halaman project detail (anggap: /dashboard/projects/:id/...)
  useEffect(() => {
    const isProjectDetail =
        pathSegments[0] === "dashboard" &&
        pathSegments[1] === "projects" &&
        pathSegments[2]

    if (isProjectDetail) {
      const projectId = pathSegments[2]
      const found = projects.find((p) => p.id === projectId)
      setProjectName(found?.name ?? null)
    } else {
      setProjectName(null)
    }
  }, [projects, pathSegments])

  // 🔹 Hanya render breadcrumb setelah "/dashboard"
  const baseIsDashboard = pathSegments[0] === "dashboard"
  const baseHref = baseIsDashboard ? "/dashboard" : "/"
  const segmentsToRender = useMemo(
      () => (baseIsDashboard ? pathSegments.slice(1) : pathSegments),
      [baseIsDashboard, pathSegments]
  )

  return (
      <header className="sticky bg-sidebar z-30 top-0 flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center content-center text-center gap-2 px-4 py-2 lg:px-6">
          {/* Sidebar Trigger */}
          <SidebarTrigger className="-ml-1" />

          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              {/* Home / Dashboard */}
              <BreadcrumbItem key="dashboard">
                <BreadcrumbLink asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
                {segmentsToRender.length > 0 && <BreadcrumbSeparator />}
              </BreadcrumbItem>

              {/* Dynamic segments (tanpa 'dashboard') */}
              {segmentsToRender.map((segment, index) => {
                const isLast = index === segmentsToRender.length - 1
                const href = `${baseHref}/${segmentsToRender
                    .slice(0, index + 1)
                    .join("/")}`

                const label =
                    // jika /dashboard/projects/:id => ganti segmen id dengan nama project
                    baseIsDashboard && pathSegments[1] === "projects" && index === 1 && projectName
                        ? projectName
                        : formatLabel(segment)

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
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Right Section */}
          <div className="ml-auto flex items-center gap-2">
            <DarkmodeSwitch />
          </div>
        </div>
      </header>
  )
}
