"use client";

import dynamic from "next/dynamic";

const StudentPage = dynamic(() => import("./_student-page-client"), {
  ssr: false,
});

export default function Page() {
  return <StudentPage />;
}
