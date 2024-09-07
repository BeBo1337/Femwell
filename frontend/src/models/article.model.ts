import { ReactNode } from "react";

export interface ArticleModel {
  id: string;
  title: string;
  image: string;
  content: ReactNode;
  summary: string;
  recommended?: boolean;
}
