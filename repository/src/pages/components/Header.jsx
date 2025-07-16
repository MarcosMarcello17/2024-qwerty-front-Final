import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, UserCircle, Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar"; // Assuming useSidebar provides toggle for mobile
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { toggleSidebar, isMobile } = useSidebar(); // Or pass a toggle function as prop
  const navigate = useNavigate();

  // Placeholder user data
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
            href="/dashboard"
            className="text-2xl font-bold text-primary font-headline"
          >
            CashFlowPro
          </a>
        </div>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={user.image}
                    alt={user.name}
                    data-ai-hint="user avatar"
                  />
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem asChild>
                <a
                  href="/profile"
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer"
                >
                  <UserCircle className="mr-2 h-4 w-4" />
                  Perfil
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/login">
                  {" "}
                  {/* Replace with actual logout logic */}
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
