const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dpknc20k0';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'gco_store_unsigned';

export async function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.secure_url);
      } else {
        reject(new Error('Échec du téléchargement de l\'image'));
      }
    };

    xhr.onerror = () => reject(new Error('Erreur réseau'));
    xhr.send(formData);
  });
}

export function extractPublicId(secureUrl: string): string {
  // Format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{public_id}.{ext}
  const match = secureUrl.match(/\/v\d+\/(.+)\.\w+$/);
  return match ? match[1] : '';
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ooazjrakaovmaqobadga.supabase.co';
  
  const response = await fetch(
    `${supabaseUrl}/functions/v1/delete-cloudinary-image`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_id: publicId }),
    }
  );

  if (!response.ok) {
    console.warn('Cloudinary delete failed, image may remain in cloud storage');
  }
}
