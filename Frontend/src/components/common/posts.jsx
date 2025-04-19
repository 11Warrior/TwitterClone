const Posts = ({ feedType }) => {
  const feedEndPoint = () => {
    if (feedType === "following") {
      return `${import.meta.env.VITE_API_BASE_URL}/posts/postsOfFollowed`;
    }
    return `${import.meta.env.VITE_API_BASE_URL}/posts/allPosts`;
  };

  const { data: posts, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const res = await fetch(feedEndPoint());
        const data = await res.json();
        return Array.isArray(data) ? data : []; // Ensuring the data is an array
      } catch (error) {
        console.log(error);
        return []; // Return an empty array on error
      }
    },
  });

  useEffect(() => {
    refetch();
  }, [feedType, refetch]);

  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && !isRefetching && (posts?.length === 0 || !Array.isArray(posts)) && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && !isRefetching && Array.isArray(posts) && posts.length > 0 && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};

export default Posts;
