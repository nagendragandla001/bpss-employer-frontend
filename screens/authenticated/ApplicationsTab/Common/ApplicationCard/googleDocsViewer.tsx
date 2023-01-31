import React, { useEffect, useRef, useState } from 'react';
import Spin from 'antd/lib/spin';
import Loading3QuartersOutlined from '@ant-design/icons/Loading3QuartersOutlined';

type IframeGoogleDocsProps = {
  url: string,
};
export default function IframeGoogleDoc({ url }: IframeGoogleDocsProps) : JSX.Element {
  const [iframeTimeoutId, setIframeTimeoutId] = useState<NodeJS.Timeout| undefined>(undefined);
  const [showSpinner, setShowSpinner] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  function getIframeLink(): string {
    return `https://docs.google.com/viewer?url=${url}&embedded=true`;
  }

  function updateIframeSrc(): void {
    if (iframeRef && iframeRef.current) {
      iframeRef.current.src = getIframeLink();
    }
  }

  useEffect(() => {
    const intervalId = setInterval(
      updateIframeSrc, 1000 * 3,
    );
    setIframeTimeoutId(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function iframeLoaded(): void {
    if (iframeTimeoutId) {
      clearInterval(iframeTimeoutId);
    }
    setShowSpinner(false);
  }

  return (
    <>
      {showSpinner ? <Spin className="viewCV-loader" indicator={<Loading3QuartersOutlined style={{ fontSize: '3rem' }} spin />} /> : null}
      <iframe
        title="pdf viwer"
        onLoad={iframeLoaded}
        onError={updateIframeSrc}
        ref={iframeRef}
        src={getIframeLink()}
        width="100%"
        height="100%"
        style={{ border: 'none' }}
      />
    </>
  );
}
