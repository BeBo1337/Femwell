import React, { FC, useEffect, useState } from "react";
import { Box, Flex, useMediaQuery, Text, AspectRatio } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCirclePlay } from "@fortawesome/free-solid-svg-icons";
import { VideoModel } from "../models/video.model";

interface VideoProps {
  video: VideoModel;
  link?: string;
  indexChange: number;
}

const MotionButton = motion(Box);

const Video: FC<VideoProps> = ({ video, link, indexChange }) => {
  const [isLargerThan330] = useMediaQuery("(min-width: 330px)");
  const [isLargerThan600] = useMediaQuery("(min-width: 600px)");
  const [isLargerThan930] = useMediaQuery("(min-width: 930px)");
  const [isLargerThan1140] = useMediaQuery("(min-width: 1140px)");
  const [isLargerThan1000] = useMediaQuery("(min-width: 1000px)");
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);

  useEffect(() => {
    setIsVideoVisible(false);
  }, [indexChange]);

  const handleVideoClick = () => {
    setIsVideoVisible(true);
  };

  return (
    <Flex
      direction={"column"}
      justifyContent={"flex-start"}
      width={isLargerThan600 ? "" : "90%"}
    >
      {/* <Flex
        border="1px solid black"
        p={2}
        m={"8px"}
        bgImage={`url(${video.thumbnail})`}
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        borderRadius="10px"
        minH={isLargerThan1140 ? "40vh" : isLargerThan600 ? "300px" : "250px"}
        maxW={isLargerThan1000 ? "70vw" : ""}
        minW={isLargerThan600 ? "" : isLargerThan330 ? "75vw" : "245px"}
        alignItems={"center"}
        position="relative"
        _hover={{ cursor: "pointer" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleVideoClick}
      >
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        >
          <FontAwesomeIcon
            icon={faCirclePlay}
            size="3x"
            color={isHovered ? "var(--light-color)" : "var(--secondary-color)"}
          />
        </Box>
      </Flex>
      {isVideoVisible && ( // Step 4
        <video width="100%" controls>
          <source
            src={"https://femwell-videos.s3.amazonaws.com/WhatIsAnAbortion.mp4"}
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      )} */}
      <AspectRatio
        border="3px solid black"
        p={2}
        m={"8px"}
        bgImage={`url(${video.thumbnail})`}
        bgSize="cover"
        borderRadius="10px"
        minH={isLargerThan1140 ? "40vh" : isLargerThan600 ? "300px" : "250px"}
        maxW={isLargerThan1000 ? "70vw" : ""}
        minW={isLargerThan600 ? "" : isLargerThan330 ? "75vw" : "245px"}
        ratio={16 / 9}
        onClick={handleVideoClick}
        _hover={{ cursor: "pointer" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        position="relative"
      >
        <>
          {!isVideoVisible && (
            <>
              <Box
                position="absolute"
                top="0"
                right="0"
                bottom="0"
                left="0"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <FontAwesomeIcon
                  icon={faCirclePlay}
                  size="3x"
                  color={
                    isHovered ? "var(--light-color)" : "var(--secondary-color)"
                  }
                />
              </Box>
            </>
          )}
          {isVideoVisible && (
            <>
              <iframe
                title={video.title}
                src={
                  "https://femwell-videos.s3.amazonaws.com/WhatIsAnAbortion.mp4"
                }
                allowFullScreen
                allow="autoplay"
              />
            </>
          )}
        </>
      </AspectRatio>
      <Flex justifyContent={"flex-start"} width="100%" pl={2}>
        <Text
          fontSize={isLargerThan1140 ? 28 : isLargerThan930 ? "2xl" : "xl"}
          fontWeight={600}
          style={{ whiteSpace: "normal" }}
        >
          Introduction - {video.title}
        </Text>
      </Flex>
    </Flex>
  );
};

export default Video;
