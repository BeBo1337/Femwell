import {
  Box,
  Heading,
  VStack,
  Divider,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useBreakpointValue,
  useMediaQuery,
  Fade,
  useColorModeValue,
} from "@chakra-ui/react";
import Header from "../components/Header";
import articles from "../utils/AllArticles";
import { ArticleModel } from "../models/article.model";
import Article from "../components/Article";
import { ReactSortable } from "react-sortablejs";
import { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import useUpdateLaterArticles from "../hooks/useUpdateLaterArticles";

const ION = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedArticle, setSelectedArticle] = useState<ArticleModel>();
  const authUser = useAuthStore((state) => state.user);
  const { editLaterArticles } = useUpdateLaterArticles();
  const modalBgColor = useColorModeValue("white", "#533142");
  const [allArticles, setAllArticles] = useState<ArticleModel[]>([]);
  const [laterArticles, setLaterArticles] = useState<ArticleModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authUser && authUser.readLater) {
      const filteredArticles = articles.filter((article) =>
        authUser.readLater?.includes(article.id),
      );
      setLaterArticles(filteredArticles);
      const remainingArticles = articles.filter(
        (article) => !authUser.readLater?.includes(article.id),
      );
      setAllArticles(remainingArticles);
    } else {
      setAllArticles(articles);
    }
    setTimeout(() => setLoading(false), 30);
  }, [authUser]);

  const openArticle = (article: any) => {
    setSelectedArticle(article);
    onOpen();
  };

  const onEnd = async (evt: any) => {
    const { oldIndex, newIndex, to, from } = evt;
    const sourceListName = from.id;
    const destinationListName = to.id;

    if (sourceListName === destinationListName) {
      const list =
        sourceListName === "articles"
          ? Array.from(allArticles)
          : Array.from(laterArticles);
      const [removed] = list.splice(oldIndex, 1);
      list.splice(newIndex, 0, removed);
      sourceListName === "articles"
        ? setAllArticles(list)
        : setLaterArticles(list);
    } else {
      const sourceList = Array.from(
        sourceListName === "articles" ? allArticles : laterArticles,
      );
      const destinationList = Array.from(
        destinationListName === "articles" ? allArticles : laterArticles,
      );
      const [removed] = sourceList.splice(oldIndex, 1);
      destinationList.splice(newIndex, 0, removed);

      const success = await editLaterArticles(removed.id);
      if (success) {
        sourceListName === "articles"
          ? setAllArticles(sourceList)
          : setLaterArticles(sourceList);
        destinationListName === "articles"
          ? setAllArticles(destinationList)
          : setLaterArticles(destinationList);
      }
    }
  };

  const gridTemplateColumns = useBreakpointValue({
    base: "1fr",
    md: "1fr 1fr",
    lg: "1fr 1fr 1fr",
  });

  const [isLargerThan1400] = useMediaQuery("(min-width: 1400px)");
  const [isLargerThan900] = useMediaQuery("(min-width: 900px)");

  return (
    <div className="page">
      <Fade in={!loading} className="main-element">
        <Header image="/sunset.jpg">
          <h1>Informational Online Notebook</h1>
        </Header>

        <VStack>
          {/* article container */}
          <VStack spacing="5" width="100%" justifyContent={"center"}>
            <VStack
              width="auto"
              spacing="5"
              paddingTop="5"
              borderRadius="md"
              borderColor="var(--secondrary-color)"
            >
              <Heading as="h2" size="lg">
                Articles
              </Heading>
              <Divider />
              <Box
                display="grid"
                width={"100%"}
                alignItems={"flex-start"}
                justifyContent={"center"}
              >
                <ReactSortable
                  id="articles"
                  list={allArticles}
                  setList={setAllArticles}
                  handle=".drag-handle"
                  animation={500}
                  group="articles"
                  // onChange={(order, sortable, evt) => {}}
                  onEnd={onEnd}
                  forceFallback={true}
                  scroll={true}
                  scrollSpeed={
                    isLargerThan1400 ? 10 : isLargerThan900 ? 20 : 30
                  }
                  style={{
                    display: "grid",
                    gridTemplateColumns: gridTemplateColumns,
                    width: "100%",
                    alignItems: "flex-start",
                    justifyContent: "center",
                  }}
                >
                  {allArticles.map((article) => (
                    <Article
                      key={article.id}
                      image="/sunset.jpg"
                      title={article.title}
                      summary={
                        article.summary ||
                        "Short summary of the article here, for now this is a boilerplate."
                      }
                      onClick={() => openArticle(article)}
                      isRecommended={article.recommended}
                    />
                  ))}
                </ReactSortable>
              </Box>
            </VStack>
            {/* read later container */}
            {authUser && (
              <VStack
                width="auto"
                spacing="5"
                paddingTop="5"
                borderRadius="md"
                borderColor="var(--secondrary-color)"
              >
                <Heading as="h2" size="lg">
                  Read Later
                </Heading>
                <Divider />
                <Box
                  display="grid"
                  width={"100%"}
                  alignItems={"flex-start"}
                  justifyContent={"center"}
                >
                  <ReactSortable
                    id="readLater"
                    list={laterArticles}
                    setList={setLaterArticles}
                    group="articles"
                    handle=".drag-handle"
                    animation={500}
                    // onChange={(order, sortable, evt) => {}}
                    onEnd={onEnd}
                    forceFallback={true}
                    scroll={true}
                    scrollSpeed={
                      isLargerThan1400 ? 10 : isLargerThan900 ? 20 : 30
                    }
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        laterArticles.length > 0 ? gridTemplateColumns : "1fr",
                      width: "100%",
                      alignItems: "flex-start",
                      justifyContent: "center",
                      minHeight: "200px",
                    }}
                  >
                    {laterArticles.length > 0 ? (
                      laterArticles.map((article) => (
                        <Article
                          key={article.id}
                          image="/sunset.jpg"
                          title={article.title}
                          summary={
                            article.summary ||
                            "Short summary of the article here, for now this is a boilerplate."
                          }
                          onClick={() => openArticle(article)}
                          isRecommended={article.recommended}
                        />
                      ))
                    ) : (
                      <Text
                        fontStyle={"italic"}
                        fontWeight={"bold"}
                        textAlign={"center"}
                      >
                        *Drag articles here
                      </Text>
                    )}
                  </ReactSortable>
                </Box>
              </VStack>
            )}
          </VStack>
        </VStack>

        <Modal preserveScrollBarGap isOpen={isOpen} onClose={onClose}>
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(3px) " />
          <ModalContent
            bg={modalBgColor}
            maxWidth="80%" /* Bigger size */
            width="auto" /* Adjust width as needed */
          >
            <ModalHeader fontSize={30} pt={7}>
              {selectedArticle?.title}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>{selectedArticle?.content}</ModalBody>
          </ModalContent>
        </Modal>
      </Fade>

      <svg
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        className="svg"
      >
        <path d="M0,160L34.3,186.7C68.6,213,137,267,206,288C274.3,309,343,299,411,266.7C480,235,549,181,617,133.3C685.7,85,754,43,823,58.7C891.4,75,960,149,1029,176C1097.1,203,1166,181,1234,160C1302.9,139,1371,117,1406,106.7L1440,96L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"></path>
      </svg>
    </div>
  );
};

export default ION;
