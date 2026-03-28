"use client"

import * as React from "react"
import Link from "next/link"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import {
  Search,
  History,
  Heart,
  PlusCircle,
  Truck,
  Hammer,
  Laptop,
  PartyPopper,
  Home,
  MessageSquare,
  Settings,
  HelpCircle,
  Store,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

// Sample navigation data for a Rental App.
const data = {
  navMain: [
    {
      title: "Discover",
      url: "/discover",
      icon: Search,
      isActive: true,
    },
    {
      title: "My Rentals",
      url: "/my-rentals",
      icon: History,
      items: [
        {
          title: "Currently Renting",
          url: "/my-rentals?status=active",
        },
        {
          title: "Rental History",
          url: "/my-rentals?status=completed",
        },
      ],
    },
    {
      title: "Categories",
      url: "/discover",
      icon: Store,
      items: [
        {
          title: "Tools & Equipment",
          url: "/discover?category=tools",
          icon: Hammer,
        },
        {
          title: "Electronics",
          url: "/discover?category=electronics",
          icon: Laptop,
        },
        {
          title: "Party & Events",
          url: "/discover?category=events",
          icon: PartyPopper,
        },
        {
          title: "Home & Garden",
          url: "/discover?category=home",
          icon: Home,
        },
      ],
    },
    {
      title: "Wishlist",
      url: "/wishlist",
      icon: Heart,
    },
  ],
  navSecondary: [
    {
      title: "Rent Out Item",
      url: "/rent-out",
      icon: PlusCircle,
    },
    {
      title: "Messages",
      url: "/messages",
      icon: MessageSquare,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="h-16 border-b flex items-center px-6">
        <div className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Truck className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold text-lg tracking-tight">RentAnything</span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Marketplace</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link href={subItem.url} className="flex items-center gap-2">
                             {/* @ts-ignore */}
                             {subItem.icon && <subItem.icon className="size-3" />}
                             <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          {data.navSecondary.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title} size="sm">
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Logout" size="sm" onClick={() => signOut(auth)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
