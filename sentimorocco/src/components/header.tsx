"use client";
import { Bell, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"; // Using Command components from Shadcn UI
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Article } from "@/lib/utils";
import { toast } from "sonner";

export function Header() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to manage dropdown visibility

  const handleInputChange = async (value: string) => {
    const isLink = (query: string): boolean =>
      /^(https?:\/\/|www\.)[^\s]+$/.test(query);
    if (isLink(value)) {
      toast.info("Getting Article analysis results");
      router.replace(`/analytics?query${value}`);
    } else {
      setQuery(value);
      if (value.trim() === "") {
        setSuggestions([]);
        setIsDropdownOpen(false);
        return;
      }
      setIsDropdownOpen(true);
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/search?query=${value}`);
        console.log(data);
        setSuggestions(data?.articles || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCommandSelect = (art: Article) => {
    console.log(art);
    setIsDropdownOpen(false);
    router.replace(`/analytics?query=${art.href || art}`);
    toast.info("Getting Article analysis results");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-background border-b">
      <div className="flex w-full mx-4 items-center space-x-4">
        <h1 className="text-2xl font-bold">SentiMorocco</h1>
        <div className="relative flex-1">
          <Command className="w-full text-right">
            <CommandInput
              className="pl-8 "
              placeholder="Search comments or type a command..."
              value={query}
              onValueChange={(value) => handleInputChange(value)}
            />
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            {isDropdownOpen && suggestions.length > 0 && (
              <CommandList className="absolute top-full mt-2 bg-background w-1/2 text-right border rounded-lg shadow-md z-50">
                <CommandGroup heading="Suggestions">
                  {suggestions.map((suggestion, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => {
                        handleCommandSelect(suggestion?.href);
                      }}
                      className="text-base text-right cursor-pointer"
                    >
                      {suggestion.title || suggestion}
                    </CommandItem>
                  ))}
                </CommandGroup>
                {loading && <CommandItem>Loading...</CommandItem>}
              </CommandList>
            )}
            {/* {query && !loading && suggestions.length === 0 && (
              <CommandEmpty >No suggestions found.</CommandEmpty>
            )} */}
          </Command>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/01.png" alt="@username" />
                <AvatarFallback>UN</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">username</p>
                <p className="text-xs leading-none text-muted-foreground">
                  user@example.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
