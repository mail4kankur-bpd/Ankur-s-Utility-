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
  const [placeholderImage] = useImage('https://picsum.photos/seed/user/200/200');

  useEffect(() => {
    if (data.type === 'qr') {
      QRCode.toDataURL('QR Placeholder', { margin: 1 })
        .then(url => setQrUrl(url))
        .catch(err => console.error(err));
    }
  }, [data.type]);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, data]); // Re-sync if data changes to keep transformer aligned

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale to 1 and update width/height instead
    node.scaleX(1);
    node.scaleY(1);

    updateField(data.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, data.width * scaleX),
      height: Math.max(5, data.height * scaleY),
    });
  };

  return (
    <>
      <Group
        draggable
        x={data.x}
        y={data.y}
        onClick={(e) => {
          e.cancelBubble = true;
          setSelectedId(data.id);
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          setSelectedId(data.id);
        }}
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
            {placeholderImage ? (
              <KonvaImage
                image={placeholderImage}
                width={data.width}
                height={data.height}
                opacity={0.3}
                cornerRadius={data.cornerRadius || 0}
              />
            ) : null}
            <Text
              text={`PHOTO: ${data.name}`}
              width={data.width}
              height={data.height}
              fontSize={10}
              align="center"
              verticalAlign="middle"
              fill="#71717a"
              fontStyle="bold"
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
              fontStyle="bold"
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
            // limit minimum size
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
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
          flipEnabled={false}
          enabledAnchors={[
            'top-left', 'top-center', 'top-right',
            'middle-right', 'middle-left',
            'bottom-left', 'bottom-center', 'bottom-right'
          ]}
        />
      )}
    </>
  );
};
