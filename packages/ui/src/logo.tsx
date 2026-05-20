/**
 * Logo — the Whiteboard brand mark, sourced from the real production SVG.
 *
 * Variants:
 *   - mark    (default)   square mark only
 *   - wordmark             mark + "Whiteboard" wordmark
 *   - inverse              white plate, brand-violet mark + wordmark (for ink/brand bg)
 */

import * as React from "react";
import { cn } from "./lib/utils";

export type LogoProps = React.SVGAttributes<SVGSVGElement> & {
  variant?: "mark" | "wordmark" | "inverse";
};

export function Logo({ variant = "mark", className, ...props }: LogoProps) {
  if (variant === "mark") {
    return (
      <svg
        viewBox="0 0 51 51"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("size-8", className)}
        {...props}
      >
        <path
          d="M43.6002 0H6.4923C2.9067 0 0 2.9067 0 6.4923V43.6002C0 47.1858 2.9067 50.0925 6.4923 50.0925H43.6002C47.1858 50.0925 50.0925 47.1858 50.0925 43.6002V6.4923C50.0925 2.9067 47.1858 0 43.6002 0Z"
          fill="#595FAE"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.3148 18.5769H10.5924V21.8625C13.1228 25.1392 15.6515 28.3878 18.2078 31.6547H22.9303V28.3692C20.3901 25.0943 17.8681 21.8383 15.3148 18.5769Z"
          fill="white"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M26.7558 18.5769H22.0334V21.8625C24.5638 25.1392 27.0925 28.3878 29.6488 31.6547H31.8042L34.3608 28.3557C31.824 25.0854 29.3057 21.8336 26.7558 18.5769Z"
          fill="white"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M34.7779 18.4377H39.5004V21.7233C38.478 23.0472 37.4559 24.3667 36.4322 25.6845C35.217 24.1176 34.0026 22.554 32.7845 20.9905C33.4476 20.1395 34.1116 19.2888 34.7781 18.4379L34.7779 18.4377Z"
          fill="white"
        />
      </svg>
    );
  }

  const inverse = variant === "inverse";
  const plate = inverse ? "#FAFAF7" : "#595FAE";
  const stroke = inverse ? "#595FAE" : "#FFFFFF";
  const word = inverse ? "#FAFAF7" : "#1A1D2E";

  return (
    <svg
      viewBox="0 0 220 51"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8", className)}
      {...props}
    >
      <path
        d="M43.6002 0H6.4923C2.9067 0 0 2.9067 0 6.4923V43.6002C0 47.1858 2.9067 50.0925 6.4923 50.0925H43.6002C47.1858 50.0925 50.0925 47.1858 50.0925 43.6002V6.4923C50.0925 2.9067 47.1858 0 43.6002 0Z"
        fill={plate}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.3148 18.5769H10.5924V21.8625C13.1228 25.1392 15.6515 28.3878 18.2078 31.6547H22.9303V28.3692C20.3901 25.0943 17.8681 21.8383 15.3148 18.5769Z"
        fill={stroke}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M26.7558 18.5769H22.0334V21.8625C24.5638 25.1392 27.0925 28.3878 29.6488 31.6547H31.8042L34.3608 28.3557C31.824 25.0854 29.3057 21.8336 26.7558 18.5769Z"
        fill={stroke}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M34.7779 18.4377H39.5004V21.7233C38.478 23.0472 37.4559 24.3667 36.4322 25.6845C35.217 24.1176 34.0026 22.554 32.7845 20.9905C33.4476 20.1395 34.1116 19.2888 34.7781 18.4379L34.7779 18.4377Z"
        fill={stroke}
      />
      <text
        x="62"
        y="33"
        fontFamily="Quicksand, Nunito, system-ui, sans-serif"
        fontSize="26"
        fontWeight="700"
        letterSpacing="-0.01em"
        fill={word}
      >
        Whiteboard
      </text>
    </svg>
  );
}
