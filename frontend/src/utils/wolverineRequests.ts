// USERS RESOLVER REQUESTS -
import { gql } from "@apollo/client";
export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($createUserInput: CreateUserInput!) {
    createUser(createUserInput: $createUserInput) {
      id
      email
      username
      phoneNumber
      role
    }
  }
`;

//this needs to have profilePic and comments to have their usernames
export const GET_USER_PROFILE_QUERY = gql`
  query GetUserProfile($id: UUID!) {
    oneUser(id: $id) {
      id
      email
      username
      likes {
        postId
      }
      posts {
        id
      }
      phoneNumber
      readLater
      profilePic
      role
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($updateUserInput: UpdateUserInput!) {
    updateUser(updateUserInput: $updateUserInput) {
      id
      email
      username
      phoneNumber
    }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: UUID!) {
    deleteUser(id: $id) {
      id
      email
      username
      phoneNumber
    }
  }
`;

export const FIND_ALL_USERS_QUERY = gql`
  query FindAllUsers {
    allUsers {
      id
      email
      username
      phoneNumber
    }
  }
`;

export const FIND_ONE_USER_QUERY = gql`
  query FindOneUser($id: UUID!) {
    oneUser(id: $id) {
      id
      email
      username
      phoneNumber
    }
  }
`;

// user dtos -

export interface CreateUserInput {
  cognitoUserId: string;

  email: string;

  profileUsername: string;

  phoneNumber?: string;
}

export interface UpdateUserInput {
  id: string;

  username: string;

  phoneNumber?: string;

  newUsername?: string;

  readLater?: string[];

  profilePic?: string;
}

// QUESTIONNAIRE RESOLVER REQUESTS -

export const CREATE_QUESTIONNAIRE_MUTATION = gql`
  mutation CreateQuestionnaire(
    $createQuestionnaireInput: CreateQuestionnaireInput!
  ) {
    createQuestionnaire(createQuestionnaireInput: $createQuestionnaireInput) {
      id
      userId
      responses {
        question
        answer
      }
    }
  }
`;

export const FIND_ALL_QUESTIONNAIRES_QUERY = gql`
  query FindAllQuestionnaires {
    questionnaire {
      id
      userId
      responses {
        id
        question
        answer
      }
    }
  }
`;

export const FIND_ONE_QUESTIONNAIRE_QUERY = gql`
  query FindOneQuestionnaire($id: UUID!) {
    oneQuestionnaire(id: $id) {
      id
      userId
      responses {
        id
        question
        answer
      }
    }
  }
`;

export const FIND_QUESTIONNAIRE_BY_USER_QUERY = gql`
  query FindQuestionnaireByUser($userId: UUID!) {
    questionnaireByUserId(userId: $userId) {
      id
      userId
      responses {
        id
        question
        answer
        questionnaireId
      }
    }
  }
`;

// questionnaire dtos -

// interface Response {
//   id: string;

//   question: string;

//   answer?: string;

//   questionnaireId: string;
// }

// interface CreateQuestionnaireInput {
//   userId: string;

//   responses: Response[];

//   username: string;
// }

// interface createResponseInput {
//   question: string;

//   answer?: string;
// }

// COMMENT RESOLVER REQUESTS -

export const CREATE_COMMENT_MUTATION = gql`
  mutation CreateComment($createCommentInput: CreateCommentInput!) {
    createComment(createCommentInput: $createCommentInput) {
      id
      content
      userId
      postId
    }
  }
`;

export const UPDATE_COMMENT_MUTATION = gql`
  mutation UpdateComment($updateCommentInput: UpdateCommentInput!) {
    updateComment(updateCommentInput: $updateCommentInput) {
      id
      content
      userId
      postId
    }
  }
`;

export const DELETE_COMMENT_MUTATION = gql`
  mutation DeleteComment($id: PositiveInt!, $userId: UUID!) {
    deleteComment(id: $id, userId: $userId) {
      id
      content
      userId
    }
  }
`;

export const GET_COMMENTS_QUERY = gql`
  query GetComments($postId: UUID!) {
    getComments(postId: $postId) {
      id
      content
      userId
      postId
      user {
        username
        profilePic
      }
      createdAt
    }
  }
`;

// comment dtos -

export interface CreateCommentInput {
  userId: string;
  postId: string;
  content: string;
}

export interface UpdateCommentInput {
  id: number;
  content: string;
}

// POST RESOLVER REQUESTS -

export const CREATE_POST_MUTATION = gql`
  mutation CreatePost($createPostInput: CreatePostInput!) {
    createPost(createPostInput: $createPostInput) {
      id
      content
      userId
      createdAt
      isAnonymous
    }
  }
`;

export const UPDATE_POST_MUTATION = gql`
  mutation UpdatePost($updatePostInput: UpdatePostInput!) {
    updatePost(updatePostInput: $updatePostInput) {
      id
      content
      userId
      imageUrl
      isAnonymous
      createdAt
      comments {
        user {
          username
          profilePic
        }
        id
        content
      }
      likes {
        id
      }
    }
  }
`;

export const DELETE_POST_MUTATION = gql`
  mutation DeletePost($id: UUID!) {
    deletePost(id: $id) {
      id
      userId
    }
  }
`;

export const GET_POSTS_QUERY = gql`
  mutation GetPosts($filter: PostsFilter) {
    getPosts(filter: $filter) {
      id
      content
      userId
      imageUrl
      user {
        username
        profilePic
      }
      isAnonymous
      createdAt
      comments {
        id
        content
        user {
          username
          profilePic
        }
      }
      likes {
        id
      }
    }
  }
`;

// post dtos -
export interface CreatePostInput {
  id: string;
  content: string;
  userId: string;
  imageUrl?: string;
  isAnonymous?: boolean;
}

export interface UpdatePostInput {
  id: string;
  content: string;
  userId: string;
  imageUrl?: string;
  deleteImage: boolean;
}

export interface PostsFilter {
  ids?: string[];
  usernames?: string[];
}

// LIKES RESOLVER REQUESTS -

export const CREATE_LIKE_MUTATION = gql`
  mutation CreateLike($CreateOrDeleteLikeInput: CreateOrDeleteLikeInput!) {
    createLike(CreateOrDeleteLikeInput: $CreateOrDeleteLikeInput) {
      postId
      userId
    }
  }
`;

export const DELETE_LIKE_MUTATION = gql`
  mutation DeleteLike($CreateOrDeleteLikeInput: CreateOrDeleteLikeInput!) {
    deleteLike(CreateOrDeleteLikeInput: $CreateOrDeleteLikeInput)
  }
`;

export const GET_LIKES_QUERY = gql`
  query GetLikes($postId: UUID!) {
    getLikes(postId: $postId) {
      id
      postId
      userId
    }
  }
`;

// like dtos -

export interface CreateOrDeleteLikeInput {
  postId: string;
  userId: string;
}

// LIVE CHAT RESOLVER REQUESTS -

export const CREATE_LIVE_CHAT_MUTATION = gql`
  mutation CreateLiveChat($userId: UUID!) {
    createLiveChat(userId: $userId) {
      id
      createdAt
      updatedAt
      users {
        id
        username
        profilePic
      }
    }
  }
`;

export const DELETE_LIVE_CHAT_MUTATION = gql`
  mutation DeleteLiveChat($liveChatId: PositiveInt!) {
    deleteLiveChat(liveChatId: $liveChatId) {
      id
      createdAt
    }
  }
`;

export const GET_LIVE_CHAT_QUERY = gql`
  query GetLiveChat($liveChatId: PositiveInt!) {
    getLiveChat(liveChatId: $liveChatId) {
      id
      createdAt
      updatedAt
      users {
        id
        email
        username
      }
      messages {
        id
        content
        userId
        seen
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_PREVIOUS_CHATS_FOR_USER_QUERY = gql`
  query GetPreviousChatsForUser($userId: UUID!) {
    getPreviousChatsForUser(userId: $userId) {
      id
      name
      createdAt
      updatedAt
      users {
        id
        email
        username
        phoneNumber
      }
      messages {
        id
        content
        userId
        user {
          email
          username
          phoneNumber
        }
        seen
        createdAt
        updatedAt
      }
    }
  }
`;

export const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($sendMessageInput: SendMessageInput!) {
    sendMessage(sendMessageInput: $sendMessageInput) {
      id
      content
      userId
      user {
        username
      }
      seen
      createdAt
      updatedAt
    }
  }
`;

export interface SendMessageInput {
  userId: string;
  liveChatId: number;
  content: string;
  isPadullaSent?: boolean;
}

export const ADD_PADULLA_TO_LIVE_CHAT_MUTATION = gql`
  mutation AddPadullaToLiveChat($liveChatId: PositiveInt!, $userId: UUID!) {
    addPadullaToLiveChat(liveChatId: $liveChatId, userId: $userId) {
      id
      createdAt
      updatedAt
      users {
        id
        username
        profilePic
      }
      messages {
        id
        content
        userId
        seen
        createdAt
        updatedAt
      }
    }
  }
`;

export const USER_LEAVE_CHAT_MUTATION = gql`
  mutation ExitLiveChat($liveChatId: PositiveInt!, $userId: UUID!) {
    exitLiveChat(liveChatId: $liveChatId, userId: $userId)
  }
`;

export const GET_MESSAGES_FOR_LIVE_CHAT_QUERY = gql`
  query GetMessagesForLiveChat($liveChatId: PositiveInt!) {
    getMessagesForLiveChat(liveChatId: $liveChatId) {
      id
      content
      userId
      user {
        email
        username
        phoneNumber
      }
      seen
      createdAt
      updatedAt
    }
  }
`;

export const SET_MESSAGE_SEEN_MUTATION = gql`
  mutation setMessagesAsRead($liveChatId: PositiveInt!) {
    setMessagesAsRead(liveChatId: $liveChatId) {
      id
    }
  }
`;

export const SET_MESSAGES_UNSEEN_MUTATION = gql`
  mutation setMessageAsUnread($liveChatId: PositiveInt!) {
    setMessagesUnseen(liveChatId: $liveChatId)
  }
`;

export const GET_CHATS_FOR_PADULLA = gql`
  query getLiveChatsForPadulla($userId: UUID!) {
    getLiveChatsForPadulla(userId: $userId) {
      id
      createdAt
      users {
        id
        username
        profilePic
      }
      messages {
        id
        userId
        content
        seen
        createdAt
        updatedAt
      }
    }
  }
`;

export const NEW_MESSAGE_SUBSCRIPTION = gql`
  subscription OnNewMessage($liveChatId: Int!) {
    newMessage(liveChatId: $liveChatId) {
      id
      content
      user {
        id
        username
      }
      createdAt
    }
  }
`;
