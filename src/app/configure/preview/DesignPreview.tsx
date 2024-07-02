"use client";

import LoginModal from "@/components/LoginModal";
import Phone from "@/components/Phone";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { BASE_PRICE, PRODUCT_PRICES } from "@/config/products";
import { cn, formatPrice } from "@/lib/utils";
import { COLORS, MODELS } from "@/validators/option-validator";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Configuration } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Confetti from "react-dom-confetti";
import { createCheckoutSession } from "./actions";

const DesignPreview = ({ configuration }: { configuration: Configuration }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useKindeBrowserClient();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  useEffect(() => setShowConfetti(true));

  const { id, color, model, finish, material } = configuration;
  const tw = COLORS.find(
    (supportedColor) => supportedColor.value === color
  )?.tw;
  const { label: modelLabel } = MODELS.options.find(
    ({ value }) => value === model
  )!;

  let totalPrice = BASE_PRICE;
  if (material === "polycarbonate")
    totalPrice += PRODUCT_PRICES.material.polycarbonate;
  if (finish === "textured") totalPrice += PRODUCT_PRICES.finish.textured;

  const { mutate: createPaymentSession } = useMutation({
    mutationKey: ["get-checkout-session"],
    mutationFn: createCheckoutSession,
    onSuccess: ({ url }) => {
      if (url) router.push(url);
      else throw new Error("Unable to retrive payment URL");
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "There was an error on our end. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCheckout = () => {
    if (user) {
      // create payment session
      createPaymentSession({ configId: id });
    } else {
      // need to log in
      localStorage.setItem("configurationId", id);
      setIsLoginModalOpen(true);
    }
  };

  return (
    <>
      {/* The celebration animation - confetti*/}
      <div
        aria-hidden="true" // for screen readers
        className="pointer-events-none select-none absolute inset-0 overflow-hidden flex justify-center"
      >
        <Confetti
          active={showConfetti}
          config={{ elementCount: 200, spread: 90 }}
        />
      </div>

      <LoginModal isOpen={isLoginModalOpen} setIsOpen={setIsLoginModalOpen} />

      <div className="mt-20 flex flex-col items-center md:grid text-sm sm:grid-cols-12 sm:grid-rows-1 sm:gap-x-6 md:gap-x-8 lg:gap-x-12">
        {/* User Phone cover preview */}
        <div className="md:col-span-4 lg:col-span-3 md:row-span-2 md:row-end-2">
          <Phone
            className={cn(`bg-${tw}`, "max-w-[150px] md:max-w-full")}
            imgSrc={configuration.croppedImageUrl!}
          />
        </div>

        {/* Model information */}
        <div className="mt-6 sm:col-span-9 md:row-end-1">
          <h3 className="text-3xl font-bold tracking-tight text-gray-900">
            Your {modelLabel} Case
          </h3>
          <div className="mt-3 flex items-center gap-1.5 text-base">
            <Check className="h-4 w-4 text-green-500" />
            In stock and ready to ship
          </div>
        </div>

        <div className="sm:col-span-12 md:col-span-9 text-base">
          {/* Highlights and Materials */}
          <div className="grid grid-cols-1 gap-y-8 border-b border-gray-200 py-8 sm:grid-cols-2 sm:gap-x-6 sm:py-6 md:py-10">
            {/* Highlights */}
            <div>
              <p className="font-medium text-zinc-950">Highlights</p>
              <ol className="mt-3 text-zinc-700 list-disc list-inside">
                <li>Wireless charging compatible</li>
                <li>TPU shock absorption</li>
                <li>Packaging made from recycled materials</li>
                <li>2 year print warranty</li>
              </ol>
            </div>
            {/* Materials */}
            <div>
              <p className="font-medium text-zinc-950">Materials</p>
              <ol className="mt-3 text-zinc-700 list-disc list-inside">
                <li>High-quality, durable material</li>
                <li>Scratch- and fingerprint resistant coating</li>
              </ol>
            </div>
          </div>

          {/* Pricing  and Checkout*/}
          <div>
            {/* Pricing */}
            <div className="grainy-dark p-6 sm:rounded-lg sm:p-8">
              <div className="flow-root">
                {/* Base price */}
                <div className="flex items-center justify-between py-1 mt-2">
                  <p className="text-gray-600">Base price</p>
                  <p className="font-medium text-gray-900">
                    {formatPrice(BASE_PRICE)}
                  </p>
                </div>

                {/* Finish Price */}
                <div className="flex items-center justify-between py-1 mt-2">
                  <p className="text-gray-600 capitalize">{finish} finish</p>
                  <p className="font-medium text-gray-900">
                    {finish === "textured"
                      ? formatPrice(PRODUCT_PRICES.finish.textured)
                      : formatPrice(PRODUCT_PRICES.finish.smooth)}
                  </p>
                </div>

                {/* Materil Price */}
                <div className="flex items-center justify-between py-1 mt-2">
                  <p className="text-gray-600 capitalize">
                    {material} material
                  </p>
                  <p className="font-medium text-gray-900">
                    {material === "polycarbonate"
                      ? formatPrice(PRODUCT_PRICES.material.polycarbonate)
                      : formatPrice(PRODUCT_PRICES.material.silicone)}
                  </p>
                </div>

                {/* Seperator */}
                <div className="my-2 h-px bg-gray-200" />

                {/* Total Price */}
                <div className="flex items-center justify-between py-2">
                  <p className="font-semibold text-gray-900">Order total</p>
                  <p className="font-semibold text-gray-900">
                    {formatPrice(totalPrice)}
                  </p>
                </div>
              </div>
            </div>

            {/* Checkput Button */}
            <div className="mt-8 flex justify-end pb-12">
              <Button
                onClick={() => handleCheckout()}
                className="px-4 sm:px-6 lg:px-8"
              >
                Checkout <ArrowRight className="h-4 w-4 ml-1.5 inline" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default DesignPreview;
