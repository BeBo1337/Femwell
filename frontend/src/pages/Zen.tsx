import {
  Box,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Text,
  Tabs,
  useMediaQuery,
  Skeleton,
  useColorModeValue,
} from "@chakra-ui/react";
import { FC, useEffect, useState } from "react";
import videos from "../utils/AllVideos";
import { VideoModel } from "../models/video.model";
import Video from "../components/Video";
// import useAuthStore from "../store/authStore";

const Zen: FC<{}> = () => {
  const [isLargerThan600] = useMediaQuery("(min-width: 600px)");
  const [isLargerThan650] = useMediaQuery("(min-width: 650px)");
  const [isLargerThan930] = useMediaQuery("(min-width: 930px)");
  const [isLargerThan1140] = useMediaQuery("(min-width: 1140px)");

  const allVids: VideoModel[] = videos;

  const [tabChangeCounter, setTabChangeCounter] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);
  // const authUser = useAuthStore((state) => state.user);
  const panelBackgoundColor = useColorModeValue("white", "#533142");
  // const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {}, []);

  const handleSetTabIndex = (newIndex: number) => {
    setTabIndex(newIndex);
    setTabChangeCounter((prevCounter) => prevCounter + 1); // Increment counter
  };

  return (
    <div className="page">
      <Box
        p={isLargerThan600 ? 5 : 3}
        maxWidth={isLargerThan930 ? "1140px" : "100%"}
        mx="auto"
      >
        <Skeleton fadeDuration={1} isLoaded={true}>
          <Tabs
            orientation={"vertical"}
            ml={isLargerThan930 ? 20 : isLargerThan650 ? 6 : ""}
            mr={isLargerThan930 ? 20 : isLargerThan650 ? 6 : ""}
            width={isLargerThan600 ? "" : "100%"}
            colorScheme="pink"
            index={tabIndex}
            onChange={(index) => {
              handleSetTabIndex(index);
            }}
          >
            <TabPanels
              hidden={!isLargerThan600}
              mr={5}
              bgColor={panelBackgoundColor}
              borderRadius={5}
              height={"fit-content"}
              maxW={isLargerThan1140 ? "70vw" : ""}
            >
              {allVids.map((video) => (
                <TabPanel
                  pb={3}
                  pt={3}
                  key={video.id}
                  justifyContent={"flex-start"}
                  px={2}
                >
                  <Video video={video} indexChange={tabChangeCounter} />
                </TabPanel>
              ))}
            </TabPanels>
            <TabList
              justifyContent={"start"}
              bgGradient={`linear(to-b, ${panelBackgoundColor} 0%, var(--primary-color) 80%)`}
              borderRadius={5}
              whiteSpace={"nowrap"}
              minWidth={isLargerThan600 ? "200px" : "100%"}
              minHeight={isLargerThan600 ? "85vh" : "100vh"}
              //minHeight={isLargerThan520 ? "fit-content" : "100vh"}
              style={{ border: "none" }}
            >
              {isLargerThan600 &&
                allVids.map((video, index) => (
                  <Tab py={4} key={video.id} justifyContent={"center"} px={2}>
                    <Text
                      fontStyle={"italic"}
                      fontWeight={tabIndex === index ? "bold" : "300"}
                      whiteSpace={"normal"}
                    >
                      {video.title}
                    </Text>
                  </Tab>
                ))}

              {!isLargerThan600 &&
                allVids.map((video) => (
                  <Tab
                    py={4}
                    key={video.id}
                    justifyContent={"center"}
                    px={2}
                    _active={{ bg: "" }}
                    style={{
                      borderLeft: "none",
                      borderBottom: "5px dashed black",
                    }}
                    cursor={"default"}
                    color={""}
                  >
                    <Video video={video} indexChange={tabChangeCounter} />
                  </Tab>
                ))}
            </TabList>
          </Tabs>
        </Skeleton>
      </Box>

      <svg
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        className="svg"
      >
        <path d="M0,96L48,80C96,64,192,32,288,48C384,64,480,128,576,181.3C672,235,768,277,864,261.3C960,245,1056,171,1152,149.3C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>
    </div>
  );
};

export default Zen;
