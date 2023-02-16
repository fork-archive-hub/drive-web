import { Document, Page } from 'react-pdf';
import { useState, Fragment, useRef, useEffect } from 'react';
import { FormatFileViewerProps } from '../../FileViewer';
import { MagnifyingGlassMinus, MagnifyingGlassPlus } from 'phosphor-react';
import { useTranslationContext } from 'app/i18n/provider/TranslationProvider';
import { CaretLeft, CaretRight } from 'phosphor-react';

interface PageWithObserverProps {
  pageNumber: number;
  onPageVisible: (page: number) => void;
  loading: string;
  zoom: number;
}

const observerConfig = {
  // How much of the page needs to be visible to consider page visible
  threshold: 0.5,
};

const zoomRange = [0.85, 1, 1.5, 2, 3];

const PageWithObserver: React.FC<PageWithObserverProps> = ({ pageNumber, zoom, onPageVisible, ...otherProps }) => {
  const [observerReady, setObserverReady] = useState(false);

  useEffect(() => {
    // If the zoom changes, we need to re-observe the page
    setObserverReady(false);
  }, [zoom]);

  const prepareObserver = (entry: Element) => {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        onPageVisible(pageNumber);
      }
    }, observerConfig);

    observer.observe(entry);
  };

  return (
    <Page
      canvasRef={(entry: Element) => {
        if (entry && !observerReady) {
          prepareObserver(entry);
          setObserverReady(true);
        }
      }}
      pageNumber={pageNumber}
      height={window.innerHeight * zoomRange[zoom]}
      {...otherProps}
    />
  );
};
const DEFAULT_ZOOM = 1;

const FilePdfViewer = (props: FormatFileViewerProps): JSX.Element => {
  const { translate } = useTranslationContext();
  const [fileUrl, setFileUrl] = useRef(useState(URL.createObjectURL(props.blob))).current;
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const isFirstPage = pageNumber === 1;
  const isLastPage = pageNumber === numPages;
  const [zoom, setZoom] = useState(0);
  const zoomRange = [0.85, 1, 1.5, 2, 3];

  //useEffect to avoid flickering
  useEffect(() => {
    setFileUrl(URL.createObjectURL(props.blob));
  }, [props.blob]);

  function nextPage() {
    setPageNumber(pageNumber + 1);
    resetZoom();
  }

  function previousPage() {
    setPageNumber(pageNumber - 1);
    resetZoom();
  }

  function increaseZoom() {
    if (zoom < zoomRange.length - 1) {
      setZoom(zoom + 1);
    }
  }

  function decreaseZoom() {
    if (zoom > 0) {
      setZoom(zoom - 1);
    }
  }

  function resetZoom() {
    setZoom(0);
  }

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <div className="flex max-h-full w-full items-center justify-center pt-16">
      <Fragment>
        <div>
          <div className="flex w-screen flex-row items-center justify-between px-10">
            <button className="rounded-full bg-black p-4 text-white" onClick={() => props.getFile(-1)}>
              <CaretLeft size={24} />
            </button>

            <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
              <div className="flex flex-col items-center space-y-3">
                {Array.from(new Array(numPages), (el, index) => (
                  <PageWithObserver
                    loading=""
                    onPageVisible={setCurrentPage}
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    zoom={zoom}
                  />
                ))}
              </div>
            </Document>
            <button className="text-white" onClick={() => props.getFile(1)}>
              <CaretRight size={24} />
            </button>
          </div>

          {/* Preview controls */}
          <div
            className="fixed bottom-6 left-1/2 z-10 flex h-12 -translate-x-1/2 transform select-none
                            flex-row items-center overflow-hidden rounded-xl px-1.5 text-lg
                            font-medium shadow-xl"
          >
            <div
              className="absolute inset-0 h-full w-full backdrop-blur-xl backdrop-contrast-50
                              backdrop-filter"
            />
            <div className="absolute inset-0 h-full w-full bg-cool-gray-100 bg-opacity-80" />

            <div className="z-10 flex flex-row items-center justify-center space-x-1.5">
              <div className="flex flex-row items-center justify-center">
                <span className="z-10 px-2 font-medium">
                  {translate('drive.pdfPage', {
                    page: currentPage,
                    pages: numPages,
                  })}
                </span>
              </div>

              <div className="h-8 w-px bg-white bg-opacity-10" />

              <div className="flex flex-row items-center justify-center">
                <button
                  onClick={decreaseZoom}
                  disabled={zoom === 0}
                  className="flex h-9 w-9 cursor-pointer flex-row items-center justify-center rounded-lg
                                bg-white bg-opacity-0 transition duration-50 ease-in-out
                                hover:bg-opacity-10 active:bg-opacity-5 disabled:pointer-events-none disabled:opacity-30"
                >
                  <MagnifyingGlassMinus height="24" width="24" className="pointer-events-none" />
                </button>
                <span>{zoomRange[zoom] * 100}%</span>
                <button
                  onClick={increaseZoom}
                  disabled={zoom === zoomRange.length - 1}
                  className="flex h-9 w-9 cursor-pointer flex-row items-center justify-center rounded-lg
                                bg-white bg-opacity-0 transition duration-50 ease-in-out
                                hover:bg-opacity-10 active:bg-opacity-5 disabled:pointer-events-none disabled:opacity-30"
                >
                  <MagnifyingGlassPlus height="24" width="24" className="pointer-events-none" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    </div>
  );
};

export default FilePdfViewer;
