import { ObjectId } from 'mongoose';
import { PostRequest } from 'src/contexts/post/application/adapter/dto/post.request';

export const postStub = (): PostRequest => {
  return {
    title: 'My title',
    author: '5f9d8f5e9d8f5e9d8f5e9d8f' as unknown as ObjectId,
    postType: 'public',
    description: 'My description',
    visibility: 'public',
    recomendations: [],
    price: 0,
    location: {
      location: {
        type: 'Point',
        coordinates: [-73.935242, 40.73061] as unknown as [number],
      },
      userSetted: true,
      description: 'My description',
    },
    category: ['5f9d8f5e9d8f5e9d8f5e9d8f' as unknown as ObjectId],
    comments: [],
    attachedFiles: [
      {
        url: 'https://your-bucket.com/profile.jpg',
        label: 'My profile photo',
      },
      {
        url: 'https://your-bucket.com/profile2.jpg',
        label: 'My profile photo2',
      },
      {
        url: 'https://your-bucket.com/profile3.jpg',
        label: 'My profile photo3',
      },
    ],
    createAt: '2024-10-10T00:00:00Z',
  };
};
