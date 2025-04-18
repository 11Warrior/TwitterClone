import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const Post = ({ post }) => {
	const [comment, setComment] = useState("");
	const queryClient = useQueryClient();

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const postOwner = post.user;

	const isLiked = post.likes.includes(authUser?._id);
	const isMyPost = authUser?._id === postOwner?._id;

	const { mutate: likeFunction, isPending } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`/api/posts/likeUnlikePost/${post._id}`, {
				method: "POST",
				credentials: "include",
			});
			if (!res.ok) {
				const error = await res.text();
				throw new Error(error);
			}
			return res.json();
		},
		onSuccess: (updatedLikes) => {
			queryClient.setQueryData(['posts'], (old) => {
				return old.map((p) => {
					if (p._id === post._id) {
						return {...p, likes:updatedLikes}
					}
					return p
				})
			})
		},
	});

	const handleLikePost = () => {
		if (!isPending) likeFunction();
	};

	const handleDeletePost = async () => {
		try {
			await fetch(`/api/posts/delete/${post._id}`, {
				method: "POST",
				credentials: "include",
			});
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		} catch (error) {
			console.log(error);
		}
	};

	const handlePostComment = (e) => {
		e.preventDefault();
	};

	return (
		<div className='flex gap-2 items-start p-4 border-b border-gray-700'>
			<div className='avatar'>
				<Link to={`/profile/${postOwner.userName}`} className='w-8 rounded-full overflow-hidden'>
					<img src={postOwner.profileImg || "/avatar-placeholder.png"} />
				</Link>
			</div>

			<div className='flex flex-col flex-1'>
				{/* Header */}
				<div className='flex gap-2 items-center'>
					<Link to={`/profile/${postOwner.userName}`} className='font-bold'>
						{postOwner.fullName}
					</Link>
					<span className='text-gray-700 flex gap-1 text-sm'>
						<Link to={`/profile/${postOwner.userName}`}>@{postOwner.userName}</Link>
						<span>·</span>
						<span>1h</span>
					</span>
					{isMyPost && (
						<span className='flex justify-end flex-1'>
							<FaTrash className='cursor-pointer hover:text-red-500' onClick={handleDeletePost} />
						</span>
					)}
				</div>

				{/* Content */}
				<div className='flex flex-col gap-3 overflow-hidden'>
					<span>{post.text}</span>
					{post.image && (
						<img
							src={post.image}
							className='h-80 object-contain rounded-lg border border-gray-700'
							alt='post'
						/>
					)}
				</div>

				{/* Footer buttons */}
				<div className='flex justify-between mt-3'>
					<div className='flex gap-4 items-center w-2/3 justify-between'>
						{/* Comment */}
						<div
							className='flex gap-1 items-center cursor-pointer group'
							onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
						>
							<FaRegComment className='w-4 h-4 text-slate-500 group-hover:text-sky-400' />
							<span className='text-sm text-slate-500 group-hover:text-sky-400'>
								{post.comments.length}
							</span>
						</div>

						{/* Repost */}
						<div className='flex gap-1 items-center group cursor-pointer'>
							<BiRepost className='w-6 h-6 text-slate-500 group-hover:text-green-500' />
							<span className='text-sm text-slate-500 group-hover:text-green-500'>0</span>
						</div>

						{/* Like */}
						<div className='flex gap-1 items-center group cursor-pointer' onClick={handleLikePost}>
							<FaRegHeart
								className={`w-4 h-4 cursor-pointer ${
									isLiked ? "text-pink-500" : "text-slate-500 group-hover:text-pink-500"
								}`}
							/>
							<span
								className={`text-sm ${
									isLiked ? "text-pink-500" : "text-slate-500 group-hover:text-pink-500"
								}`}
							>
								{post.likes.length}
							</span>
						</div>
					</div>

					{/* Bookmark */}
					<div className='flex w-1/3 justify-end gap-2 items-center'>
						<FaRegBookmark className='w-4 h-4 text-slate-500 cursor-pointer' />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Post;
