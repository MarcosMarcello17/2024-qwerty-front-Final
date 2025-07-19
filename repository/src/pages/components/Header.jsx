import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, UserCircle, Menu, CircleUserRound } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar"; // Assuming useSidebar provides toggle for mobile
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { toggleSidebar, isMobile } = useSidebar(); // Or pass a toggle function as prop
  const navigate = useNavigate();

  const signOff = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-sidebar shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mr-2 md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          )}
          <a
            href="/index"
            onClick={() => navigate("/index")}
            className="text-2xl font-bold text-primary font-headline"
          >
            CashFlowPro
          </a>
        </div>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-9 w-9 hover:cursor-pointer hover:ring-2 hover:ring-primary">
                <AvatarFallback className="p-0">
                  <CircleUserRound className="w-10 h-10" />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem asChild>
                <a href="/profile" className="cursor-pointer">
                  <UserCircle className="mr-2 h-4 w-4" />
                  Perfil
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a
                  href="#"
                  onClick={() => signOff()}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesion
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
