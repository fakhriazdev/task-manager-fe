"use client"

import {type Icon} from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link";
import {usePathname} from "next/navigation";

type NavItem = {
  title: string
  url: string
  icon?: Icon
  items?: NavItem[]
}

function checkIsActive(href: string, item: NavItem, mainNav = false) {
  return (
      href === item.url || // /endpint?search=param
      href.split('?')[0] === item.url || // endpoint
      !!item?.items?.filter((i) => i.url === href).length || // if child nav is active
      (mainNav &&
          href.split('/')[1] !== '' &&
          href.split('/')[1] === item?.url?.split('/')[1])
  )
}



export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
  {/*        <SidebarMenuItem className="flex items-center gap-2">*/}
  {/*          <SidebarMenuButton*/}
  {/*              tooltip="Quick Create"*/}
  {/*              className="*/}
  {/*  min-w-8*/}
  {/*  bg-blue-900*/}
  {/*  text-primary-foreground*/}
  {/*  dark:bg-blue-900*/}
  {/*  dark:text-primary*/}
  {/*  hover:bg-blue-950*/}
  {/*  hover:text-primary-foreground*/}
  {/*  dark:hover:bg-blue-950*/}
  {/*  dark:hover:text-text-primary-foreground*/}
  {/*  duration-200*/}
  {/*  ease-linear*/}
  {/*"*/}
  {/*          >*/}
  {/*            <IconCirclePlusFilled />*/}
  {/*            <span>Quick Create</span>*/}
  {/*          </SidebarMenuButton>*/}
  {/*          /!*<Button*!/*/}
  {/*          /!*    size="icon"*!/*/}
  {/*          /!*    className="size-8 group-data-[collapsible=icon]:opacity-0"*!/*/}
  {/*          /!*    variant="outline"*!/*/}
  {/*          /!*>*!/*/}
  {/*          /!*  <IconMail />*!/*/}
  {/*          /!*  <span className="sr-only">Inbox</span>*!/*/}
  {/*          /!*</Button>*!/*/}
  {/*        </SidebarMenuItem>*/}
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
              <Link href={item.url} className="w-full" key={item.url}>
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} isActive={checkIsActive(pathname, item)}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
              </Link>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
