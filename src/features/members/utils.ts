import { DATABASE_ID, MEMBERS_ID } from "@/config";
import { Query, type Databases } from "node-appwrite"


interface GetMembersProps{
    databases: Databases;
    workspaceId: string;
    userId: string;
}

export const GetMember = async ({
    databases,
    workspaceId,
    userId,
}: GetMembersProps) => {
    const members = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [
            Query.equal("userId", userId),
            Query.equal("workspaceId", workspaceId),
        ]
    );
    return members.documents[0];
};