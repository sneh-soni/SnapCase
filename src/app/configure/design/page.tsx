import { db } from "@/db";
import { notFound } from "next/navigation";
import React from "react";
import DesignConfigurator from "./DesignConfigurator";

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}
const Page = async ({ searchParams }: PageProps) => {
  const { id } = searchParams;

  if (!id || typeof id !== "string") {
    notFound();
  }

  const configuration = await db.configuration.findUnique({
    where: {
      id,
    },
  });

  if (!configuration) notFound();

  const { imageName, imageUrl, height, width } = configuration;

  return (
    <DesignConfigurator
      configId={configuration.id}
      imageName={imageName}
      imageUrl={imageUrl}
      imageDimensions={{ width, height }}
    />
  );
};

export default Page;
