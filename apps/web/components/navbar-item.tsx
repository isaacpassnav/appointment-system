"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  href?: string;
  label: string;
  desc?: string;
  icon?: LucideIcon;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

interface NavDropdown {
  label: string;
  icon?: LucideIcon;
  items?: NavItem[];
  sections?: NavSection[];
  solutionsLayout?: boolean;
}

export type NavbarItemType = NavItem | NavDropdown;

interface NavbarItemProps {
  item: NavbarItemType;
  className?: string;
}

const smoothScroll = (target: string) => {
  const element = document.querySelector(target);
  if (element) element.scrollIntoView({ behavior: "smooth" });
};

export function NavbarItem({ item, className }: NavbarItemProps) {
  const isSimpleLink = !("items" in item) && !("sections" in item);
  const simpleItem = item as NavItem;
  const dropdownItem = item as NavDropdown;

  if (isSimpleLink) {
    return (
      <Link
        href={simpleItem.href ?? "#"}
        className={cn(
          "nav-link flex items-center gap-2 h-10 px-3 rounded-lg hover:bg-accent/50 transition-all",
          className,
        )}
        onClick={(e) => {
          if (simpleItem.href?.startsWith("#")) {
            e.preventDefault();
            smoothScroll(simpleItem.href);
          }
        }}
      >
        {simpleItem.icon && (
          <simpleItem.icon className="h-4 w-4 flex-shrink-0" />
        )}
        {simpleItem.label}
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "nav-link flex items-center gap-2 h-10 px-3 rounded-lg hover:bg-accent/50 transition-all group",
          className,
        )}
      >
        {dropdownItem.icon && (
          <dropdownItem.icon className="h-4 w-4 flex-shrink-0" />
        )}
        {dropdownItem.label}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          "w-72 p-2",
          dropdownItem.solutionsLayout && "w-[550px] p-4",
        )}
      >
        {/* Items list */}
        {dropdownItem.items &&
          dropdownItem.items.map((subItem, idx) => (
            <DropdownMenuItem key={idx} asChild>
              <Link
                href={subItem.href || "#"}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-default w-full no-underline"
                onClick={(e) => {
                  if (subItem.href?.startsWith("#")) {
                    e.preventDefault();
                    smoothScroll(subItem.href);
                  }
                }}
              >
                {subItem.icon && (
                  <subItem.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <div>
                  <div className="font-medium">{subItem.label}</div>
                  {subItem.desc && (
                    <div className="text-xs text-muted-foreground">
                      {subItem.desc}
                    </div>
                  )}
                </div>
              </Link>
            </DropdownMenuItem>
          ))}

        {/* Standard sections 1 column */}
        {!dropdownItem.solutionsLayout &&
          dropdownItem.sections &&
          dropdownItem.sections.map((section, sIdx) => (
            <React.Fragment key={sIdx}>
              <DropdownMenuLabel className="font-semibold text-xs uppercase tracking-wider text-muted-foreground px-2 py-1.5">
                {section.label}
              </DropdownMenuLabel>
              {section.items.map((subItem, idx) => (
                <DropdownMenuItem key={idx} className="p-0 cursor-default">
                  <div className="flex items-center gap-3 p-2 hover:bg-accent rounded-md w-full">
                    {subItem.icon && (
                      <subItem.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className="font-medium">{subItem.label}</span>
                  </div>
                </DropdownMenuItem>
              ))}
              {sIdx < dropdownItem.sections!.length - 1 && (
                <DropdownMenuSeparator />
              )}
            </React.Fragment>
          ))}

        {/* Solutions 3 columns layout */}
        {dropdownItem.solutionsLayout && dropdownItem.sections && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2 p-2">
            {dropdownItem.sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-3">
                <div className="font-semibold text-xs uppercase tracking-wider text-muted-foreground px-1 py-1.5">
                  {section.label}
                </div>
                {section.items.map((subItem, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 hover:bg-accent/50 rounded-md cursor-default w-full"
                  >
                    {subItem.icon && (
                      <subItem.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-medium text-sm">{subItem.label}</div>
                      {subItem.desc && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {subItem.desc}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
