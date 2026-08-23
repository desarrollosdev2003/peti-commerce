const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

export const isCloudinaryConfigured = Boolean(
  cloudName && !cloudName.includes('tu-cloud')
);

/**
 * Direct client-side unsigned upload to Cloudinary or base64 local fallback
 */
export async function uploadImageFile(file: File): Promise<{ url: string; name: string; size: string }> {
  const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

  // If Cloudinary preset is configured, upload to Cloudinary API
  if (isCloudinaryConfigured && uploadPreset) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Falló subida a Cloudinary');
      const data = await res.json();
      return {
        url: data.secure_url,
        name: file.name,
        size: sizeMB,
      };
    } catch (e) {
      console.warn('Error subiendo a Cloudinary, usando fallback local', e);
    }
  }

  // Local fallback: convert to base64 Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        url: reader.result as string,
        name: file.name,
        size: sizeMB,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
