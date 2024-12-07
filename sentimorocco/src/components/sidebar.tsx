"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart,
  Database,
  Home,
  MessageCircle,
  TrendingUp,
} from "lucide-react";

const sidebarItems = [
  { name: "Overview", href: "/", icon: Home },
  { name: "Analytics Feed", href: "/analytics", icon: MessageCircle },
  { name: "Trends", href: "/trends", icon: TrendingUp },
  { name: "Model Insights", href: "/insights", icon: BarChart },
  { name: "Data Integration", href: "/integration", icon: Database },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center justify-between px-4 py-2">
        {!isCollapsed && <h2 className="text-lg font-semibold">Menu</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <BarChart className="h-5 w-5 rotate-180" />
          ) : (
            <BarChart className="h-5 w-5" />
          )}
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-2 p-2">
          {sidebarItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isCollapsed && "justify-center"
                )}
              >
                <item.icon className="h-5 w-5" />
                {!isCollapsed && <span className="ml-2">{item.name}</span>}
              </Button>
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
