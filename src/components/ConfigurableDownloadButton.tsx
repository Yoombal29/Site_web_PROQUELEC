import { useState } from 'react';
import { useDownloadUrl } from '../hooks/useDownloadUrl';
import {
  FileText, Download, Shield, Zap, BookOpen,
  File, FileArchive, Video, Loader2 } from
'lucide-react';

export interface DownloadButtonConfig {
  id: string;
  title: string;
  bucket: string;
  path: string;
  icon?: string;
  color?: string;
  visible?: boolean;
}

const ICON_MAP: Record<string, unknown> = {
  'download': Download,
  'file': File,
  'file-text': FileText,
  'shield': Shield,
  'zap': Zap,
  'book': BookOpen,
  'archive': FileArchive,
  'video': Video
};

export function ConfigurableDownloadButton({ buttonConfig }: {buttonConfig: DownloadButtonConfig;}) {
  const { loading, getUrl } = useDownloadUrl(
    buttonConfig.bucket,
    buttonConfig.path,
    600 // 10 min
  );
  const [downloading, setDownloading] = useState(false);

  if (buttonConfig.visible === false) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const signedUrl = await getUrl();
      if (signedUrl) window.open(signedUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const IconComponent = buttonConfig.icon ? ICON_MAP[buttonConfig.icon] : null;

  return (
    <button
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
      style={{ backgroundColor: buttonConfig.color || '#2376df' }}
      onClick={handleDownload}
      disabled={loading || downloading} aria-label="Action">
      
      {loading || downloading ?
      <Loader2 className="w-5 h-5 animate-spin" /> :
      IconComponent ?
      <IconComponent className="w-5 h-5" /> :

      <Download className="w-5 h-5" />
      }
      <span>{buttonConfig.title}</span>
    </button>);

}