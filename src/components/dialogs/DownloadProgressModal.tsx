import { IonIcon, IonModal, IonProgressBar } from "@ionic/react";
import { downloadOutline } from "ionicons/icons";

export interface DownloadProgressModalProps {
  isOpen: boolean;
  progress: number | null; // 0-1 range, null when unknown
  fileName?: string;
}

export default function DownloadProgressModal({
  isOpen,
  progress,
  fileName,
}: DownloadProgressModalProps) {
  const percentage =
    typeof progress === "number" && progress >= 0 && progress <= 1
      ? Math.round(progress * 100)
      : null;

  return (
    <IonModal
      isOpen={isOpen}
      backdropDismiss={false}
      className="ion-w-fit ion-h-fit ion-b-r-[10px]! ion-box-shadow! bg-black/40!"
    >
      <div
        className="size-full p-4 w-[80vw] max-h-[50vh] auto-rows-min
          grid justify-items-center items-center gap-2"
      >
        <IonIcon
          icon={downloadOutline}
          color="primary"
          className="size-10 mb-3"
        />

        <h2 className="my-0! mb-1! font-semibold! h-fit w-full text-center whitespace-pre-line">
          Downloading file
        </h2>

        {fileName && (
          <p className="text-xs px-4 max-h-10 h-fit w-full text-center overflow-y-auto! whitespace-pre-line">
            {fileName}
          </p>
        )}

        <IonProgressBar
          value={percentage !== null ? progress ?? undefined : undefined}
          type={percentage === null ? "indeterminate" : "determinate"}
          className="w-full mt-4"
        />

        {percentage !== null && (
          <p className="text-xs mt-2 w-full text-center">
            {percentage}% completed
          </p>
        )}
      </div>
    </IonModal>
  );
}
