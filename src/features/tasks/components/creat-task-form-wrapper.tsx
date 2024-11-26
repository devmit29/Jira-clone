import { Card, CardContent } from "@/components/ui/card";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Loader } from "lucide-react";
import { CreateTaskForm } from "./create-task-form";
import { usegetProjects } from "@/features/projects/api/use-get-projects";

interface createTaskFormWrapperProps {
    onCancel: () => void;
}
 
export const CreateTaskFormWrapper = ({ onCancel }: createTaskFormWrapperProps) => { 
    const workspaceId = useWorkspaceId();

    const { data: projects, isLoading: isLoadingProjects} = usegetProjects({workspaceId});
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });
    
    const projectOptions = projects?.documents.map((project) => ({
        id: project.$id,
        name: project.name,
        imageUrl: project.imageUrl,
    }));
    const memberOptions = members?.documents.map((member) => ({
        id: member.$id,
        name: member.name,
    }));
    
    const isLoading = isLoadingMembers || isLoadingProjects;

    if (isLoading) {
        return (
            <Card className="w-full h-[714px] border-none shadow-none">
                <CardContent className="h-full flex items-center justify-center">
                    <Loader className="size-5 animate-spin text-muted-foreground"/>
                </CardContent>
            </Card>
        )
    } 

    return (
        <div>
            <CreateTaskForm onCancel={onCancel} projectOptions={projectOptions ?? []} memberOptions={memberOptions ?? []}/>
        </div>
    )
}