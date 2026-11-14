type VideoThumbnailProps = {
  src: string;
  className?: string;
};

export function VideoThumbnail({ src, className }: VideoThumbnailProps) {
  return (
    <video
      src={src}
      muted
      playsInline
      preload="metadata"
      tabIndex={-1}
      aria-hidden="true"
      onLoadedMetadata={(event) => {
        const video = event.currentTarget;
        if (Number.isFinite(video.duration) && video.duration > 0) {
          video.currentTime = Math.min(0.1, video.duration / 2);
        }
      }}
      className={className}
    />
  );
}
