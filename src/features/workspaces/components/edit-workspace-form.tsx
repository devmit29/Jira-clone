"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updateWorkspaceSchema } from "../schemas";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSeperator } from "@/components/dotted-seperated";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { ArrowLeftIcon, CopyIcon, Delete, ImageIcon } from "lucide-react";
import { handle } from "hono/vercel";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Workspace } from "../types";
import { useupdateWorkspace } from "../api/use-update-workspace";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteWorkspace } from "../api/use-delete-workspace";
import { toast } from "sonner";
import { useResetInviteCode } from "../api/use-reset-invite-code";

interface editWorkspaceFormProps {
    onCancel?: () => void;
    initialValues: Workspace;
}

export const EditWorkspaceForm = ({ onCancel, initialValues }: editWorkspaceFormProps) => {
    const router = useRouter();
    const { mutate, isPending } = useupdateWorkspace();
    const { mutate: deleteWorkspace, isPending: isDeleteWorkspace } = useDeleteWorkspace();
    const { mutate: resetInviteCode, isPending: isResettingInviteCode } = useResetInviteCode();

    const [DeleteDialog, confirmDelete] = useConfirm(
        "Delete Workspace",
        "Are you sure you want to delete this workspace? This action is irreversible.",
        "destructive",
    );
    const [ResetDialog, confirmReset] = useConfirm(
        "Reset Invite Link",
        "This will invalidate the current invite code.",
        "destructive",
    );
    
    const inputRef = useRef<HTMLInputElement>(null);
    
    const form = useForm<z.infer<typeof updateWorkspaceSchema>>({
        resolver: zodResolver(updateWorkspaceSchema),
        defaultValues: {
            ...initialValues,
            image: initialValues.imageUrl ?? "",
        }
    });

    const handleDelete = async () => {
        const ok = await confirmDelete();

        if (!ok) return;

        deleteWorkspace({
            param: { workspaceId: initialValues.$id },
        }, {
            onSuccess: () => {
                window.location.href = "/";
            }
        });
    }

    const handleResetInviteCode = async () => {
        const ok = await confirmReset();

        if (!ok) return;

        resetInviteCode({
            param: { workspaceId: initialValues.$id },
        }, {
            onSuccess: () => {
                router.refresh();
            }
        });
    }

    const onSubmit = (values: z.infer<typeof updateWorkspaceSchema>) => {
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : "",
        }
        mutate({
            form: finalValues,
            param: { workspaceId: initialValues.$id },
        },
            {
                onSuccess: ({ data }) => {
                    form.reset();
                    router.push(`/workspaces/${data.$id}`);
                }
            });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue("image", file);
        }
    }

    const fullInviteLink = `${window.location.origin}/workspaces/${initialValues.$id}/join/${initialValues.inviteCode}`;

    const handleCopyInviteLink = () => {
        navigator.clipboard.writeText(fullInviteLink)
            .then(() => toast.success("Invite link copied to clipboard"));
    };

    return (
        <div className="flex flex-col gap-y-4">
            <DeleteDialog />
            <ResetDialog />
            <Card className="w-full h-full shadow-none border-none">
                <CardHeader className="flex flex-row items-centergap-x-4 p-7 space-y-0">
                    <Button className="mr-2" size="sm" variant={"secondary"} onClick={onCancel ? onCancel : () => router.push(`/workspaces/${initialValues.$id}`)}>
                        <ArrowLeftIcon className="size-4" />
                    </Button>
                    <CardTitle className="text-xl font-bold">
                        {initialValues.name}
                    </CardTitle>
                </CardHeader>
                <div className="px-7">
                    <DottedSeperator />
                </div>
                <CardContent className="p-7">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-y-4">
                                <FormField control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Workspace Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter workspace name"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-y-2">
                                            <div className="flex items-center gap-x-5">
                                                {field.value ? (
                                                    <div className="size-[72px] relative rounded-md overflow-hidden">
                                                        <Image
                                                            alt="Logo"
                                                            fill
                                                            className="object-cover"
                                                            src={field.value instanceof File
                                                                ? URL.createObjectURL(field.value)
                                                                :
                                                                field.value}
                                                        />
                                                    </div>
                                                ) : (
                                                    <Avatar className="size-[72px]">
                                                        <AvatarFallback>
                                                            <ImageIcon className="size-[36px] text-neutral-400" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div className="flex flex-col">
                                                    <p className="text-sm"> Workspace Icon</p>
                                                    <p className="text-sm text-muted-foreground"> JPG, PNG, SVG or JPEG, max 1Mb</p>
                                                    <input
                                                        className="hidden"
                                                        type="file"
                                                        accept=".jpg, .png, .svg, .jpeg"
                                                        ref={inputRef}
                                                        onChange={handleImageChange}
                                                        disabled={isPending}
                                                    ></input>
                                                    {field.value ? (
                                                        <Button
                                                            type="button"
                                                            disabled={isPending}
                                                            variant={'destructive'}
                                                            size={'xs'}
                                                            className="w-fit mt-2"
                                                            onClick={() => {
                                                                field.onChange(null);
                                                                if (inputRef.current) {
                                                                    inputRef.current.value = "";
                                                                }
                                                            }
                                                            }>
                                                            Remove
                                                        </Button>
                                                    ) : (<Button
                                                        type="button"
                                                        disabled={isPending}
                                                        variant={'teritary'}
                                                        size={'xs'}
                                                        className="w-fit mt-2"
                                                        onClick={() => inputRef.current?.click()}>
                                                        Upload Image
                                                    </Button>)}
                                            
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                            <DottedSeperator className="py-7" />
                            <div className="flex justify-between items-center">
                                <Button
                                    type="button"
                                    size='lg'
                                    variant="secondary"
                                    onClick={onCancel}
                                    disabled={isPending}
                                    className={cn(!onCancel && 'invisible')}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size='lg'
                                    disabled={isPending}
                                >
                                    Save Changes
                                </Button>
                            </div>

                        </form>
                
                    </Form>
                </CardContent>
            </Card>

            <Card className="w-full h-full shadow-none border-none">
                <CardContent className="p-7">
                    <div className="flex flex-col">
                        <h3 className="text-sm text-muted-foreground">Invite Members</h3>
                        <p>Use the invite link to add Members to the workspace</p>
                        <div className="mt-4">
                            <div className="flex items-center gap-x-2">
                                <Input disabled value={fullInviteLink} />
                                <Button
                                    variant="secondary"
                                    className="size-12"
                                    onClick={handleCopyInviteLink}>
                                    <CopyIcon className="size-5" />
                                </Button>
                            </div>
                            <DottedSeperator className="py-7" />
                        </div>
                        <Button
                            size="sm"
                            variant="destructive"
                            className="mt-6 w-full ml-auto"
                            type="button"
                            disabled={isPending || isResettingInviteCode}
                            onClick={handleResetInviteCode}
                        >Reset Invite Link</Button>
                    
                    </div>
                </CardContent>

            </Card>

            <Card className="w-full h-full shadow-none border-none">
                <CardContent className="p-7">
                    <div className="flex flex-col">
                        <h3 className="text-sm text-muted-foreground">Danger Zone</h3>
                        <p>Deleting a workspace is an irreversible!</p>
                        <DottedSeperator className="py-7" />
                        <Button
                            size="sm"
                            variant="destructive"
                            className="mt-6 w-full ml-auto"
                            type="button"
                            disabled={isPending || isDeleteWorkspace}
                            onClick={handleDelete}
                        >Delete Workspace</Button>
                    
                    </div>
                </CardContent>

            </Card>
        </div>
    )
}