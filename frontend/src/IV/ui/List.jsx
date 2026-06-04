import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

const List = forwardRef(({ data, model }, ref) => {

  const currentFocus = useState();

  useEffect(() => {
  }, []);


  return <div
    ref={wrapperRef}
    style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
    }}
    >
    {/*data.map((node)=>{
      return node.render();
    })*/}
    </div>;
  
});

export default List;


