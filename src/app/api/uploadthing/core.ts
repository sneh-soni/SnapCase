import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from "zod";
import sharp from "sharp";
import { db } from "@/db";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    // zod => form input validation at runtime
    .input(z.object({ configId: z.string().optional() }))
    .middleware(async ({ input }) => {
      return { input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { configId } = metadata.input;

      const res = await fetch(file.url);
      // ArrayBuffer is a array which stores binary data bytes
      const buffer = await res.arrayBuffer();

      // create sharp instance of the image
      const imageMetadata = await sharp(buffer).metadata();
      const { height, width } = imageMetadata;

      // step:1 Add image => configId is undefined
      if (!configId) {
        const configuration = await db.configuration.create({
          data: {
            imageName: file.name.split(".")[0],
            imageUrl: file.url,
            height: height || 500,
            width: width || 500,
          },
        });

        return { configId: configuration.id };
      } // step:2 Customize design
      else {
        const updatedConfiguration = await db.configuration.update({
          where: {
            id: configId,
          },
          // Update croppedImageUrl for step 3
          data: {
            croppedImageUrl: file.url,
          },
        });

        return { configId: updatedConfiguration.id };
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
