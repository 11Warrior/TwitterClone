import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import LoadingSpinner from "../common/LoadingSpinner"
import { useQuery } from "@tanstack/react-query";
import { useFollow } from "../../../hooks/useFollow";

const RightPanel = () => {
	const {data: suggestions, isLoading} = useQuery({
		queryKey: ['suggestions'],
		queryFn: async () => {
			try {
				const res = await fetch('/api/users/suggested')
				const data = await res.json();
				return data;
			} catch (error) {
				console.log(error)
			}
		}
	})

	const {followUnfollow, isPending} = useFollow()

	if (suggestions === null) {
		return (
			<div>

			</div>
		)
	}

	return (
		<div className='hidden lg:block my-4 mx-2'>
			<div className='bg-[#16181C] p-4 rounded-md sticky top-2'>
				<p className='font-bold'>See who else is on Twitter</p>
				<div className='flex flex-col gap-4'>
					{/* item */}
					{isLoading && (
						<>
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
						</>
					)}
					{!isLoading &&
						suggestions?.map((user) => (
							<Link
								to={`/profile/${user.userName}`}
								className='flex items-center justify-between gap-4'
								key={user._id}
							>
								<div className='flex gap-2 items-center'>
									<div className='avatar'>
										<div className='w-8 rounded-full'>
											<img src={user.profileImage || "/avatar-placeholder.png"} />
										</div>
									</div>
									<div className='flex flex-col'>
										<span className='font-semibold tracking-tight truncate w-28'>
											{user.fullName}
										</span>
										<span className='text-sm text-slate-500'>@{user.userName}</span>
									</div>
								</div>
								<div>
									<button
										className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm'
										onClick={(e) => {
											e.preventDefault()
											followUnfollow(user._id)
										}}
									>
										{
											isPending ? <LoadingSpinner/ > : "Follow"
										}
									</button>
								</div>
							</Link>
						))}
				</div>
			</div>
		</div>
	);
};
export default RightPanel;