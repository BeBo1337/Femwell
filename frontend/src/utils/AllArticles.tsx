import { ArticleModel } from "../models/article.model";
import { Heading, List, ListItem } from "@chakra-ui/react";

const articles: ArticleModel[] = [
  {
    id: "1",
    title: "Infection | Excessive bleeding | Adhesions",
    content: (
      <div>
        <Heading as="h1" size="md">
          Imagine
        </Heading>
        <p>This is some text.</p>
        <List spacing={3}>
          <ListItem>This is a list item</ListItem>
          <ListItem>This is another list item</ListItem>
        </List>
      </div>
    ),
    summary:
      "To take full responsibility for your uterus and fertility, you must know the risks involved in the abortion process, know what the warning signs are...",
    recommended: true,
  },
  {
    id: "2",
    title: "How does an abortion look and feels",
    content: "Content 1",
    summary:
      "What a miscarriage look and feel like, from the moment of receiving the news through the active phase of natural expulsion or with the induction of Cytotec pills.",
    recommended: true,
  },
  {
    id: "3",
    title: "Article 3",
    content: "Content 1",
    summary: "",
    recommended: false,
  },
  {
    id: "4",
    title: "Article 4",
    content: "Content 1",
    summary: "",
    recommended: true,
  },
  {
    id: "5",
    title: "Article 5",
    content: "Content 1",
    summary: "",
    recommended: false,
  },
  {
    id: "6",
    title: "Article 6",
    content: "Content 1",
    summary: "",
    recommended: false,
  },
  {
    id: "7",
    title: "Article 7",
    content: "Content 1",
    summary: "",
    recommended: true,
  },
  {
    id: "8",
    title: "Article 8",
    content: "Content 1",
    summary: "",
    recommended: true,
  },
];

export default articles;
