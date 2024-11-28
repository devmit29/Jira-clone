"use client"

import { DottedSeperator } from "@/components/dotted-seperated"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader, PlusIcon } from "lucide-react"
import { useCreateTaskModal } from "../hooks/use-create-task-modal"
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id"
import { useGetTasks } from "../api/use-get-task"
import { useQueryState } from "nuqs"
import { DataFilters } from "./data-filters"
import { useTaskFilters } from "../hooks/use-task-filters"
import { DataTable } from "./data-table"
import { columns } from "./columns"

export const TaskViewSwitcher = () => {
    const [{
        status,
        assigneeId,
        projectId,
        dueDate,
    }] = useTaskFilters();

    const [view, setView] = useQueryState("task-view", {
        defaultValue: "table",
    });

    const workspaceId = useWorkspaceId();
    const { open } = useCreateTaskModal();
    
    const {
        data: tasks,
        isLoading: isLoadingTasks
    } = useGetTasks({
        workspaceId,
        projectId,
        assigneeId,
        status,
        dueDate
    });
    
    return (
        <Tabs
            defaultValue={view}
            onValueChange={setView}
            className="w-full flex-1 rounded-lg border">
            <div className="h-full flex flex-col overflow-auto p-4">
                <div className="flex flex-col gap-y-2 lg:flex-row justify-between">
                    <TabsList className="w-full lg:w-auto">
                        <TabsTrigger
                            className="h-8 w-full lg:w-auto"
                            value="table">
                            Table
                        </TabsTrigger>
                        <TabsTrigger
                            className="h-8 w-full lg:w-auto"
                            value="kanban">
                            Kanban
                        </TabsTrigger>
                        <TabsTrigger
                            className="h-8 w-full lg:w-auto"
                            value="calendar">
                            Calendar
                        </TabsTrigger>
                    </TabsList>
                    <Button
                        onClick={open}
                        size={"sm"}
                        className="w-full lg:w-auto"
                    >
                        <PlusIcon className="size-4 mr-2" />
                        New
                    </Button>
                </div>
                <DottedSeperator className="my-4" />
                    <DataFilters/>
                <DottedSeperator className="my-4" />
                {isLoadingTasks ? (
                    <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center"> 
                        <Loader className="size-5 animate-spin text-muted-foreground" />
                    </div>
                ):
                    (
                    <>
                    <TabsContent
                        value = "table"
                        className = "mt-0"
                            >
                            <DataTable columns={columns} data={tasks?.documents ?? []} />
                    </TabsContent>
            <TabsContent
                value="kanban"
                className="mt-0"
            >
                {JSON.stringify(tasks)}
            </TabsContent>
            <TabsContent
                value="calendar"
                className="mt-0"
            >
                Data Calendar
            </TabsContent>
        </>)}
            </div>
        </Tabs>
    )
 }