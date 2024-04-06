import Image from "next/image";
import { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import classNames, { Argument } from "classnames";

interface BackgroundImageProps {
  children?: ReactNode;
  className?: Argument;
  image: ReactElement<typeof Image>;
}

type BackgroundImageAdditionalProps = Omit<
  ComponentPropsWithoutRef<"div">,
  keyof BackgroundImageProps
>;

export default function HomeBg({
  children,
  className,
  image,
  ...props
}: BackgroundImageProps & BackgroundImageAdditionalProps) {
  return (
    <div
      className={classNames("relative", "overflow-hidden", className)}
      {...props}
    >
      <div className="absolute inset-0 -z-10">{image}</div>
      <div className="z-10 flex h-full justify-center">{children}</div>
    </div>
  );
};