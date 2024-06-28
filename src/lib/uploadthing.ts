import { OurFileRouter } from "@/app/api/uploadthing/core";
import { generateReactHelpers } from "@uploadthing/react";

// generateReactHelpers returns useUploadThing hook to use in custom react components
// rather than using uploadthing's default components like buttons and dropzone
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
