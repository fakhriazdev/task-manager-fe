"use client"

import {
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuthActions } from "@/lib/auth/useAuthAction";
import {UserInfo} from "@/lib/auth/authTypes";
import {Skeleton} from "@/components/ui/skeleton";
import React from "react";
export default function NavUser({
  user,
}: {
  user: UserInfo | null
}) {
  const { isMobile } = useSidebar()
  const [open, setOpen] = React.useState(false);
  const { logout, } = useAuthActions();
  const handleLogout = async () => {
    await logout.mutateAsync();
    setOpen(false);
  };
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {user?.nama
                  ? (
                      <Avatar className="h-8 w-8 rounded-lg grayscale">
                        <AvatarImage src="#" />
                        <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                      </Avatar>
                  )
                  : (
                      <Skeleton className="h-8 w-8 rounded-lg" />
                  )
              }

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.nama ?? <Skeleton className="h-4 w-full mb-1" />}</span>
                <span className="text-muted-foreground truncate text-xs">
             {user?.nik ??<Skeleton className="h-3 w-1/2" />}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "top"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {/*<AvatarImage src="#" alt={user.name} />*/}
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">  {user?.nama ?? 'loading'}</span>
                  <span className="text-muted-foreground truncate text-xs">
                   {user?.nik ?? 'loading'}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                asChild
                disabled={logout.status === 'pending'}
                className={logout.status === 'pending' ? 'opacity-50 pointer-events-none' : ''}
            >
              <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left"
              >
                <IconLogout />
                Log out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
