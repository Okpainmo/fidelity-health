import Logo from '@/components/Logo';

type BrandProps = {
  size?: 'sm' | 'md';
};

// The Fidelity Health mark and wordmark. Wrap it in a Link where it should
// navigate. (Missie, the AI assistant, is named separately in the chat UI.)
export default function Brand({ size = 'md' }: BrandProps) {
  return (
    <span className="flex items-center gap-2 text-foreground">
      <Logo size={size === 'sm' ? 22 : 26} className="text-accent" />
      <span className={`poppins font-semibold tracking-tight whitespace-nowrap ${size === 'sm' ? 'text-[15px]' : 'text-[17px]'}`}>Fidelity Health</span>
    </span>
  );
}
