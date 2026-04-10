import React from 'react';
import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { useIdStore } from '../store/useIdStore';

export const TemplateLayer = ({ url }: { url: string }) => {
  const [image] = useImage(url);
  const { canvasSize } = useIdStore();

  if (!image) return null;

  let width = image.width;
  let height = image.height;

  // Shrink to fit if it exceeds canvas dimensions
  if (width > canvasSize.width || height > canvasSize.height) {
    const ratio = Math.min(canvasSize.width / width, canvasSize.height / height);
    width = width * ratio;
    height = height * ratio;
  }

  // Center it
  const x = (canvasSize.width - width) / 2;
  const y = (canvasSize.height - height) / 2;

  return <KonvaImage image={image} width={width} height={height} x={x} y={y} />;
};
