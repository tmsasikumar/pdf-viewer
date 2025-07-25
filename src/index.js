import * as ReactDOM from 'react-dom';
import * as React from 'react';
import './index.css';
import {
  PdfViewerComponent,
  Toolbar,
  Magnification,
  Navigation,
  LinkAnnotation,
  BookmarkView,
  ThumbnailView,
  Print,
  TextSelection,
  Annotation,
  TextSearch,
  FormFields,
  FormDesigner,
  PageOrganizer,
  Inject,
} from '@syncfusion/ej2-react-pdfviewer';

export function App() {
  const viewerRef = React.useRef(null);

  const [isTextExtracted, setIsTextExtracted] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const documentPath = window.location.origin + '/ej2-pdfviewer-lib/floormap.pdf';
  const resource = window.location.origin + '/ej2-pdfviewer-lib';

  const toolbarSettings = {
    showTooltip: true,
    toolbarItems: [
      'OpenOption',
      'PageNavigationTool',
      'MagnificationTool',
      'PanTool',
      'SelectionTool',
      'PrintOption',
      'UndoRedoTool',
      'AnnotationEditTool',
      'FormDesignerEditTool',
      'CommentTool',
      'SubmitForm',
      'DownloadOption',
    ],
  };

  const onExtractTextCompleted = () => {
    setIsTextExtracted(true);
  };

  // Perform zoom to specific term
  const navigateToMatch = (index, results) => {
    const viewer = viewerRef.current;
    const pageResult = results[index];
    if (!pageResult || !pageResult.bounds || pageResult.bounds.length === 0) return;

    const bound = pageResult.bounds[0];
    const pageNumber = pageResult.pageIndex + 1;
    const pagePoint = { x: bound.x, y: bound.y };

    if (viewer.currentPageNumber !== pageNumber) {
      viewer.navigation.goToPage(pageNumber);
    }

    const clientPoint = viewer.convertPagePointToClientPoint(pagePoint, pageNumber);
    const rectangle = new DOMRect(clientPoint.x, clientPoint.y, bound.width, bound.height);

    if (viewer.annotationCollection.length > 0) {
      viewer.annotationModule.deleteAnnotationById(
        viewer.annotationCollection[viewer.annotationCollection.length - 1].annotationId
      );
    }

    viewer.zoomToRect(rectangle);

    requestAnimationFrame(() => {
      viewer.annotation.addAnnotation('Highlight', {
        bounds: [
          {
            x: (bound.x * 96) / 72,
            y: (bound.y * 96) / 72,
            width: (bound.width * 96) / 72,
            height: (bound.height * 96) / 72,
          },
        ],
        color: 'red',
        pageNumber,
      });
    });
  };

  const handleSearch = async () => {
    const viewer = viewerRef.current;
    if (searchText.trim() && viewer?.textSearchModule) {
      try {
        const results = await viewer.textSearchModule.findText(searchText, false);
        if (!results || results.length === 0) {
          console.warn('No matches found.');
          return;
        }
        navigateToMatch(0, results);
      } catch (error) {
        console.error('Search failed:', error);
      }
    }
  };

  return (
    <div>
      <div className="control-section">
        <PdfViewerComponent
          ref={viewerRef}
          id="container"
          documentPath={documentPath}
          resourceUrl={resource}
          zoomMode="FitToPage"
          toolbarSettings={toolbarSettings}
          extractTextCompleted={onExtractTextCompleted}
          style={{ height: '640px' }}
        >
          <Inject
            services={[
              Magnification,
              Navigation,
              Annotation,
              LinkAnnotation,
              TextSelection,
              TextSearch,
            ]}
          />
        </PdfViewerComponent>
              <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Enter text to search"
            style={{ padding: '5px', width: '200px', marginRight: '10px' }}
          />
          <button
            id="search"
            className="e-btn e-primary"
            disabled={!isTextExtracted}
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('sample'));
root.render(<App />);
