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
	const { mutate: commentFunction, isPending: isCommenting } = useMutation({
		mutationFn: async () => {
			const res = await fetch(`/api/posts/comment/${post._id}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ text: comment }),
			});
			if (!res.ok) {
				throw new Error("Failed to post comment");
			}
			const data = await res.json(); // should return new comment
			return data;
		},
		onSuccess: (newComment) => {
			queryClient.setQueryData(["posts"], (oldPosts) => {
				if (!oldPosts) return [];
	
				return oldPosts.map((p) => {
					if (p._id === post._id) {
						return {
							...p,
							comments: [...p.comments, newComment],
						};
					}
					return p;
				});
			});
	
			setComment(""); // Clear textarea
	
			const modal = document.getElementById("comments_modal" + post._id);
			if (modal?.close) modal.close(); // Close modal
		},
	});
	
	const handlePostComment = async (e) => {
		e.preventDefault()
		commentFunction();
	};

	return (
		<div className='flex gap-2 items-start p-4 border-b border-gray-700'>
			<div className='avatar'>
				<Link to={`/profile/${postOwner.userName}`} className='w-8 rounded-full overflow-hidden'>
					<img src={postOwner.profileImage || "/avatar-placeholder.png"} />
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
			{/* Comments Modal */}
			<dialog id={`comments_modal${post._id}`} className='modal border-none outline-none'>
				<div className='modal-box rounded border border-gray-600'>
					<h3 className='font-bold text-lg mb-4'>COMMENTS</h3>

					<div className='flex flex-col gap-3 max-h-60 overflow-auto'>
						{post.comments.length === 0 && (
							<p className='text-sm text-slate-500'>No comments yet 🤔 Be the first one 😉</p>
						)}

						{post.comments.map((comment) => (
							<div key={comment._id} className='flex gap-2 items-start'>
								<div className='avatar'>
									<div className='w-8 rounded-full'>
										<img src={comment.user.profileImage || "/avatar-placeholder.png"} />
									</div>
								</div>
								<div className='flex flex-col'>
									<div className='flex items-center gap-1'>
										<span className='font-bold'>{comment.user.fullName}</span>
										<span className='text-gray-700 text-sm'>@{comment.user.userName}</span>
									</div>
									<div className='text-sm'>{comment.text}</div>
								</div>
							</div>
						))}
					</div>
			{/* Comment Form */}
			<form
				className='flex gap-2 items-center mt-4 border-t border-gray-600 pt-2'
				onSubmit={handlePostComment}
			>
				<textarea
					className='textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800'
					placeholder='Add a comment...' name="comment"
					value={comment}
					onChange={(e) => setComment(e.target.value)}
				/>
				<button
					className='btn btn-primary rounded-full btn-sm text-white px-4'
					type='submit'
				>
					Post
				</button>
			</form>
		</div>
		<form method='dialog' className='modal-backdrop'>
			<button className='outline-none'>close</button>
		</form>
	</dialog>

		</div>
	);
};

export default Post;
