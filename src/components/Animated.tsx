"use client";

import { HTMLAttributes, useEffect, useRef, useState } from "react";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import Phone from "./Phone";

const REVIEWS = [
  "/testimonial-1.jpg",
  "/testimonial-2.jpg",
  "/testimonial-3.jpg",
  "/testimonial-4.jpg",
  "/testimonial-5.jpg",
  "/testimonial-6.jpg",
];

// Split an array of type template <T> into `numParts` parts
function splitArray<T>(array: Array<T>, numParts: number) {
  // 2D array => item = result[column][row]
  const result: Array<Array<T>> = [];

  for (let i = 0; i < array.length; i++) {
    const index = i % numParts;
    if (!result[index]) {
      result[index] = [];
    }
    result[index].push(array[i]);
  }

  return result;
}

interface AnimationProps extends HTMLAttributes<HTMLDivElement> {
  imgSrc: string;
}

function AnimatedReview({ imgSrc, className, ...props }: AnimationProps) {
  // Random animation delays for fade-in
  const POSSIBLE_ANIMATION_DELAYS = [
    "0s",
    "0.1s",
    "0.2s",
    "0.3s",
    "0.4s",
    "0.5s",
  ];

  // Choose random animation delay from POSSIBLE_ANIMATION_DELAYS
  const animationDelay =
    POSSIBLE_ANIMATION_DELAYS[
      Math.floor(Math.random() * POSSIBLE_ANIMATION_DELAYS.length)
    ];

  return (
    <div
      className={cn(
        // fade-in created in tailwind.config
        "animate-fade-in rounded-[2.5rem] bg-white p-4 opacity-0 shadow-xl shadow-slate-900/10",
        className
      )}
      style={{ animationDelay }}
      {...props}
    >
      <Phone imgSrc={imgSrc} />
    </div>
  );
}

function AnimatedColumn({
  reviews,
  className,
  reviewClassName,
  msPerPixel = 0,
}: {
  reviews: string[];
  className?: string;
  // reviewIndex : user to calculate (reviewClassName) for specific review
  reviewClassName?: (reviewIndex: number) => string;
  msPerPixel?: number;
}) {
  // Column container ref
  const columnRef = useRef<HTMLDivElement | null>(null);

  const [columnHeight, setColumnHeight] = useState(0);

  // Calculate animation duration according to columnHeight
  // large columnHeight => larger animation duration => faster animation
  const duration = `${columnHeight * msPerPixel}ms`;

  // Calculation on columnHeight
  useEffect(() => {
    if (!columnRef.current) return;

    // window.ResizeObserver called when columnRef resizes,
    // to make it compatible with various heights of Whole container
    // a ?? b => a if a is !null, else b
    const resizeObserver = new window.ResizeObserver(() => {
      setColumnHeight(columnRef.current?.offsetHeight ?? 0);
    });

    resizeObserver.observe(columnRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={columnRef}
      // marquee created in tailwind.config
      className={cn("animate-marquee space-y-8 p-4", className)}
      style={{ "--marquee-duration": duration } as React.CSSProperties}
    >
      {/* Concate reviews array to self so that content never runs out (repeatedly shows the same) */}
      {reviews.concat(reviews).map((imgSrc, reviewIndex) => (
        <AnimatedReview
          key={reviewIndex}
          className={reviewClassName?.(reviewIndex % reviews.length)}
          imgSrc={imgSrc}
        />
      ))}
    </div>
  );
}

function AnimatedGrid() {
  // Whole container ref
  const containerRef = useRef<HTMLDivElement | null>(null);

  // framer-motion - useInView(ref, options) returns true if reference is in view
  // once -> triggered once only for the first time
  // amount -> the amount of total component in view (number between 0 &1 | all | some)}
  const isInView = useInView(containerRef, { once: true, amount: 0.4 });

  const columns = splitArray(REVIEWS, 3);
  const column1 = columns[0];
  const column2 = columns[1];
  const column3 = splitArray(columns[2], 2);

  return (
    <div
      ref={containerRef}
      className="relative -mx-4 mt-16 grid h-[48rem] max-h-[150vh] grid-cols-1 items-start gap-6 overflow-hidden px-4 sm:mt-20 md:grid-cols-2 lg:grid-cols-3"
    >
      {isInView && (
        <>
          <AnimatedColumn
            reviews={[...column1, ...column3.flat(), ...column2]}
            reviewClassName={(reviewIndex) =>
              // If we are showing only 1 column, 1st column shows all the reviews
              cn({
                "md:hidden": reviewIndex >= column1.length + column3[0].length,
                "lg:hidden": reviewIndex >= column1.length,
              })
            }
            // controls speed of animation of the column
            // greater the msPerPixel slower the speed of vertical animation
            msPerPixel={8}
          />
          <AnimatedColumn
            reviews={[...column2, ...column3[1]]}
            className="hidden md:block"
            reviewClassName={(reviewIndex) =>
              // If we are showing 2 colums, 2nd column will carry reviews of 3rd column also.
              reviewIndex >= column2.length ? "lg:hidden" : ""
            }
            msPerPixel={12}
          />
          <AnimatedColumn
            reviews={column3.flat()}
            // if we are showing all 3 columns show only respective reviews
            //  No calculation of reviewClassName is needed
            className="hidden md:block"
            msPerPixel={10}
          />
        </>
      )}
    </div>
  );
}

export function AnimatedReviews() {
  return (
    <MaxWidthWrapper className="relative max-w-5xl">
      <img
        aria-hidden="true"
        src="/what-people-are-buying.png"
        className="absolute select-none hidden xl:block -left-32 top-1/3"
      />

      <AnimatedGrid />
    </MaxWidthWrapper>
  );
}
