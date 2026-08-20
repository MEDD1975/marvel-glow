import type { ResourceLink } from "@/lib/condition-resources";

export type DoctorVideo = ResourceLink & {
  id: string;
  conditionId: string;
  active: boolean;
};

const configuredVideos = new Map<string, DoctorVideo[]>();

export function getDoctorVideos(cabinetId: string, conditionId?: string) {
  const videos = configuredVideos.get(cabinetId) ?? [];
  return videos.filter((video) => video.active && (!conditionId || video.conditionId === conditionId));
}

export function getAllDoctorVideos(cabinetId: string) {
  return configuredVideos.get(cabinetId) ?? [];
}

export function saveDoctorVideo(cabinetId: string, video: DoctorVideo) {
  const videos = configuredVideos.get(cabinetId) ?? [];
  configuredVideos.set(cabinetId, [...videos.filter((item) => item.id !== video.id), video]);
}

export function removeDoctorVideo(cabinetId: string, videoId: string) {
  configuredVideos.set(cabinetId, (configuredVideos.get(cabinetId) ?? []).filter((video) => video.id !== videoId));
}
