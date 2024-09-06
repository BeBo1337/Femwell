import { Post } from "./post.model";
import { Questionnare } from "./questionnaire.model";

export interface User {
  id: string;
  email: string;
  username: string;
  phoneNumber?: string;
  posts?: Post[];
  likes?: Post[];
  questionnaire?: Questionnare;
  profilePic?: string;
  readLater?: string[];
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  jwt: string;
  refreshToken: string;
  phoneNumber?: string;
  posts?: string[];
  likes?: string[];
  questionnaire?: Questionnare;
  profilePic?: string;
  readLater?: string[];
  role: string;
}
