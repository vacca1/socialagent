import type { Metadata } from "next";
import { ControlTowerPage } from "@/components/agency/control-tower-page";

export const metadata: Metadata = { title: "Control Tower — Agency Ops" };

export default function ControlTower() {
  return <ControlTowerPage />;
}
