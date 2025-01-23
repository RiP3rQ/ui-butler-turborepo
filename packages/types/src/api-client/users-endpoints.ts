export interface User {
  id: number;
  email: string;
  username?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Profile {
  id: number;
  userId: number;
  bio: string;
  location: string;
  website: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsersEndpoints {
  /** GET /users */
  getUsers: {
    response: {
      users: User[];
    };
  };

  /** GET /users/current-basic */
  getCurrentUser: {
    response: {
      id: number;
      username?: string;
      email: string;
      avatar?: string;
    };
  };

  /** POST /users/profile */
  createProfile: {
    body: {
      userId: number;
      bio: string;
      location: string;
      website: string;
    };
    response: Profile;
  };

  /** POST /users */
  createUser: {
    body: {
      email: string;
      password: string;
      username?: string;
    };
    response: User;
  };
}
