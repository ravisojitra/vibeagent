import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { generateUUID } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { DEFAULT_CHAT_MODEL } from "@/constants/models";
import { DataStreamHandler } from "@/components/chat/data-stream-handler";
import { Chat } from "@/components/chat/chat";

export default async function Page() {
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });
  console.log({ session });
  if (!session) {
    redirect("/signin");
  }

  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");

  return (
    <>
      <Chat
        autoResume={false}
        id={id}
        initialChatModel={!modelIdFromCookie ? DEFAULT_CHAT_MODEL : modelIdFromCookie.value}
        initialMessages={[]}
        initialVisibilityType="private"
        isReadonly={false}
        key={id}
        user={session.user}
      />
      <DataStreamHandler />
    </>
  );
}
