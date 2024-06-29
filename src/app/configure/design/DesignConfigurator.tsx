"use client";

import HandleComponent from "@/components/HandleComponent";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import NextImage from "next/image";
import { Rnd } from "react-rnd";

interface DesignConfiguratorProps {
  configId: string;
  imageUrl: string;
  imageDimensions: { width: number; height: number };
}

const DesignConfigurator = ({
  configId,
  imageUrl,
  imageDimensions,
}: DesignConfiguratorProps) => {
  return (
    <div className="relative mt-20 grid grid-cols-1 lg:grid-cols-3 mb-16 pb-20">
      <div className="relative h-[38rem] overflow-hidden col-span-2 w-full max-w-4xl flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
        {/* phone template and resize n drag image , aspect ratio of /phone-template.png = 896/1831 */}

        <div className="relative w-60 bg-opacity-50 pointer-events-none aspect-[896/1831]">
          <AspectRatio
            ratio={896 / 1831}
            className="pointer-events-none relative z-50 aspect-[896/1831] w-full"
          >
            <NextImage
              fill
              alt="phone image"
              src="/phone-template.png"
              className="pointer-events-none z-50 select-none"
            />
          </AspectRatio>

          {/* shadow div around phone */}
          <div className="absolute z-40 inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px] shadow-[0_0_0_99999px_rgba(229,231,235,0.6)]" />

          {/* phone color div */}
          <div
            className={cn(
              "absolute inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px]",
              `bg-blue-600`
            )}
          />
        </div>

        {/* rnd user image */}
        <Rnd
          default={{
            x: 180, //initial position
            y: 200,
            height: imageDimensions.height / 4, //initial dimensions
            width: imageDimensions.width / 4,
          }}
          className="absolute z-20 border-2 border-primary"
          lockAspectRatio
          resizeHandleComponent={{
            bottomRight: <HandleComponent side="bottom-right" />,
            bottomLeft: <HandleComponent side="bottom-left" />,
            topRight: <HandleComponent side="top-right" />,
            topLeft: <HandleComponent side="top-left" />,
          }}
        >
          {/* user image */}
          <div className="relative w-full h-full">
            <NextImage
              src={imageUrl}
              fill
              alt="your image"
              className="pointer-events-none opacity-100"
            />
          </div>
        </Rnd>
      </div>
    </div>
  );
};

export default DesignConfigurator;
