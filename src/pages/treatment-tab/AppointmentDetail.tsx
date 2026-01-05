import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonFooter,
  IonButton,
  IonIcon,
  useIonRouter,
} from "@ionic/react";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router";
import { useAppointmentDetailQuery } from "@src/hooks/appointment-hook";
import { useServiceRequestInAppointment } from "@src/hooks/service-request-hook";
import { useMedicalRecordQuery } from "@src/hooks/medical-record-hook";
import AppointmentDetailInfo from "@src/components/appointment-detail-segments/AppointmentDetailInfo";
import AppointmentDetailCycles from "@src/components/appointment-detail-segments/AppointmentDetailCycles";
import AppointmentDetailServiceReq from "@src/components/appointment-detail-segments/AppointmentDetailServiceReq";
import AppointmentDetailMedicalRecord from "@src/components/appointment-detail-segments/AppointmentDetailMedicalRecord";
import { ROUTES } from "@src/routes/routes";
import { reload } from "ionicons/icons";
import ContentSpinnerOverlay from "@src/components/layout/ContentSpinnerOverlay";

export default function AppointmentDetail() {
  const [segment, setSegment] = useState("info");
  const [isManualRefetching, setIsManualRefetching] = useState(false);

  const router = useIonRouter();

  const { appointmentId } = useParams<{ appointmentId: string }>();

  const appointmentQuery = useAppointmentDetailQuery(appointmentId ?? "");
  const appointment = appointmentQuery.data?.data;

  const serviceRequestQuery = useServiceRequestInAppointment(appointmentId ?? "");

  const medicalRecordQuery = useMedicalRecordQuery({
    patientId: appointment?.patient?.id ?? "",
    appointmentId: appointmentId,
  });

  const showPayNowFooter = useMemo(() => {
    if (!appointment?.transactions?.length) return false;

    const latestPayment = [...appointment.transactions]
      .filter((transaction) => transaction.transactionType === "Payment")
      .sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime()
      )[0];

    if (!latestPayment) return false;

    return latestPayment.status === "Pending";
  }, [appointment]);

  const isLoading =
    appointmentQuery.isPending ||
    serviceRequestQuery.isPending ||
    medicalRecordQuery.isPending;

  useEffect(() => {
    if (appointmentQuery.isError) console.log(appointmentQuery.error);
  }, [appointmentQuery.error, appointmentQuery.isError]);

  return (
    <IonPage>
      <IonHeader className="shadow-none!">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>
            {appointment ? (
              <>
                Appointment{" "}
                <span className="text-xs">{appointment.typeName}</span>
              </>
            ) : (
              "Appointment"
            )}
          </IonTitle>
          <IonButtons slot="secondary">
            <IonButton
              onClick={async () => {
                setIsManualRefetching(true);
                try {
                  await Promise.all([
                    appointmentQuery.refetch(),
                    serviceRequestQuery.refetch(),
                    medicalRecordQuery.refetch(),
                  ]);
                } finally {
                  setIsManualRefetching(false);
                }
              }}
              disabled={isLoading || isManualRefetching}
            >
              <IonIcon slot="icon-only" icon={reload} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent scrollY={false} id="appointment-detail-content">
        <div className="bg-blue-100 flex flex-col h-full">
          {isLoading ? (
            <ContentSpinnerOverlay />
          ) : appointmentQuery.isError || !appointment ? (
            <div className="flex justify-center items-center py-8 italic text-red-500">
              Error loading appointment details.
            </div>
          ) : (
            <div className="relative flex flex-col h-full">
              <IonSegment
                value={segment}
                onIonChange={(e) => {
                  const newSegment = e.detail.value?.toString() ?? "info";
                  setSegment(newSegment);
                }}
                className="bg-neutral-100 shrink-0 shadow-lg"
              >
                <IonSegmentButton value="info">
                  <IonLabel className="normal-case text-base">Info</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="cycles">
                  <IonLabel className="normal-case text-base">Cycles</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="services">
                  <IonLabel className="normal-case text-base">Services</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="med-record">
                  <IonLabel className="normal-case text-base">Record</IonLabel>
                </IonSegmentButton>
              </IonSegment>

              <div className="py-4 flex-1 min-h-0 overflow-y-auto">
                {segment === "info" ? (
                  <AppointmentDetailInfo appointment={appointment} />
                ) : segment === "cycles" ? (
                  <AppointmentDetailCycles
                    treatmentCycle={appointment.treatmentCycle}
                  />
                ) : segment === "services" ? (
                  <AppointmentDetailServiceReq
                    serviceRequestQuery={serviceRequestQuery}
                  />
                ) : segment === "med-record" ? (
                  <AppointmentDetailMedicalRecord
                    medicalRecordQuery={medicalRecordQuery}
                  />
                ) : null}
              </div>

              {isManualRefetching && <ContentSpinnerOverlay />}
            </div>
          )}
        </div>
      </IonContent>

      {showPayNowFooter && appointment && (
        <IonFooter>
          <IonToolbar className="ion-px-[0.5rem]">
            <IonButton
            disabled={isLoading}
              onClick={() =>
                router.push(
                  `${ROUTES.PAYMENT_PORTAL}?relatedEntityType=Appointment&relatedEntityId=${appointment.id}`,
                  "forward"
                )
              }
              fill="solid"
              className="w-full"
            >
              Pay now
            </IonButton>
          </IonToolbar>
        </IonFooter>
      )}
    </IonPage>
  );
}
