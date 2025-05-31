import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "@supabase/supabase-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const supabase = createClient(
  "https://vjbdrsuksueppbxxebzp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqYmRyc3Vrc3VlcHBieHhlYnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NjA0NzYsImV4cCI6MjA2MDMzNjQ3Nn0.QNrJgBgwfNS5ttQJruebkyK-hVisApDeXdqtdaMLy9w"
);