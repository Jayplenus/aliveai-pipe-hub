import Link from "next/link"

export function Navbar() {
    return (
        <div className="border-b bg-background">
            <div className="flex h-16 items-center px-4 container mx-auto">
                <div className="mr-8 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2 font-bold text-xl">
                        AliveAI Sales Hub
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground">Dashboard</Link>
                        <Link href="/leads" className="transition-colors hover:text-foreground/80 text-foreground">Leads</Link>
                    </nav>
                </div>
                <div className="ml-auto flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-muted"></div>
                </div>
            </div>
        </div>
    )
}
