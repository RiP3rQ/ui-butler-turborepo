export interface User {
  id: number;
  email: string;
  username?: string;
}

export interface Profile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
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
      user: User & {
        profile?: Profile;
      };
    };
  };

  /** POST /users/profile */
  createProfile: {
    body: {
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };
    response: Profile;
  };

  /** POST /users */
  createUser: {
    body: {
      email: string;
      username?: string;
      password: string;
    };
    response: User;
  };
}
