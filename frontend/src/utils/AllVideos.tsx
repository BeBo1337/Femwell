import { VideoModel } from "../models/video.model";

const videos: VideoModel[] = [
  {
    id: "1",
    title: "What is an Abortion?",
    thumbnail: "/tree.jpg",
    link: "https://femwell-videos.s3.amazonaws.com/WhatIsAnAbortion.mp4",
    recommended: true,
  },
  {
    id: "2",
    title: "Womb Health during Miscarriage",
    link: "https://femwell-videos.s3.amazonaws.com/MiscarriageWombHealth.mp4",
    thumbnail: "/purpleSea.jpg",
    recommended: true,
  },
  {
    id: "3",
    title: "Abortion by Curettage or by Pills",
    link: "https://femwell-videos.s3.amazonaws.com/AbortionByPills.mp4",
    thumbnail: "/sunset.jpg",
    recommended: true,
  },
];

export default videos;
