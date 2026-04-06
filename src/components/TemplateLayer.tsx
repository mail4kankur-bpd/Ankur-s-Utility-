import React, { useEffect, useRef } from 'react';
import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';

export const TemplateLayer = ({ url }: { url: string }) => {
  const [image] = useImage(url);
  return <KonvaImage image={image} />;
};
