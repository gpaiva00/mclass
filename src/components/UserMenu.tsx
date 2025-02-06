import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth0 } from "@auth0/auth0-react";

function UserMenu() {
  const { user, logout, isAuthenticated } = useAuth0();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="md:h-8 md:w-8 w-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.picture} alt={user?.name} />
            <AvatarFallback>{user?.name?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <DropdownMenuLabel className="md:hidden">{user?.nickname}</DropdownMenuLabel>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          className="text-red-600 cursor-pointer"
        >
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu; 