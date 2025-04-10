// components/InfolinksScript.tsx
"use client";

import Script from "next/script";

export default function InfolinksScript() {
  return (
    <>
      <Script id="infolinks-init" strategy="afterInteractive">
        {`
          var infolinks_pid = 3435026;
          var infolinks_wsid = 0;
        `}
      </Script>
      <Script
        src="http://resources.infolinks.com/js/infolinks_main.js"
        strategy="afterInteractive"
      />
    </>
  );
}
