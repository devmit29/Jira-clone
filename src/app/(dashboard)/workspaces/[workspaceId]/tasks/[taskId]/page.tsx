import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { TaskIdClient } from "./client";

const TaskIdPage = async () => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");


    return (
        <div className="flex flex-col h-full">
            <TaskIdClient />
        </div>
    );
}
 
export default TaskIdPage;