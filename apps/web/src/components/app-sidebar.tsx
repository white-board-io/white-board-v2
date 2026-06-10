import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { UserButton, useUser, useOrganization } from "@clerk/clerk-react";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  ClipboardList,
  CalendarCheck,
  Megaphone,
  Calendar,
  BookOpen,
  Layers,
  LayoutGrid,
  CalendarRange,
  Users,
  GraduationCap,
  UserCheck,
  BarChart2,
  CreditCard,
  Settings,
  PenLine,
  FolderOpen,
  Plug,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@repo/ui/tooltip";

function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

type NavItem = { label: string; icon: LucideIcon; href: string };
type NavSection = { title: string; items: NavItem[] };

const NAV: NavSection[] = [
  {
    title: "Discover",
    items: [
      { label: "Home", icon: Home, href: "/discover" },
      { label: "Assignments", icon: ClipboardList, href: "/discover/assignments" },
      { label: "Attendance", icon: CalendarCheck, href: "/discover/attendance" },
      { label: "Announcements", icon: Megaphone, href: "/discover/announcements" },
      { label: "Calendar", icon: Calendar, href: "/discover/calendar" },
    ],
  },
  {
    title: "Academics",
    items: [
      { label: "Academic Years", icon: CalendarRange, href: "/academics/academic-years" },
      { label: "Classes", icon: BookOpen, href: "/academics/classes" },
      { label: "Streams", icon: Layers, href: "/academics/streams" },
      { label: "Sections", icon: LayoutGrid, href: "/academics/sections" },
    ],
  },
  {
    title: "People",
    items: [
      { label: "Students", icon: Users, href: "/people/students" },
      { label: "Teachers", icon: GraduationCap, href: "/people/teachers" },
      { label: "Parents", icon: UserCheck, href: "/people/parents" },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Reports", icon: BarChart2, href: "/management/reports" },
      { label: "Billing", icon: CreditCard, href: "/management/billing" },
      { label: "Settings", icon: Settings, href: "/management/settings" },
    ],
  },
  {
    title: "Apps",
    items: [
      { label: "Whiteboard", icon: PenLine, href: "/apps/whiteboard" },
      { label: "Resources", icon: FolderOpen, href: "/apps/resources" },
      { label: "Integrations", icon: Plug, href: "/apps/integrations" },
    ],
  },
];

type Props = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export function AppSidebar({ mobileOpen, onMobileClose }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    Object.fromEntries(NAV.map((s) => [s.title, true])),
  );

  const { user } = useUser();
  const { organization } = useOrganization();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border",
          "transition-[width,transform] duration-200 ease-in-out",
          "w-64",
          mobileOpen ? "translate-x-0 shadow-xl" : "-translate-x-full",
          collapsed
            ? "lg:static lg:translate-x-0 lg:w-16 lg:shadow-none"
            : "lg:static lg:translate-x-0 lg:w-60 lg:shadow-none",
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center h-14 px-3 border-b border-border shrink-0",
            collapsed ? "lg:justify-center lg:px-0" : "justify-between",
          )}
        >
          {/* Logo + name (expanded) */}
          <Link
            to="/discover"
            className={cn("flex items-center gap-2 hover:opacity-80 transition-opacity", collapsed && "lg:hidden")}
          >
            <img src="/whiteboard-logo.svg" alt="" className="w-7 h-7 shrink-0" />
            <span className="font-bold text-sm text-foreground">WhiteBoard</span>
          </Link>

          {/* Logo icon only (collapsed desktop) */}
          <Link to="/discover" className={cn("hidden hover:opacity-80 transition-opacity", collapsed && "lg:flex")}>
            <img src="/whiteboard-logo.svg" alt="" className="w-7 h-7" />
          </Link>

          {/* Close button — mobile only */}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close menu"
          >
            <X className="size-4" />
          </button>

          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => {
              setCollapsed((c) => !c);
            }}
            className={cn(
              "hidden lg:flex p-1.5 rounded-md hover:bg-secondary",
              "text-muted-foreground hover:text-foreground transition-colors",
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>

        {/* User info */}
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-3 border-b border-border shrink-0",
            collapsed && "lg:justify-center lg:px-0",
          )}
        >
          <UserButton appearance={{ elements: { avatarBox: "size-8 shrink-0" } }} />
          <div className={cn("flex-1 min-w-0", collapsed && "lg:hidden")}>
            <p className="text-xs font-semibold text-foreground truncate leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            {organization && (
              <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5">{organization.name}</p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 space-y-0.5">
          {NAV.map((section, sectionIdx) => {
            const sectionExpanded = expandedSections[section.title] ?? true;
            const showItems = collapsed || sectionExpanded;

            return (
              <div key={section.title}>
                {sectionIdx > 0 && <div className={cn("my-2 border-t border-border", collapsed && "lg:mx-2")} />}

                {/* Section header — hidden in icon-only mode */}
                <button
                  onClick={() => {
                    if (!collapsed) {
                      toggleSection(section.title);
                    }
                  }}
                  className={cn(
                    "flex items-center w-full px-2 py-1 rounded-md mb-0.5",
                    "transition-colors",
                    collapsed ? "lg:hidden" : "hover:bg-secondary",
                  )}
                  disabled={collapsed}
                >
                  <span className="flex-1 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none">
                    {section.title}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 text-muted-foreground transition-transform duration-150",
                      !sectionExpanded && "-rotate-90",
                    )}
                  />
                </button>

                {/* Section items */}
                {showItems && (
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.href === "/discover"
                          ? pathname === "/discover"
                          : pathname === item.href || pathname.startsWith(item.href + "/");

                      const linkEl = (
                        <Link
                          to={item.href}
                          className={cn(
                            "flex items-center gap-3 w-full px-2 py-1.5 rounded-md text-sm",
                            "transition-colors duration-150",
                            "text-muted-foreground hover:bg-secondary hover:text-foreground",
                            isActive && "bg-accent text-accent-foreground font-medium hover:bg-accent",
                            collapsed && "lg:justify-center lg:px-0 lg:py-2",
                          )}
                        >
                          <Icon className="size-4 shrink-0" />
                          <span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
                        </Link>
                      );

                      if (collapsed) {
                        return (
                          <Tooltip key={item.href}>
                            <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                            <TooltipContent side="right">{item.label}</TooltipContent>
                          </Tooltip>
                        );
                      }

                      return <div key={item.href}>{linkEl}</div>;
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
