import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

const CommentComponent = forwardRef(({ data, model }, ref) => {
  const [hasFocus, setHasFocus] = useState(false);

  useEffect(() => {
    const cleanup = data.on("focusChange", ()=>{
      setHasFocus(data.hasFocus());
    });
    const cleanupTakeBrowserFocus = data.on("takeBrowserFocus", () => {
      ref.current?.focus();
    });
    return ()=>{
      cleanup();
      cleanupTakeBrowserFocus();
    };
  }, [data]);

  return <div
      ref={ref}

      onMouseDown={(event) => {
        event.preventDefault();

        // display focus / logical editor focus
        model.setFocusedNode(data);

        // browser focus / keyboard focus
        ref.current?.focus();
      }}
      onKeyDown={(event) => {
        data.onKeyDown?.(event);
      }}
           
      style={{
        minHeight: 20,
        minWidth: 20,
        padding: '2px 6px',

        backgroundColor: hasFocus ? 'lightblue' : '#ddd',
      }}
    >
    {data.text}
    </div>;
  
});


const comment = {
  create: (data, model) => {
    let ret = {
      type: "comment",
      id: data.id,
      text: data.text,
      render: () => {
        return React.createElement(CommentComponent, {
          key: ret.id,
          data: ret,
          model: model,
        });
      }
    };
    return ret;
  }
};



export default comment;


