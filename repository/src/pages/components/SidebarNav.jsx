import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuSkeleton,
  SidebarGroup,
} from "@/components/ui/sidebar";
import {
  LogOut,
  UserCircle,
  Target,
  LayoutDashboard,
  Award,
  ListChecks,
  LayoutList,
  HandCoins,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import logo from "../../assets/logo-removebg-preview.png";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const mainNavItems = [
  {
    title: "Dashboard",
    href: "/index",
    icon: LayoutDashboard,
  },
  {
    title: "Presupuestos",
    href: "/presupuestos",
    icon: Target,
  },
  {
    title: "Transacciones",
    href: "/transacciones",
    icon: ListChecks,
  },
  {
    title: "Categorias",
    href: "/categorias",
    icon: LayoutList,
  },
  {
    title: "Logros",
    href: "/achievements",
    icon: Award,
  },
  {
    title: "Pagos",
    href: "/pagos",
    icon: HandCoins,
  },
];

const userNavItems = [
  {
    title: "Perfil",
    href: "/profile",
    icon: UserCircle,
  },
  {
    title: "Cerrar Sesion",
    href: "logout",
    icon: LogOut,
  },
];

export function SidebarNav() {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500); // Simulate loading state
    return () => clearTimeout(timer);
  }, []);

  const user = {
    name: "User Name",
    email: "user@example.com",
    image:
      "https://creativeandcultural.wordpress.com/wp-content/uploads/2018/04/default-profile-picture.png",
  };
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const signOff = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const moveToPage = (href) => {
    if (href == "logout") {
      signOff();
    } else navigate(href);
  };

  const renderNavItem = (item) => (
    <SidebarMenuItem key={item.href}>
      <a onClick={() => moveToPage(item.href)} className="cursor-pointer">
        <SidebarMenuButton
          asChild
          isActive={
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href))
          }
          disabled={item.disabled}
          aria-current={pathname === item.href ? "page" : undefined}
          tooltip={{ content: item.title, side: "right", align: "center" }}
        >
          <div>
            <item.icon />
            <span>{item.title}</span>
          </div>
        </SidebarMenuButton>
      </a>
    </SidebarMenuItem>
  );

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      side="left"
      className="border-r border-sidebar-border"
    >
      <SidebarHeader className="p-4 flex items-center justify-between">
        <a
          href="/index"
          onClick={(e) => {
            e.preventDefault();
            navigate("/index");
          }}
          className="flex items-center gap-2"
        >
          <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-[#ffc300] text-4xl font-bold text-primary font-headline">
            <img src={logo} alt="logo" className="w-full h-full object-cover" />
          </div>
        </a>
      </SidebarHeader>

      <SidebarContent asChild>
        <ScrollArea className="h-full">
          {isLoading ? (
            <SidebarGroup>
              <SidebarMenu>
                {[...Array(5)].map((_, i) => (
                  <SidebarMenuSkeleton key={i} showIcon />
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ) : (
            <>
              <SidebarGroup>
                <SidebarMenu>{mainNavItems.map(renderNavItem)}</SidebarMenu>
              </SidebarGroup>
            </>
          )}
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarGroup className="mt-auto absolute bottom-16 left-0 right-0">
          <SidebarMenu>{userNavItems.map(renderNavItem)}</SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
