"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo } from "react";
import { useWindowSize } from "usehooks-ts";
import { SidebarToggle } from "@/components/sidebar/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { PlusIcon, VercelIcon } from "@/constants/icons";
import { useSidebar } from "@/components/ui/sidebar";
import { VisibilitySelector } from "@/components/chat/visibility-selector";
import { VisibilityType } from "@/types/chat";
import { UserMenu } from "@/components/chat/user-menu";

function PureChatHeader({
  chatId,
  selectedVisibilityType,
  isReadonly,
  user,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  user?: {
    name: string;
    email: string;
    image?: string | null;
  };
}) {
  const router = useRouter();
  const { open } = useSidebar();

  const { width: windowWidth } = useWindowSize();

  return (
    <header className="sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5 md:px-2">
      <SidebarToggle />

      {(!open || windowWidth < 768) && (
        <Button
          className="order-2 ml-auto h-8 px-2 md:order-1 md:ml-0 md:h-fit md:px-2"
          onClick={() => {
            router.push("/");
            router.refresh();
          }}
          variant="outline"
        >
          <PlusIcon />
          <span className="md:sr-only">New Chat</span>
        </Button>
      )}

      {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          className="order-1 md:order-2"
          selectedVisibilityType={selectedVisibilityType}
        />
      )}
      <Button variant="outline">
        Test
      </Button>
      <Button
        asChild
        className="order-3 hidden px-2 md:ml-auto md:flex md:h-fit"
      >
        <Link
          href={"https://vercel.com/templates/next.js/nextjs-ai-chatbot"}
          rel="noreferrer"
          target="_noblank"
        >
          <VercelIcon size={16} />
          Deploy with Vercel
        </Link>
      </Button>

      {user && (
        <div className="order-4 ml-2">
          <UserMenu user={user} />
        </div>
      )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.chatId === nextProps.chatId &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType &&
    prevProps.isReadonly === nextProps.isReadonly &&
    prevProps.user?.email === nextProps.user?.email
  );
});
