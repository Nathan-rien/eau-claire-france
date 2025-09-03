import React from 'react';
import { usePrices } from "@/hooks/usePrices";

const Probe = () => {
  const { tap, bottle } = usePrices();
  return <pre>{JSON.stringify({ tap, bottle }, null, 2)}</pre>;
};

export default Probe;