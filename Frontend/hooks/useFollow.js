import { useMutation, useQueryClient } from "@tanstack/react-query";


export const useFollow = () => {
  const queryClient = useQueryClient();
  const {mutate: followUnfollow, isPending, isError} = useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`/api/users/follow/${userId}`, {
        method: "POST"
      })
      const data = await res.json();

      return data;
    },
    onSuccess : () => {
      Promise.all([
      queryClient.invalidateQueries({queryKey: ["suggestions"]}),
      queryClient.invalidateQueries({queryKey: ["authUser"]})
    ])
    }
  })
  return {followUnfollow, isPending}
}


