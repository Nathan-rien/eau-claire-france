import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { BottleWaterData } from '@/data/bottleComparisonData';

interface BottleRowProps {
  label: string;
  icon?: React.ReactNode;
  className?: string;
  tapWaterValue?: React.ReactNode;
  bottles: BottleWaterData[];
  renderValue: (bottle: BottleWaterData, index: number) => React.ReactNode;
  showTapWater: boolean;
}

const BottleRow: React.FC<BottleRowProps> = ({
  label,
  icon,
  className = '',
  tapWaterValue,
  bottles,
  renderValue,
  showTapWater
}) => {
  return (
    <TableRow className={className}>
      <TableCell className="font-medium">
        <div className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {label}
        </div>
      </TableCell>
      {showTapWater && (
        <TableCell className="text-center bg-blue-50">
          {tapWaterValue}
        </TableCell>
      )}
      {bottles.map((bottle, index) => (
        <TableCell key={bottle.id} className="text-center">
          {renderValue(bottle, index)}
        </TableCell>
      ))}
    </TableRow>
  );
};

export default BottleRow;