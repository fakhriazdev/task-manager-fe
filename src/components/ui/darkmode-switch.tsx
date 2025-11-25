"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {Moon, Sun} from "lucide-react";

export default function DarkmodeSwitch() {
    const {setTheme, resolvedTheme } = useTheme();
    const [isDark, setIsDark] = useState(false);

    // Sync state on mount (karena next-themes resolvedTheme baru tersedia di client)
    useEffect(() => {
        if (resolvedTheme) {
            setIsDark(resolvedTheme === "dark");
        }
    }, [resolvedTheme]);

    const toggleTheme = (checked: boolean) => {
        setIsDark(checked);
        setTheme(checked ? "dark" : "light");
    };

    return (
        <div className="flex items-center justify-between m-2 gap-2">
            <Label htmlFor="dark-mode text-sm">
                {isDark ? <Sun size={"18"} />: <Moon size={"18"} /> }
            </Label>
            <Switch
                id="dark-mode"
                checked={isDark}
                onCheckedChange={toggleTheme}
            />
        </div>
    );
}
