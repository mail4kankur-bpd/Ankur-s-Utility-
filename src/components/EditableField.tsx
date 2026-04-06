import React, { useRef, useEffect, useState } from 'react';
import { Text, Rect, Image as KonvaImage, Transformer, Group } from 'react-konva';
import { Field, useIdStore } from '../store/useIdStore';
import useImage from 'use-image';
import QRCode from 'qrcode';

interface EditableFieldProps {
  data: Field;
  isSelected: boolean;
}

export const EditableField = ({ data, isSelected }: EditableFieldProps) => {
  const { setSelectedId, updateField } = useIdStore();
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [qrImage] = useImage(qrUrl);

  useEffect(() => {
    if (data.type === 'qr') {
      QRCode.toDataURL('QR Placeholder', { margin: 1 })
        .then(url => setQrUrl(url))
        .catch(err => console.error(err));
    }
  }, [data.type]);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    updateField(data.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
    });
  };

  return (
    <>
      <Group
        draggable
        x={data.x}
        y={data.y}
        onClick={() => setSelectedId(data.id)}
        onTap={() => setSelectedId(data.id)}
        onDragEnd={(e) => {
          updateField(data.id, {
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        ref={shapeRef}
      >
        {data.type === 'text' ? (
          <Text
            text={data.name}
            width={data.width}
            height={data.height}
            fontSize={data.fontSize}
            fontFamily={data.fontFamily}
            fill={data.fill}
            fontStyle={data.fontWeight === 'bold' || data.fontWeight === '600' ? 'bold' : 'normal'}
            align={data.align}
            verticalAlign="middle"
            wrap={data.wrap === 'none' ? 'none' : data.wrap}
          />
        ) : data.type === 'image' ? (
          <Group>
            <Rect
              width={data.width}
              height={data.height}
              fill="#f4f4f5"
              stroke={data.strokeWidth && data.strokeWidth > 0 ? data.stroke : "#e4e4e7"}
              strokeWidth={data.strokeWidth || 1}
              cornerRadius={data.cornerRadius || 0}
            />
            <Text
              text={`PHOTO: ${data.name}`}
              width={data.width}
              height={data.height}
              fontSize={10}
              align="center"
              verticalAlign="middle"
              fill="#71717a"
            />
          </Group>
        ) : (
          <Group>
            {qrImage ? (
              <KonvaImage
                image={qrImage}
                width={data.width}
                height={data.height}
              />
            ) : (
              <Rect
                width={data.width}
                height={data.height}
                fill="#f4f4f5"
                stroke="#e4e4e7"
                strokeWidth={1}
              />
            )}
            <Text
              text="QR CODE"
              width={data.width}
              height={data.height}
              fontSize={10}
              align="center"
              verticalAlign="bottom"
              padding={5}
              fill="#71717a"
            />
          </Group>
        )}
        {isSelected && (
            <Rect
                width={data.width}
                height={data.height}
                stroke="#dc2626"
                strokeWidth={1}
                dash={[4, 4]}
            />
        )}
      </Group>
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
          onTransformEnd={handleTransformEnd}
          anchorSize={10}
          anchorCornerRadius={3}
          anchorStroke="#ef4444"
          anchorFill="#ffffff"
          borderStroke="#ef4444"
          rotateEnabled={false}
        />
      )}
    </>
  );
};
