import oldLogo from '../assets/logo_MDSU-M2_ORANGE-13.svg';
import heroLogo from '../assets/logo_MDSU-M2_ORANGE-12.svg';

export function Logo({
  className = '',
  size = 'normal',
  variant = 'nav',
}: {
  className?: string;
  size?: 'normal' | 'large';
  variant?: 'nav' | 'hero';
}) {
  const dimensions = size === 'large' ? 'h-64 w-auto' : 'h-8 w-auto';
  const src = variant === 'hero' ? heroLogo : oldLogo;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src={src}
        alt="FixUp logo"
        className={dimensions}
      />
    </div>
  );
}
