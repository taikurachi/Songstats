import { iconVariants } from "@/app/types/types";
import Image from "next/image";
type IconProps = {
  variant: iconVariants;
  size: number;
  className?: string;
};
export default function Icon({ variant, size, className }: IconProps) {
  return (
    <Image
      className={className}
      src={`/${variant}-icon.svg`}
      alt={`${variant} image`}
      width={size}
      height={size}
    />
  );
}
