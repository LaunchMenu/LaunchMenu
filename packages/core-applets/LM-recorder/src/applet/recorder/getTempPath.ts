import OS from "os";
import Path from "path";

/**
 * Retrieves a temp file path for a video
 * @param id The id of the vioeo
 * @param image Whether the file should be an image file
 */
export function getTempPath(id: string, image?: boolean): string {
    return Path.join(OS.tmpdir(), `${id}-${image ? "image.png" : "video.webm"}`);
}
