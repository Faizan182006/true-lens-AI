/**
 * Lightweight EXIF and file metadata scanner
 * Inspects binary headers for camera tags, software signatures (e.g. Midjourney, Adobe, Stable Diffusion),
 * and basic image properties.
 */
export async function extractMediaMetadata(file: File): Promise<Record<string, string>> {
  const metadata: Record<string, string> = {
    'File Name': file.name,
    'File Size': `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    'MIME Type': file.type || 'unknown',
    'Last Modified': new Date(file.lastModified).toLocaleDateString(),
  };

  if (!file.type.startsWith('image/')) {
    return metadata;
  }

  try {
    const buffer = await file.slice(0, 128 * 1024).arrayBuffer();
    const view = new DataView(buffer);

    // Check JPEG signature 0xFFD8
    if (view.getUint16(0) === 0xffd8) {
      metadata['Format'] = 'JPEG / JFIF';
      scanJpegExif(view, metadata);
    } else if (
      view.getUint32(0) === 0x89504e47 &&
      view.getUint32(4) === 0x0d0a1a0a
    ) {
      metadata['Format'] = 'PNG';
      scanPngChunks(view, metadata);
    } else if (file.type.includes('webp')) {
      metadata['Format'] = 'WebP';
    }
  } catch (e) {
    // Non-fatal, metadata extraction is purely assistive
  }

  return metadata;
}

function scanJpegExif(view: DataView, metadata: Record<string, string>) {
  let offset = 2;
  const length = view.byteLength;

  while (offset < length - 4) {
    const marker = view.getUint16(offset);
    offset += 2;

    if (marker === 0xffe1) {
      // APP1 Marker (EXIF)
      const app1Length = view.getUint16(offset);
      const header = String.fromCharCode(
        view.getUint8(offset + 2),
        view.getUint8(offset + 3),
        view.getUint8(offset + 4),
        view.getUint8(offset + 5)
      );

      if (header === 'Exif') {
        metadata['EXIF Presence'] = 'Present in file headers';
        // Extract plain strings that commonly indicate generation software or camera hardware
        const textSlice = new TextDecoder('utf-8', { fatal: false }).decode(
          new Uint8Array(view.buffer, offset, Math.min(app1Length, 2048))
        );

        if (/midjourney/i.test(textSlice)) {
          metadata['Software Hint'] = 'Midjourney tag detected';
        } else if (/stable\s*diffusion/i.test(textSlice)) {
          metadata['Software Hint'] = 'Stable Diffusion parameter tag detected';
        } else if (/dall[- ]?e/i.test(textSlice)) {
          metadata['Software Hint'] = 'DALL-E generation signature';
        } else if (/photoshop/i.test(textSlice)) {
          metadata['Software Hint'] = 'Adobe Photoshop editing signature';
        }
      }
      break;
    } else if (marker === 0xffe0) {
      // APP0 Marker
      const app0Length = view.getUint16(offset);
      offset += app0Length;
    } else if ((marker & 0xff00) === 0xff00) {
      const segLength = view.getUint16(offset);
      offset += segLength;
    } else {
      break;
    }
  }

  if (!metadata['EXIF Presence']) {
    metadata['EXIF Presence'] = 'Stripped / Absent (typical in synthetic or web-downloaded images)';
  }
}

function scanPngChunks(view: DataView, metadata: Record<string, string>) {
  try {
    const text = new TextDecoder('utf-8', { fatal: false }).decode(
      new Uint8Array(view.buffer, 0, Math.min(view.byteLength, 16384))
    );

    if (/parameters/i.test(text) && /steps:/i.test(text)) {
      metadata['Generation Signature'] = 'Automatic1111 / ComfyUI metadata prompt chunk detected';
    } else if (/midjourney/i.test(text)) {
      metadata['Generation Signature'] = 'Midjourney metadata detected';
    } else {
      metadata['Metadata Chunks'] = 'Standard PNG chunks; no explicit camera EXIF';
    }
  } catch (e) {
    // Ignore
  }
}
