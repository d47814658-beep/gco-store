import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cleanText(input: string | undefined | null): string {
  if (!input) return "";
  
  // 1. Enlever les espaces multiples
  let text = input.trim().replace(/\s{2,}/g, ' ');

  const upperCaseTechWords = ["hp", "dell", "lenovo", "asus", "acer", "msi", "macbook", "apple", "ssd", "hdd", "ram", "pc", "usb", "gx"];

  // 2. Si le texte complet est HURLÉ (TOUT EN MAJUSCULES), on le normalise
  const lettersOnly = text.replace(/[^a-zA-Z]/g, '');
  const isShouting = lettersOnly.length > 3 && lettersOnly === lettersOnly.toUpperCase();
  
  if (isShouting || text === text.toLowerCase()) {
    text = text.toLowerCase().split(' ').map(word => {
      const cleanWord = word.replace(/[.,]/g, ''); // ignore punctuation for match
      if (upperCaseTechWords.includes(cleanWord)) return word.toUpperCase();
      if (cleanWord === 'go') return word.charAt(0).toUpperCase() + 'o'; // 'Go'
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  } else {
    // 3. Même si ce n'est pas hurlé, on force les acronymes en majuscule ('hp' -> 'HP')
    text = text.split(' ').map(word => {
      const cleanWord = word.toLowerCase().replace(/[.,]/g, '');
      if (upperCaseTechWords.includes(cleanWord)) return word.toUpperCase();
      if (cleanWord === 'go') return word.charAt(0).toUpperCase() + 'o';
      return word;
    }).join(' ');
  }

  // 4. Forcer la première lettre en majuscule au cas où
  return text.charAt(0).toUpperCase() + text.slice(1);
}
