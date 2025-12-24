import { Filesystem } from "@capacitor/filesystem";

let permissionPromise: Promise<boolean> | null = null;

/**
 * Ensures filesystem permissions are granted for Directory.Documents.
 * Handles concurrent calls by sharing a single permission request promise.
 * @returns Promise that resolves to true if permission is granted, false otherwise
 */
export async function ensureFsPerm(): Promise<boolean> {
  // If there's already a permission request in progress, wait for it
  if (permissionPromise) {
    return permissionPromise;
  }

  // Create a new permission request promise
  permissionPromise = (async () => {
    try {
      // Check current permissions
      const status = await Filesystem.checkPermissions();

      // If already granted, return immediately
      if (status.publicStorage === "granted") {
        permissionPromise = null;
        return true;
      }

      // If we can prompt, request permission
      if (
        status.publicStorage === "prompt" ||
        status.publicStorage === "prompt-with-rationale"
      ) {
        const result = await Filesystem.requestPermissions();
        const granted = result.publicStorage === "granted";
        permissionPromise = null;
        return granted;
      }

      // Permission denied or not available
      permissionPromise = null; // Reset
      return false;
    } catch (error) {
      permissionPromise = null;
      console.error("ensureFsPerm:error", error);
      return false;
    }
  })();

  return permissionPromise;
}
