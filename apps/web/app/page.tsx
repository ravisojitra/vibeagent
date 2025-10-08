import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { DEFAULT_CHAT_MODEL } from "@/constants/models";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MainHomeChat } from "@/components/main/MainHomeChat";
import { GradientBars } from "@/components/ui/gradient-bar-hero-section";

export default async function Page() {
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });

  if (!session) {
    redirect("/signin");
  }

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");

  return (
    <div className="relative flex flex-col min-h-screen">
      <div className="relative z-10 w-full h-full min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="max-w-3xl w-full">
              <h1 className="text-4xl md:text-6xl font-bold">
                What should we build today?
              </h1>
              <p className="mt-4 text-lg md:text-xl text-muted-foreground">
                Create stunning apps & websites by chatting with AI.
              </p>
            </div>
            <div className="w-full max-w-xl mt-8">
              <MainHomeChat
                initialChatModel={!modelIdFromCookie ? DEFAULT_CHAT_MODEL : modelIdFromCookie.value}
              />
            </div>
          </div>
        </main>
        <Footer />
      </div>
      <GradientBars />
    </div>
  );
}
