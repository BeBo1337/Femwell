import { Box, Button, Flex, useMediaQuery } from "@chakra-ui/react";
import {
  faBars,
  faQuoteLeft,
  faSeedling,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC } from "react";
import { motion } from "framer-motion";

interface ArticleProps {
  image: string;
  title: string;
  summary: string;
  isRecommended?: boolean;
  onClick: () => void;
}

const MotionButton = motion(Box);

const Article: FC<ArticleProps> = ({
  title,
  summary,
  image,
  isRecommended,
  onClick,
}) => {
  const [isLargerThan1400] = useMediaQuery("(min-width: 1400px)");
  const [isLargerThan1000] = useMediaQuery("(min-width: 1000px)");

  return (
    <Flex
      flexDirection="column"
      border="1px solid black"
      p={2}
      m={"8px"}
      bgImage={`url(${image})`}
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
      borderRadius="10px"
      minH={isLargerThan1400 ? "350px" : isLargerThan1000 ? "300px" : "300px"}
      maxW={isLargerThan1400 ? "350px" : isLargerThan1000 ? "300px" : "400px"}
      alignItems={"center"}
    >
      <Flex alignItems={"center"} justifyContent={"space-between"} w={"100%"}>
        <Flex justifyContent={"center"} w={"100%"}>
          <h1
            style={{
              fontSize: "1.2rem",
              fontFamily: "monospace",
              color: "black",
              fontWeight: "bold",
            }}
          >
            {title}
          </h1>
        </Flex>

        <FontAwesomeIcon
          className="drag-handle"
          size={"lg"}
          icon={faBars}
          style={{
            marginRight: "4px",
            color: "black",
            cursor: "grab",
          }}
        />
      </Flex>

      <Flex
        direction="column"
        bg="var(--tertiary-color-dim)"
        borderRadius="10px"
        p={1}
        m={"4px"}
        flexGrow={1}
      >
        <Flex w={"100%"}>
          {isRecommended && (
            <FontAwesomeIcon
              size={"lg"}
              icon={faSeedling}
              style={{
                marginLeft: "4px",
                marginTop: "4px",
                color: "var(--recommended-color)",
              }}
            />
          )}
          <Flex w={"100%"} justifyContent={"center"}>
            <FontAwesomeIcon
              size={"lg"}
              icon={faQuoteLeft}
              style={{
                color: "black",
                paddingTop: "4px",
                marginRight: isRecommended ? "23px" : "",
              }}
            />
          </Flex>
        </Flex>
        <blockquote
          style={{
            color: "black",
            fontFamily: "monospace",
            fontSize: "1rem",
            padding: "4px",
          }}
        >
          {summary}
        </blockquote>

        <MotionButton
          width="60%"
          m="auto"
          whileHover={{ width: "80%" }}
          transition={{ duration: 0.3 }}
        >
          <Button
            color={"black"}
            width="100%"
            borderRadius={"20px"}
            boxShadow="0px 5px 5px 0px rgba(0, 0, 0, 0.3)"
            onClick={onClick}
            colorScheme=""
            _focus={{
              boxShadow: "0px 5px 5px 0px rgba(0, 0, 0, 0.3)",
              width: "100%",
            }}
          >
            Read more
          </Button>
        </MotionButton>
      </Flex>
    </Flex>
  );
};

export default Article;
