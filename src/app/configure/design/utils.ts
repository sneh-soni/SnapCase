import { Toast, ToasterToast } from "@/components/ui/use-toast";
import { ClientUploadedFileData } from "uploadthing/types";
import { Dimensions, Position } from "./DesignConfigurator";

// Create and Save user configured image to uploadThing
export async function saveConfiguration(
  phoneCaseRef: React.RefObject<HTMLDivElement>,
  containerRef: React.RefObject<HTMLDivElement>,
  renderedPosition: Position,
  renderedDimension: Dimensions,
  imageName: string,
  imageUrl: string,
  configId: string,
  // useUploadThing()
  startUpload: (
    files: File[],
    input: {
      configId?: string | undefined;
    }
  ) => Promise<
    | ClientUploadedFileData<{
        configId: string;
      }>[]
    | undefined
  >,
  // useToast()
  toast: ({ ...props }: Toast) => {
    id: string;
    dismiss: () => void;
    update: (props: ToasterToast) => void;
  }
) {
  try {
    /******
    getBoundingClientRect() returns a DOMRect object 
    providing information about the size of an element and its position 
    relative to the viewport.
    Use "!" after refs to tell TS that they are not null 
    and if they are => catch
    ******/
    const {
      left: caseLeft,
      top: caseTop,
      width,
      height,
    } = phoneCaseRef.current!.getBoundingClientRect();

    const { left: containerLeft, top: containerTop } =
      containerRef.current!.getBoundingClientRect();

    // Calculating phoneRef offsets reference to containerRef
    // i.e. offsets of phoneRef from the containerRef, since initially both are from viewport
    const leftOffset = caseLeft - containerLeft;
    const topOffset = caseTop - containerTop;

    // Since renderedPosition is relative to containerRef
    // Therefore actualX and actualY are relative to phoneRef
    const actualX = renderedPosition.x - leftOffset;
    const actualY = renderedPosition.y - topOffset;

    // Now we know the coordinates of image on phoneRef and
    // also the dimensions of the image (using imageDimensions)
    // Create canvas element with the dimensions of the phoneCaseRef
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    // Get 2D context of the canvas, which allows us to draw on the canvas
    const ctx = canvas.getContext("2d");

    // Create a new Image element and draw the image on the canvas
    const userImage = new Image();
    // set crossOrigin to anonymous to avoid CORS error (on using imageUrl)
    userImage.crossOrigin = "anonymous";
    userImage.src = imageUrl;
    // wait for image to load on userImage from imageUrl
    await new Promise((resolve) => (userImage.onload = resolve));

    // Draw the image on the canvas (can be null) using context(ctx)
    ctx?.drawImage(
      userImage, // Image to draw
      actualX, // X coordinate of image to draw from top-left corner of the canvas
      actualY, // Y cordinate of image to draw from top-left corner of the canvas
      renderedDimension.width, // Width of the image to draw
      renderedDimension.height // Height of the image to draw
    );

    /*******     
    Syntax of data URI : "data:[<media type>][;charset=<character set>][;base64],<data>"
    eg. "data:image/jpeg;charset=utf-8;base64,iVBORw0KGgoAAAANSUhEUgAA..."
    ********/
    // toDataURL() returns a base64 data URI encoded string containing the image data
    const base64String = canvas.toDataURL();

    /******
    base64String can directly be converted into `HTMLImageElement` by setting its src attribute,
    like: const img = new Image();  img.src = base64String;
    but to create a `File` from a base64String,
    First convert the base64String to a `Blob`. Then `Blob` to `File`
    Using `blob` -> `File`: because startUpload() takes `File[]` as argument
    also it is more robust and flexible for handling larger images
    ******/

    // actual data as string
    const base64Data = base64String.split(",")[1];

    // depicts the type of data in the string, here, "image/png"
    const mimeString = base64String.split(",")[0].split(":")[1].split(";")[0];

    // atob() decodes a string of Base64-encoded data into bytes
    const bytesAsString = atob(base64Data);

    // create an array of unicode values for each character of bytesAsString
    const bytesAsNumbers = new Array(bytesAsString.length);
    for (let i = 0; i < bytesAsString.length; i++) {
      // charCodeAt() returns the Unicode value of the character at the specified location.
      bytesAsNumbers[i] = bytesAsString.charCodeAt(i);
    }

    /******
    The Uint8Array (typed array) represents an array of 8-bit unsigned integers.
    All typed arrays operate on ArrayBuffer (an array of bytes)
    ******/

    // create a Uint8Array from bytesAsNumbers
    const byteArray = new Uint8Array(bytesAsNumbers);

    /******
    Blob: A file-like object of immutable, raw data (not actual file)
    ******/

    // create a blob object from the Uint8Array
    const blob = new Blob([byteArray], { type: mimeString });

    // Converting `Blob` to (png) `File` with filename of "(name)-config.png"
    const file = new File([blob], `${imageName}-config.png`, {
      type: mimeString,
    });

    // Upload the file to uploadThing
    // Also passing configId so that it does'nt create a new one this time
    // (refer core.ts)
    await startUpload([file], { configId });
  } catch (err) {
    toast({
      title: "Something went wrong",
      description: "There was a problem saving your config, please try again.",
      variant: "destructive",
    });
  }
}
