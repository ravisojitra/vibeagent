import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    BotIcon,
} from "@/constants/icons";

const navLinks = [
    { href: "#", label: "Community" },
    { href: "#", label: "Pricing" },
];

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
            <div className="flex h-14 items-center justify-between px-5">
                <div className="flex grow-1 basis-60 items-center">
                    <Link href="/" className="flex items-center ">
                        <BotIcon />
                        <span className="hidden font-bold sm:inline-block">Vibe Agent</span>
                    </Link>
                </div>
                <nav className="h-full grow-1 shrink-0 justify-center hidden lg:flex">
                    <div className="flex flex-row justify-center items-center gap-3 h-full">
                        {navLinks.map(({ href, label }) => (
                            <Link
                                key={label}
                                href={href}
                                className="transition-colors hover:text-foreground/80 text-foreground/60"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                </nav>
                <div className="flex grow-1 basis-60 justify-end items-center gap-3">
                    <Button variant="outline">Sign In</Button>
                    <Button>Get Started</Button>
                </div>
            </div>
        </header>
    );
}
