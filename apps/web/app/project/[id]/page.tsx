import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { DEFAULT_CHAT_MODEL } from "@/constants/models";
import { DataStreamHandler } from "@/components/chat/data-stream-handler";
import { ProjectHeader } from "@/components/project/project-header";
import { ProjectLayout } from "@/components/project/project-layout";
import { getChatById, getMessagesByChatId } from "@/actions/queries";
import { convertToUIMessages } from "@/lib/utils";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    // const chat = await getChatById({ id });

    // if (!chat) {
    //     notFound();
    // }

    // const { data: session } = await authClient.getSession({
    //     fetchOptions: {
    //         headers: await headers(),
    //     },
    // });

    // if (!session || !session.user) {
    //     redirect("/signin");
    // }

    // if (chat.visibility === "private") {
    //     if (session?.user.id !== chat.userId) {
    //         return notFound();
    //     }
    // }

    // const messagesFromDb = await getMessagesByChatId({ id });
    // const uiMessages = convertToUIMessages(messagesFromDb);

    const cookieStore = await cookies();
    const chatModelFromCookie = cookieStore.get("chat-model");

    return (
        <>
            <div className="flex h-dvh w-full flex-col overflow-hidden bg-background">
                {/* Header */}
                <ProjectHeader />

                {/* Main Content - Chat and Preview */}
                <div className="flex-1 overflow-hidden">
                    {/* <ProjectLayout
                        id={id}
                        chat={chat}
                        initialMessages={uiMessages}
                        isReadonly={session?.user?.id !== chat.userId}
                        initialChatModel={!chatModelFromCookie ? DEFAULT_CHAT_MODEL : chatModelFromCookie.value}
                    /> */}
                    <ProjectLayout
                        id={id}
                        chat={{
                            id,
                            title: "Test",
                            createdAt: new Date(),
                            userId: "1",
                            visibility: "public",
                            lastContext: null,
                        }}
                        initialMessages={[]}
                        isReadonly={false}
                        initialChatModel={!chatModelFromCookie ? DEFAULT_CHAT_MODEL : chatModelFromCookie.value}
                    />
                </div>
            </div>
            <DataStreamHandler />
        </>
    );
}

