import Link from "next/link";
import {
    BotIcon,
    GitIcon,
    DiscordIcon,
    XIcon
} from "@/constants/icons";

const socialLinks = [
    { href: "#", icon: XIcon },
    { href: "#", icon: DiscordIcon },
    { href: "#", icon: GitIcon },
];

export function Footer() {
    return (
        <footer className="border-t border-border/40 text-background">
            <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex justify-between md:justify-start items-center gap-4 w-full md:w-auto">
                    <Link href="/" className="flex items-center space-x-2">
                        <BotIcon />
                        <span className="font-bold">Vibe Agent</span>
                    </Link>
                    <div className="flex items-center space-x-4">
                        {socialLinks.map(({ href, icon }, index) => {
                            const Icon = icon as React.ElementType;
                            return (
                                <Link
                                    key={'menu-item-' + index}
                                    href={href}
                                    className="cursor-pointer"
                                >
                                    <Icon size={16} />
                                </Link>
                            )
                        })}
                    </div>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
                    <Link
                        href="#"
                        className="text-sm hover:underline"
                    >
                        About
                    </Link>
                    <Link
                        href="#"
                        className="text-sm hover:underline"
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        href="#"
                        className="text-sm hover:underline"
                    >
                        Terms & Conditions
                    </Link>
                </div>
            </div>
        </footer>
    );
}
