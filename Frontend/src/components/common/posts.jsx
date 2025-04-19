import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedType }) => {
  // Define the endpoint based on feedType
  const feedEndPoint = () => {
    if (feedType === "following") {
      return `${import.meta.env.VITE_API_BASE_URL}/posts/postsOfFollowed`;
    }
    return `${import.meta.env.VITE_API_BASE_URL}/posts/allPosts`;
  };

  // Fetch posts using react-query
  const { data: posts, isLoading, refetch, isRefetching, isError, error } = useQuery({
    queryKey: ["posts", feedType], // Dependency array includes feedType to trigger refetch when it changes
    queryFn: async () => {
      try {
        const res = await fetch(feedEndPoint());
        const data = await res.json();
        if (!Array.isArray(data)) {
          throw new Error("Received data is not an array");
        }
        return data;
      } catch (error) {
        console.log(error);
        throw new Error("Failed to load posts");
      }
    },
  });

  // Trigger refetch when feedType changes
  useEffect(() => {
    refetch();
  }, [feedType, refetch]);

  // Handle loading and error states
  if (isLoading || isRefetching) {
    return (
      <div className="flex flex-col justify-center">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (isError) {
    return <p className="text-center my-4 text-red-500">{error.message || "An error occurred while loading posts."}</p>;
  }

  // Render posts if available, else show empty message
  if (posts?.length === 0) {
    return <p className="text-center my-4">No posts in this tab. Switch 👻</p>;
  }

  return (
    <div>
      {posts.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
};

export default Posts;
