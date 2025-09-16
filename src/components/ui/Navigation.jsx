// components/NavigationMenu.js
import React from "react";
import { useRouter } from "next/router"; // ✅ Fix: Use `useRouter` instead of `usePathname`
import { navigationData } from "../data/navigationData";
import { iconMap } from "../data/iconMap";
import Link from "next/link";

// Utility function to normalize paths (remove trailing slash if present)
const normalizePath = (path) => {
  return path === "/" ? path : path.replace(/\/+$/, "");
};

const NavigationMenu = () => {
  const router = useRouter(); // ✅ Fix: Use `useRouter()`
  const pathname = router.pathname; // ✅ Correct way to get path in Pages Router
  const normalizedPathname = normalizePath(pathname);

  return (
    <nav className="top-nav mega-menu nav">
      <ul id="mnu-eft" className="parent-menu">
        {navigationData.map((item, index) => {
          const normalizedItemPath = normalizePath(item.path);
          const isActive =
            normalizedItemPath === "/"
              ? normalizedPathname === "/"
              : normalizedPathname.startsWith(normalizedItemPath);

          return (
            <li
              key={index}
              className={`${item.subMenu.length > 0 ? "hasChildren" : ""} ${
                isActive ? "active" : ""
              }`}
            >
              <Link href={item.path}>
                {item.icon && React.createElement(iconMap[item.icon])}
                <span>{item.title}</span>
              </Link>
              {item.subMenu.length > 0 && (
                <ul style={{ maxWidth: "451px" }}>
                  {item.subMenu.map((subItem, subIndex) => {
                    const normalizedSubPath = normalizePath(subItem.path);
                    const isSubActive =
                      normalizedSubPath === "/"
                        ? normalizedPathname === "/"
                        : normalizedPathname.startsWith(normalizedSubPath);

                    return (
                      <li
                        key={subIndex}
                        className={isSubActive ? "active" : ""}
                      >
                        <Link href={subItem.path}>{subItem.title}</Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default NavigationMenu;
