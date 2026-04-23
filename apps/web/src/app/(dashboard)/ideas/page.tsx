import type { Metadata } from "next";
import { IdeasPage } from "@/components/ideas/ideas-page";

export const metadata: Metadata = { title: "Ideias" };

export default function Ideas() {
  return <IdeasPage />;
}
