import React from 'react';
import {
  BookOpen,
  Calculator,
  Landmark,
  Sprout,
  Sparkles,
  Palette,
  Book,
  GraduationCap,
  Zap,
  CheckCircle2,
  Archive,
} from 'lucide-react';

interface TallerIconProps {
  name: string;
  size?: number;
  className?: string;
}

export default function TallerIcon({ name, size = 20, className = "" }: TallerIconProps) {
  const normName = (name || '').trim();

  switch (normName) {
    // Workshop types
    case 'BookOpen':
    case '📖':
      return <BookOpen size={size} className={className} />;
    case 'Calculator':
    case '🔢':
      return <Calculator size={size} className={className} />;
    case 'Landmark':
    case '🏛️':
      return <Landmark size={size} className={className} />;
    case 'Sprout':
    case '🌿':
      return <Sprout size={size} className={className} />;
    case 'Sparkles':
    case '✨':
      return <Sparkles size={size} className={className} />;
      
    // Levels / categories
    case 'Palette':
    case '🎨':
      return <Palette size={size} className={className} />;
    case 'Book':
    case '📚':
      return <Book size={size} className={className} />;
    case 'GraduationCap':
    case '🎓':
      return <GraduationCap size={size} className={className} />;
      
    // States
    case 'Zap':
    case '⚡':
      return <Zap size={size} className={className} />;
    case 'CheckCircle2':
    case '✅':
      return <CheckCircle2 size={size} className={className} />;
    case 'Archive':
    case '📦':
      return <Archive size={size} className={className} />;

    default:
      return <Sparkles size={size} className={className} />;
  }
}
