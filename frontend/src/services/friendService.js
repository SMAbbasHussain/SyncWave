import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Configure axios with auth header
const getAuthConfig = () => {
    return {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`
        }
    };
};

// Send friend request
export const sendFriendRequest = async (receiverId) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/api/friends/requests`,
    { receiverId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Accept friend request
export const acceptFriendRequest = async (requestId) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/api/friends/requests/${requestId}/accept`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Decline friend request
export const declineFriendRequest = async (requestId) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/api/friends/requests/${requestId}/decline`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Get incoming friend requests
export const getIncomingRequests = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/api/friends/requests/incoming`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Get outgoing friend requests
export const getOutgoingRequests = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/api/friends/requests/outgoing`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Search users
export const searchUsers = async (query) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/api/users/search?q=${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getFriends = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/friends`, getAuthConfig());
        return response.data;
    } catch (error) {
        console.error('Error fetching friends:', error);
        throw error;
    }
};

// Cancel friend request
export const cancelFriendRequest = async (requestId) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(
        `${API_URL}/api/friends/requests/${requestId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};

// Remove friend
export const removeFriend = async (friendId) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(
        `${API_URL}/api/friends/${friendId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};
