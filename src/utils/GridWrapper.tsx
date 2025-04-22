import React from 'react';
import { Grid, GridProps } from '@mui/material';

/**
 * Wrapper component for Material-UI Grid to fix compatibility issues with MUI v7.
 * This component converts the old Grid API props (xs, sm, md, etc.) to the new size prop format.
 */

// Extended interface to include the legacy props
interface ExtendedGridProps extends Omit<GridProps, 'size'> {
  item?: boolean;
  xs?: boolean | number;
  sm?: boolean | number;
  md?: boolean | number;
  lg?: boolean | number;
  xl?: boolean | number;
  size?: Record<string, boolean | number>;
}

const GridWrapper: React.FC<ExtendedGridProps> = (props) => {
  // Create a new props object to avoid mutating the original
  const { xs, sm, md, lg, xl, item, size: existingSize, ...otherProps } = props;
  
  // Build the size prop from the breakpoint props if they exist
  let size: Record<string, boolean | number> = existingSize || {};
  
  if (xs !== undefined) {
    size = { ...size, xs };
  }
  
  if (sm !== undefined) {
    size = { ...size, sm };
  }
  
  if (md !== undefined) {
    size = { ...size, md };
  }
  
  if (lg !== undefined) {
    size = { ...size, lg };
  }
  
  if (xl !== undefined) {
    size = { ...size, xl };
  }
  
  // The 'item' prop is no longer needed in MUI v7 as all Grid components are items by default
  
  return <Grid size={Object.keys(size).length > 0 ? size : undefined} {...otherProps} />;
};

export default GridWrapper;