"use client";

import HandleComponent from "@/components/HandleComponent";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { cn, formatPrice } from "@/lib/utils";
import {
  Radio,
  RadioGroup,
  Label as RadioGroupLabel,
  Description as RadioGroupDescription,
} from "@headlessui/react";
import NextImage from "next/image";
import { Rnd } from "react-rnd";
import { useRef, useState } from "react";
import {
  COLORS,
  FINISHES,
  MATERIALS,
  MODELS,
} from "@/validators/option-validator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, ChevronsUpDown } from "lucide-react";
import { BASE_PRICE } from "@/config/products";
import { saveImageConfig } from "./utils";
import { useUploadThing } from "@/lib/uploadthing";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { OrderConfigArgs, saveOrderConfig } from "./actions";
import { useRouter } from "next/navigation";

export interface Dimensions {
  width: number;
  height: number;
}
export interface Position {
  x: number;
  y: number;
}
interface DesignConfiguratorProps {
  imageName: string;
  imageUrl: string;
  configId: string;
  imageDimensions: { width: number; height: number };
}

const DesignConfigurator = ({
  imageName,
  imageUrl,
  configId,
  imageDimensions,
}: DesignConfiguratorProps) => {
  const phoneCaseRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [renderedDimension, setRenderedDimension] = useState<Dimensions>({
    width: imageDimensions.width / 4,
    height: imageDimensions.height / 4,
  });
  const [renderedPosition, setRenderedPosition] = useState<Position>({
    x: 100,
    y: 150,
  });
  const [options, setOptions] = useState<{
    color: (typeof COLORS)[number];
    model: (typeof MODELS.options)[number];
    material: (typeof MATERIALS.options)[number];
    finish: (typeof FINISHES.options)[number];
  }>({
    color: COLORS[0],
    model: MODELS.options[0],
    material: MATERIALS.options[0],
    finish: FINISHES.options[0],
  });

  const { startUpload } = useUploadThing("imageUploader");
  const { toast } = useToast();
  const router = useRouter();

  const { mutate: saveConfig, isPending } = useMutation({
    mutationKey: ["save-config"],
    mutationFn: async (args: OrderConfigArgs) => {
      await Promise.all([
        saveImageConfig(
          phoneCaseRef,
          containerRef,
          renderedPosition,
          renderedDimension,
          imageName,
          imageUrl,
          configId,
          startUpload,
          toast
        ),
        saveOrderConfig(args),
      ]);
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "There was an error on our end. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.push(`/configure/preview?id=${configId}`);
    },
  });

  return (
    <div className="relative mt-20 grid grid-cols-1 lg:grid-cols-3 mb-16 pb-20">
      {/* Image configuration section */}
      <div
        ref={containerRef}
        className="relative h-[38rem] overflow-hidden col-span-2 w-full max-w-4xl flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        {/* phone template and resize n drag image , aspect ratio of /phone-template.png = 896/1831 */}
        <div className="relative w-60 bg-opacity-50 pointer-events-none aspect-[896/1831]">
          {/* AspectRatio locks the aspect ratio on every width device */}
          <AspectRatio
            ref={phoneCaseRef}
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
              `bg-${options.color.tw}`
            )}
          />
        </div>

        {/* rnd user image */}
        <Rnd
          default={{
            x: 100, //initial position
            y: 150,
            //initial dimensions since user image dimensions too large
            height: imageDimensions.height / 4,
            width: imageDimensions.width / 4,
          }}
          className="absolute z-20 border-2 border-primary"
          onResizeStop={(_, __, ref, ___, { x, y }) => {
            setRenderedDimension({
              // eg. ref.style.height = "100px" (string),
              // therefore slice(0,-2) to remove 'px',
              // and then parse them to int
              height: parseInt(ref.style.height.slice(0, -2)),
              width: parseInt(ref.style.width.slice(0, -2)),
            });

            setRenderedPosition({ x, y });
          }}
          onDragStop={(_, data) => {
            const { x, y } = data;
            setRenderedPosition({ x, y });
          }}
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

      {/* Customize your case  */}
      <div className="h-[38rem] w-full col-span-full lg:col-span-1 flex flex-col bg-white">
        <ScrollArea className="relative flex-1 overflow-auto">
          {/* Gradient decoration div */}
          <div
            aria-hidden="true" // for screen readers
            className="absolute z-10 inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white pointer-events-none"
          />

          <div className="px-8 pb-12 pt-4">
            <h2 className="tracking-tight font-bold text-3xl">
              Customize your case.
            </h2>
            {/* Seperator */}
            <div className="w-full h-px bg-zinc-200 my-4" />

            <div className="relative mt-4 h-full flex flex-col justify-between">
              <div className="flex flex-col gap-6">
                {/* Color selector */}
                <RadioGroup
                  value={options.color}
                  onChange={(val) => {
                    setOptions((prev) => ({
                      ...prev,
                      color: val,
                    }));
                  }}
                >
                  <Label>
                    Color:{" "}
                    <span className="font-semibold">{options.color.label}</span>
                  </Label>
                  <div className="mt-3 flex items-center space-x-3">
                    {COLORS.map((color) => (
                      <Radio
                        key={color.label}
                        value={color}
                        className={({ checked }) =>
                          cn(
                            "relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 active:ring-0 focus:ring-0 active:outline-none focus:outline-none border-2 border-transparen",
                            {
                              [`border-${color.tw}`]: checked,
                            }
                          )
                        }
                      >
                        <span
                          className={cn(
                            `bg-${color.tw}`,
                            "h-8 w-8 rounded-full border border-black border-opacity-10"
                          )}
                        />
                      </Radio>
                    ))}
                  </div>
                </RadioGroup>

                {/* Model selector */}
                <div className="relative flex flex-col gap-3 w-full">
                  <Label>Model</Label>
                  <DropdownMenu>
                    {/* by default <DropdownMenuTrigger> renders a button, but we want to render our own button inside it, hence use asChild property */}
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {options.model.label}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {MODELS.options.map((model) => (
                        <DropdownMenuItem
                          key={model.label}
                          className={cn(
                            "flex text-sm gap-1 items-center p-1.5 cursor-default hover:bg-zinc-100",
                            {
                              "bg-zinc-100":
                                model.label === options.model.label,
                            }
                          )}
                          onClick={() => {
                            setOptions((prev) => ({ ...prev, model }));
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              model.label === options.model.label
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {model.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Material an Finish selector */}
                {[MATERIALS, FINISHES].map(
                  ({ name, options: selectableOptions }) => (
                    <RadioGroup
                      key={name}
                      value={options[name]}
                      onChange={(val) => {
                        setOptions((prev) => ({
                          ...prev,
                          [name]: val,
                          // [name] ==> dynamic notation because name is "material"|"finish" / TS thing
                        }));
                      }}
                    >
                      <Label>
                        {/* Making first letter uppercase */}
                        {name.slice(0, 1).toUpperCase() + name.slice(1)}
                      </Label>
                      <div className="mt-3 space-y-4">
                        {selectableOptions.map((option) => (
                          <Radio
                            key={option.value}
                            value={option}
                            className={({ checked }) =>
                              cn(
                                "relative block cursor-pointer rounded-lg bg-white p-4 shadow-sm border-2 border-zinc-200 focus:outline-none ring-0 focus:ring-0 outline-none sm:flex sm:justify-between",
                                {
                                  "border-primary": checked,
                                }
                              )
                            }
                          >
                            {/* Label and description */}
                            <span className="flex items-center">
                              <span className="flex flex-col text-sm">
                                <RadioGroupLabel
                                  className="font-medium text-gray-900"
                                  as="span"
                                >
                                  {option.label}
                                </RadioGroupLabel>

                                {option.description && (
                                  <RadioGroupDescription
                                    as="span"
                                    className="text-gray-500"
                                  >
                                    <span className="block sm:inline">
                                      {option.description}
                                    </span>
                                  </RadioGroupDescription>
                                )}
                              </span>
                            </span>

                            {/* option Price */}
                            <RadioGroupDescription
                              as="span"
                              className="mt-2 flex text-sm sm:ml-4 sm:mt-0 sm:flex-col sm:text-right"
                            >
                              <span className="font-medium text-gray-900">
                                {formatPrice(option.price)}
                              </span>
                            </RadioGroupDescription>
                          </Radio>
                        ))}
                      </div>
                    </RadioGroup>
                  )
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="w-full px-8 h-16 bg-white">
          {/* seperator */}
          <div className="h-px w-full bg-zinc-200" />

          {/* Price and continue button */}
          <div className="w-full h-full flex justify-end items-center">
            <div className="w-full flex gap-6 items-center">
              <div className="font-medium whitespace-nowrap flex flex-col">
                <p className="text-xs text-gray-500">Total</p>
                {formatPrice(
                  BASE_PRICE + options.finish.price + options.material.price
                )}
              </div>
              <Button
                isLoading={isPending}
                disabled={isPending}
                loadingText="saving"
                onClick={() =>
                  saveConfig({
                    configId,
                    color: options.color.value,
                    finish: options.finish.value,
                    material: options.material.value,
                    model: options.model.value,
                  })
                }
                size="sm"
                className="w-full"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-1.5 inline" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignConfigurator;
