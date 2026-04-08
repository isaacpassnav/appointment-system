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
  if (!element) return false;
  element.scrollIntoView({ behavior: "smooth" });
  return true;
};

const extractHashTarget = (href?: string) => {
  if (!href) return null;
  if (href.startsWith("#")) return href;
  if (href.startsWith("/#")) return href.slice(1);
  return null;
};

export function NavbarItem({ item, className }: NavbarItemProps) {
  const isSimpleLink = !("items" in item) && !("sections" in item);
  const simpleItem = item as NavItem;
  const dropdownItem = item as NavDropdown;
  const topLevelClass =
    "nav-link flex h-10 items-center gap-2 rounded-xl px-3 transition-colors hover:bg-violet-50 hover:text-slate-950 focus-visible:bg-violet-50 focus-visible:text-slate-950";
  const dropdownLinkClass =
    "flex w-full items-center gap-3 rounded-xl p-2.5 no-underline transition-colors hover:bg-violet-50 hover:text-slate-950 focus:bg-violet-50";

  if (isSimpleLink) {
    return (
      <Link
        href={simpleItem.href ?? "#"}
        className={cn(
          topLevelClass,
          className,
        )}
        onClick={(e) => {
          const hashTarget = extractHashTarget(simpleItem.href);
          if (hashTarget && smoothScroll(hashTarget)) {
            e.preventDefault();
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
          `${topLevelClass} group`,
          className,
        )}
      >
        {dropdownItem.icon && (
          <dropdownItem.icon className="h-4 w-4 flex-shrink-0" />
        )}
        {dropdownItem.label}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={dropdownItem.solutionsLayout ? "center" : "end"}
        className={cn(
          "w-72 border-slate-200 bg-white p-2 text-slate-900 shadow-[0_18px_48px_rgba(15,23,42,0.12)]",
          dropdownItem.solutionsLayout && "w-[min(760px,calc(100vw-40px))] p-4",
        )}
      >
        {/* Items list */}
        {dropdownItem.items &&
          dropdownItem.items.map((subItem, idx) => (
            <DropdownMenuItem key={idx} asChild>
              <Link
                href={subItem.href || "#"}
                className={cn(dropdownLinkClass, "cursor-default")}
                onClick={(e) => {
                  const hashTarget = extractHashTarget(subItem.href);
                  if (hashTarget && smoothScroll(hashTarget)) {
                    e.preventDefault();
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
                  <div className={dropdownLinkClass}>
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
          <div className="grid grid-cols-1 gap-6 p-2 pt-2 md:grid-cols-3">
            {dropdownItem.sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-3">
                <div className="font-semibold text-xs uppercase tracking-wider text-muted-foreground px-1 py-1.5">
                  {section.label}
                </div>
                {section.items.map((subItem, idx) => (
                  subItem.href ? (
                    <Link
                      key={idx}
                      href={subItem.href}
                      className={dropdownLinkClass}
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
                    </Link>
                  ) : (
                    <div
                      key={idx}
                      className={cn(dropdownLinkClass, "cursor-default")}
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
                  )
                ))}
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
