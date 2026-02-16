import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

export default function NavbarComponent() {
  const { data: session } = useSession();

  const navItems = [
    {
      name: "Home",
      link: "/",
    },
    {
      name: "Blog",
      link: "/blogs",
    },
    {
      name: "About",
      link: "#about",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = session?.user?.role === "admin";

  return (
    <Navbar>
      {/* Desktop Navigation */}
      <NavBody>
        <Link href="/">
          <NavbarLogo />
        </Link>
        <NavItems items={navItems} />
        <div className="flex items-center gap-4">
          {isAdmin ? (
            <>
              <NavbarButton as={Link} href="/admin" variant="secondary">
                Dashboard
              </NavbarButton>
              <NavbarButton
                as="button"
                type="button"
                variant="primary"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </NavbarButton>
            </>
          ) : (
            <NavbarButton
              as={Link}
              href="/admin/login"
              variant="primary"
            >
              Admin login
            </NavbarButton>
          )}
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <Link href="/">
            <NavbarLogo />
          </Link>
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item, idx) => (
            <Link
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative text-neutral-600 dark:text-neutral-300"
            >
              <span className="block">{item.name}</span>
            </Link>
          ))}
          <div className="flex w-full flex-col gap-4">
            {isAdmin ? (
              <>
                <NavbarButton
                  as={Link}
                  href="/admin"
                  variant="secondary"
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </NavbarButton>
                <NavbarButton
                  as="button"
                  type="button"
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                >
                  Sign out
                </NavbarButton>
              </>
            ) : (
              <NavbarButton
                as={Link}
                href="/admin/login"
                variant="primary"
                className="w-full"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin login
              </NavbarButton>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
