import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Chat } from "@/components/chat/chat";
import { getChatById, getMessagesByChatId } from "@/actions/queries";
import { convertToUIMessages } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { DEFAULT_CHAT_MODEL } from "@/constants/models";
import { DataStreamHandler } from "@/components/chat/data-stream-handler";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const session = await authClient.getSession();

  if (!session) {
    redirect("/api/auth/guest");
  }

  if (chat.visibility === "private") {
    if (!session.data?.user) {
      return notFound();
    }

    if (session.data?.user.id !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  const uiMessages = convertToUIMessages(messagesFromDb);

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get("chat-model");

  return (
    <>
      <Chat
        autoResume={true}
        id={chat.id}
        initialChatModel={!chatModelFromCookie ? DEFAULT_CHAT_MODEL : chatModelFromCookie.value}
        initialLastContext={chat.lastContext ?? undefined}
        initialMessages={uiMessages}
        initialVisibilityType={chat.visibility}
        isReadonly={session.data?.user?.id !== chat.userId}
      />
      <DataStreamHandler />
    </>
  );
}
