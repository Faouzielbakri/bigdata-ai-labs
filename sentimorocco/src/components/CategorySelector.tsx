"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const categorys = [
  {
    value: "politique-سياسة",
    label: "politics",
  },
  {
    value: "sport-رياضة",
    label: "sport",
  },
  {
    value: "economie-اقتصاد",
    label: "economie.js",
  },
  {
    value: "societe-مجتمع",
    label: "societe",
  },
  {
    value: "art-et-culture-فن وثقافة",
    label: "art-et-culture",
  },
  {
    value: "faits-divers-حوادث",
    label: "societe",
  },
  {
    value: "regions-جهات",
    label: "societe",
  },
  {
    value: "international-خارج الحدود",
    label: "international",
  },
  {
    value: "sciences-nature-بيئة وعلوم",
    label: "sciences-nature",
  },
  {
    value: "social-media-عين على السوشل ميدي",
    label: "social-media",
  },
  {
    value: "medias-السلطة الرابعة",
    label: "medias",
  },
];

export function CategorySelector({
  value,
  setValue,
}: {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? categorys.find((category) => category.value === value)?.label
            : "Select category..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search category..." />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {categorys.map((category) => (
                <CommandItem
                  key={category.value}
                  value={category.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {category.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === category.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
