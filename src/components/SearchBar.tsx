import { Input } from "@/components/ui/input";
import { Calendar, Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  date?: string;
  onDateChange?: (date: string) => void;
  showDateFilter?: boolean;
}

function SearchBar({
  value,
  onChange,
  placeholder = "Pesquisar...",
  date,
  onDateChange,
  showDateFilter,
}: SearchBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <div className="relative w-full">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-8"
        />
      </div>
      {showDateFilter && (
        <div className="relative w-full">
          <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            placeholder="Data"
            value={date}
            onChange={(e) => onDateChange?.(e.target.value)}
            className="pl-8 pr-8 w-full"
          />
          {date && (
            <button
              onClick={() => onDateChange?.("")}
              className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
            >
              Limpar Data
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export { SearchBar };
