import React from 'react';
import { usePrices } from "@/hooks/usePrices";

const PriceOverlayDebug = () => {
  const { tap, bottle } = usePrices();
  return (
    <div style={{position:"fixed",bottom:10,right:10,zIndex:9999,
      background:"rgba(0,0,0,.75)",color:"#fff",padding:"8px 10px",
      borderRadius:8,fontSize:12}}>
      <div><b>DEBUG PRIX</b></div>
      <div>tap: {tap.value}</div>
      <div>bottle: {bottle.value}</div>
      <div>src: {bottle.source}</div>
    </div>
  );
};

export default PriceOverlayDebug;