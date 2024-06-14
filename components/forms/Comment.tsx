'use client'

import { Form, FormField, FormLabel, FormControl, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePathname } from "next/navigation";

import { CommentValidation } from '@/lib/validations/thread'
import Image from 'next/image'
import { addCommentToThread } from '@/lib/actions/thread.actions'

interface Props {
  threadId: string;
  currentUserImg: string;
  currentUserId: string;
}

const Comment = ({threadId, currentUserImg, currentUserId} : Props) => {
  const pathname = usePathname();

  const form = useForm<z.infer<typeof CommentValidation>>({
    resolver: zodResolver(CommentValidation),
    defaultValues: {
      thread: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
    await addCommentToThread({
      threadId,
      commentText: values.thread,
      userId: JSON.parse(currentUserId),
      path: pathname
    })
    form.reset()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="comment-form"
      >
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className='flex gap-3 w-full items-center'>
              <FormLabel>
                <Image src={currentUserImg} alt="profile image" width={48} height={48} className='rounded-full object-cover' />
              </FormLabel>
              <FormControl className="border-none bg-transparent">
                <Input type="text" {...field} placeholder='Comment...' className='no-focus text-light-1 outline-none' />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="comment-form_btn">Reply</Button>
      </form>
    </Form>
  )
}

export default Comment