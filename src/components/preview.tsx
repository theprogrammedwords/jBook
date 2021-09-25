import { useRef, useEffect } from 'react';

interface PreviewProps {
  code: string;
}
const Preview: React.FC<PreviewProps> = ({ code }) => {
  const iframe = useRef<any>();
  useEffect(() => {
    iframe.current.srcDoc = html;
    iframe.current.contentWindow.postMessage(code, '*');
  }, [code]);

  return (
    <iframe
      title="preview"
      ref={iframe}
      srcDoc={html}
      sandbox="allow-scripts"
    />
  );
};

const html = `
<html>
  <head></head>
  <body>
    <div id="root"></div>
    <script>

    window.addEventListener('message', (event) => {

      try {
        eval(event.data)
      }
      catch(err){
        const root = document.querySelector('#root')
        root.innerHTML ='<div style="color: red;"><h4>Runtime Error : </h4>' + err + '</div>'
        console.err(err);
      }
    }, false)
    </script>
  </body>
</html>
`;
export default Preview;
