import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";


const Posts = ({feedType}) => {

	const feedEndPoint = () => {
		if (feedType === "following") {
			return "/api/posts/postsOfFollowed"
		}
		return "/api/posts/allPosts"
	}

	const {data: posts, isLoading, refetch, isRefetching} = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			try {
				const res = await fetch(feedEndPoint())
				const data = await res.json();
				return data;
			
			} catch (error) {
				console.log(error)
			}
		}
	})

	useEffect(() => {
		refetch()
	}, [feedType, refetch])

	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && !isRefetching && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && !isRefetching && posts && (
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