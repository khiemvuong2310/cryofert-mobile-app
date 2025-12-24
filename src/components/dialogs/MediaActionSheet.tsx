import React, { useState } from "react";
import { IonActionSheet, IonToast } from "@ionic/react";
import type { MediaResponse } from "@src/schemas/media";
import { useGenericDialogStore } from "@src/stores/dialog";
import GenericViewPdfDialog from "@src/components/dialogs/GenericViewPdfDialog";
import { PhotoViewer } from "@capacitor-community/photoviewer";
import { FileTransfer } from "@capacitor/file-transfer";
import { Filesystem, Directory } from "@capacitor/filesystem";
import DownloadProgressModal from "@src/components/dialogs/DownloadProgressModal";
import { ensureFsPerm } from "@src/services/permission-services/filesystem";

export interface MediaActionSheetProps {
  media: MediaResponse | null;
  onClose: () => void;
  toastPositionAnchor?: string;
  toastPosition?: "top" | "middle" | "bottom";
}

export default function MediaActionSheet({
  media,
  onClose,
  toastPositionAnchor,
  toastPosition = "bottom",
}: MediaActionSheetProps) {
  const openGenericDialog = useGenericDialogStore((s) => s.openGenericDialog);

  const [pdfViewerIsOpen, setPdfViewerIsOpen] = useState(false);
  const [viewerFileUrl, setViewerFileUrl] = useState<string | undefined>(undefined);
  const [viewerTitle, setViewerTitle] = useState<string | undefined>(undefined);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadedToastOpen, setDownloadedToastOpen] = useState(false);

  function handleView(target: MediaResponse | null) {
    if (!target) return onClose();

    const mime = (target.fileType ?? "").toLowerCase();
    const fileUrl = target.filePath;
    const title = target.originalFileName;

    if (mime === "application/pdf" || mime.includes("pdf")) {
      setViewerFileUrl(fileUrl);
      setViewerTitle(title);
      setPdfViewerIsOpen(true);
      onClose();
      return;
    }

    if (mime.startsWith("image/")) {
      PhotoViewer.show({ images: [{ url: fileUrl }] });
      onClose();
      return;
    }

    openGenericDialog({
      title: "Unsupported file type",
      content: target.fileType,
      svgIconColor: "warning",
    });
    onClose();
  };

  async function handleDownload(target: MediaResponse | null) {
    if (!target) return onClose();

    const mime = (target.fileType ?? "").toLowerCase();

    // REQUIRE ATTENTION: temporarily storing images in Documents. Once the
    // community Media plugin supports Capacitor v8, switch to saving in
    // the device gallery instead.
    if (mime.startsWith("image/")) {
      // Fall through to the same download flow for now (documents storage).
    }

    const fileUrl = target.filePath;
    const fileName = target.originalFileName || target.fileName || "downloaded-file";

    // Ensure filesystem permissions are granted
    const hasPermission = await ensureFsPerm();
    if (!hasPermission) {
      openGenericDialog({
        title: "Permission denied",
        content: "Filesystem access is required to download files. Please grant permission in your device settings.",
        svgIconColor: "danger",
      });
      onClose();
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    let progressListener: { remove: () => Promise<void> } | null = null;

    try {
      const fileInfo = await Filesystem.getUri({
        directory: Directory.Documents,
        path: fileName,
      });

      progressListener = await FileTransfer.addListener(
        "progress",
        (progress) => {
          if (progress.lengthComputable && progress.contentLength > 0) {
            setDownloadProgress(progress.bytes / progress.contentLength);
          } else {
            setDownloadProgress(null);
          }
        }
      );

      await FileTransfer.downloadFile({
        url: fileUrl,
        path: fileInfo.uri,
        progress: true,
      });

      setDownloadProgress(1);
      setDownloadedToastOpen(true);
    } catch (error: any) {
      console.error("media:download:error", error);
      openGenericDialog({
        title: "Download failed",
        content:
          (error && (error.message || error.toString())) ||
          "An error occurred while downloading the file.",
        svgIconColor: "danger",
      });
    } finally {
      if (progressListener) {
        await progressListener.remove();
      }

      // Small delay so users can see the progress reach 100%
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(null);
      }, 300);

      onClose();
    }
  };

  const header = media?.originalFileName ?? "Media";

  return (
    <>
      <IonActionSheet
        isOpen={media !== null}
        onDidDismiss={onClose}
        header={header}
        buttons={[
          {
            text: "View",
            handler: () => {
              handleView(media);
            },
          },
          {
            text: "Download",
            handler: () => {
              handleDownload(media);
            },
          },
          {
            text: "Cancel",
            role: "cancel",
          },
        ]}
      />

      <DownloadProgressModal
        isOpen={isDownloading}
        progress={downloadProgress}
        fileName={media?.originalFileName ?? media?.fileName}
      />

      <GenericViewPdfDialog
        isOpen={pdfViewerIsOpen}
        setIsOpen={setPdfViewerIsOpen}
        fileUrl={viewerFileUrl}
        title={viewerTitle ?? "PDF Viewer"}
      />

      <IonToast
        isOpen={downloadedToastOpen}
        onDidDismiss={() => setDownloadedToastOpen(false)}
        message="Download complete"
        position={toastPosition}
        positionAnchor={toastPositionAnchor}
        duration={1500}
      />
    </>
  );
}
