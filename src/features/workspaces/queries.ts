

import {Query} from "node-appwrite";

import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { GetMember } from "../members/utils";
import { Workspace } from "./types";
import { createSessionClient } from "@/lib/appwrite";

export const getWorkspaces = async () => {
    try {
        const { databases, account } = await createSessionClient();
        const user = await account.get();
        
    const members = await databases.listDocuments(
        DATABASE_ID,
        MEMBERS_ID,
        [Query.equal("userId", user.$id)]
    );
    if (members.total === 0) {
        return { documents: [], total: 0 };
    }

    const workspaceIds = members.documents.map((member) => member.workspaceId);

    const workspaces = await databases.listDocuments(
        DATABASE_ID,
        WORKSPACES_ID,
        [
            Query.orderDesc("$createdAt"),
            Query.contains("$id", workspaceIds),
        ]
    );
        return workspaces;
    }
    catch (error) {
        console.error(error);
        return { documents: [], total: 0 };
    }
}

interface GetWorkspaceProps { 
    workspaceId: string;
}


export const getWorkspace = async ({ workspaceId}: GetWorkspaceProps ) => {
    const { databases, account } = await createSessionClient();
    const user = await account.get();

    const member = await GetMember({databases, userId: user.$id, workspaceId });
        
    if (!member) {
        throw new Error("Unaturhorized");
    }
        
    const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
    );
        return workspace;
    
}

interface GetWorkspaceInfoProps { 
    workspaceId: string;
}


export const getWorkspaceInfo = async ({ workspaceId}: GetWorkspaceInfoProps ) => {
    try {
    const { databases, account } = await createSessionClient();
        
    const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        WORKSPACES_ID,
        workspaceId,
    );
        return {
            name: workspace.name,
        }
    }
    catch (error) {
        return null;
    }
}
